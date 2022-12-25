import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  catchError,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  of,
  Subject,
  tap,
  toArray,
} from 'rxjs';
import { Media } from 'src/chat/models/media/media';
import { getRandom } from 'src/util/getRandom';

import { MediaMetaDataService } from '../crawlers/media-metadata.service';

const MAX_CONCURRENT_SCRAPES = 5;
const ONE_HOUR = 3600;

@Injectable()
export class YoutubeRssService {
  private readonly logger = new Logger(YoutubeRssService.name);

  YoutubeRssResultsSubject = new Subject<{
    channelName: string;
    results: Media[];
  }>();

  private youtubeCreatorTargetsPerChannel: {
    channelName: string;
    youtubers: string[];
  }[] = [
    {
      channelName: 'The Daily Scraper',
      youtubers: [],
    },
  ];

  constructor(
    private httpService: HttpService,
    private metaDataService: MediaMetaDataService,
  ) {}

  @Cron(CronExpression.EVERY_WEEK, { name: 'weekly_rss_updater' })
  fetchRssUpdatesJob() {
    this.logger.debug('Fetching RSS updates');

    const youtubers = this.youtubeCreatorTargetsPerChannel.reduce(
      (it, it2) => it.concat(it2.youtubers),
      [] as string[],
    );
    const uniqSubreddits = [...new Set([...youtubers])];

    const scrapeWorkers = uniqSubreddits.map((youtuber) =>
      this.geRssUpdatesForYoutuber(youtuber).pipe(
        map((response) => this.parseToYoutubeIds(response)),
        mergeMap(
          (ids) =>
            ids.map((id) =>
              this.metaDataService
                .getVideoMetaDataWithRetry(id)
                .pipe(
                  map((data) => ({
                    url: `https://www.youtube.com/watch?v=${id}`,
                    ...data,
                  })),
                  map(({ url, title, duration }) => ({
                    origin: youtuber,
                    media: new Media(url, title, duration),
                  })),
                  catchError((error) => {
                    this.logger.error(
                      `fetchRssUpdatesJob failed to get YT metadata for ${id}`,
                      error,
                    );
                    return of(null);
                  }),
                )
                .pipe(
                  filter((response) => !!response),
                  map((entry) => entry as { origin: string; media: Media }),
                ),
            ),
          10,
        ),
        mergeAll(),
        toArray(),
        map((entries) =>
          entries.filter((entry) => entry.media.length < ONE_HOUR),
        ),
      ),
    );

    let allResults: { origin: string; media: Media }[] = [];

    from(scrapeWorkers)
      .pipe(mergeAll(MAX_CONCURRENT_SCRAPES))
      .pipe(
        tap((partialResults) => {
          this.logger.log(
            partialResults.length + ' URLs found (partialResults)',
          );
        }),
      )
      .subscribe({
        next: (partialResults) => {
          allResults = allResults.concat(partialResults);
        },
        error: (err) => {
          this.logger.error('err while scraping ..', err);
        },
        complete: () => {
          this.youtubeCreatorTargetsPerChannel.forEach(
            ({ channelName, youtubers }) => {
              const results = allResults
                .filter((res) => youtubers.includes(res.origin))
                .reduce(
                  (mediaList, originAndMedia) =>
                    mediaList.concat(originAndMedia.media),
                  [] as Media[],
                );

              this.logger.log(
                `ScrapeJob for ${channelName} found ${results.length} results`,
              );

              this.YoutubeRssResultsSubject.next({ channelName, results });
            },
          );
        },
      });
  }

  private parseToYoutubeIds(response: any) {
    const ytIdRegex = /(<yt:videoId>)(?<videoId>.+)(<\/yt:videoId>)/gim;
    const videoIds = [];
    for (const match of response.data.matchAll(ytIdRegex)) {
      videoIds.push(match.groups.videoId);
    }
    return videoIds;
  }

  registerTargetsForChannel(channelName: string, youtubers: string[]) {
    let registeredEntry = this.youtubeCreatorTargetsPerChannel.find(
      (target) => target.channelName === channelName,
    );

    if (registeredEntry) {
      registeredEntry.youtubers = [
        ...new Set([...registeredEntry.youtubers, ...youtubers]),
      ];
    } else {
      this.youtubeCreatorTargetsPerChannel.push({
        channelName,
        youtubers,
      });
      registeredEntry = this.youtubeCreatorTargetsPerChannel.find(
        (target) => target.channelName === channelName,
      );
    }

    this.logger.log(
      `Registered targets for ${channelName} (${
        registeredEntry.youtubers.length
      }):\n ${registeredEntry.youtubers.toString()} `,
    );
  }

  geRssUpdatesForYoutuber(youtuber: string) {
    // todo fix type
    return this.httpService.get(this.buildRssUrl(youtuber)).pipe(
      catchError((err) => {
        this.logger.error(`Fetch RSS updates failed for ${youtuber}`, err);
        return of({ data: '' }); // fake response
      }),
    );
  }

  buildRssUrl(channelId: string): string {
    const url = `${getRandom(
      this.metaDataService.invidiousInstanceUrls,
    )}/feed/channel/${channelId}`;
    this.logger.log(`fetching RSS updates at ${url}`);

    return url;
  }
}
