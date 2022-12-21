import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { catchError, filter, from, map, mergeAll, mergeMap, Observable, of, Subject, tap, toArray } from 'rxjs';
import { Media } from 'src/chat/models/media/media';

import { MediaMetaDataService, YouTubeGetID } from '../crawlers/media-metadata.service';

const MAX_CONCURRENT_SCRAPES = 5;
const ONE_HOUR = 3600;

@Injectable()
export class YoutubeRssService {
  private readonly logger = new Logger(YoutubeRssService.name);

  YoutubeRssResultsSubject = new Subject<{ channelName: string, results: Media[] }>()

  private youtubeCreatorTargetsPerChannel: {
    channelName: string;
    youtubers: string[];
  }[] = [
    {
      channelName: 'The Daily Scraper',
      youtubers: ['serpentZA'],
    },
  ];

  constructor(
    private httpService: HttpService,
    private ytService: MediaMetaDataService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS, { name: 'bidaily_scraper' })
  scrapeSubredditsJob() {
    this.logger.debug('Fetching RSS updates');

    const youtubers = this.youtubeCreatorTargetsPerChannel.reduce(
      (it, it2) => it.concat(it2.youtubers),
      [] as string[],
    );
    const uniqSubreddits = [...new Set([...youtubers])];

    const scrapeWorkers = uniqSubreddits.map((youtuber) =>
      this.geRssUpdatesForYoutuber(youtuber).pipe(
        // todo save the origin and datefound somewhere
        map((urls) => urls.map((url) => YouTubeGetID(url))),
        mergeMap(
          (ids) =>
            ids.map((id) =>
              this.ytService
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
                      `scrapeSubredditsJob failed to get YT metadata for ${id}`,
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
          this.youtubeCreatorTargetsPerChannel.forEach(({ channelName, youtubers }) => {
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
          });
        },
      });
  }

  geRssUpdatesForYoutuber(youtuber: string): Observable<any> { // todo fix type
    return this.httpService.get(this.buildRssUrl(youtuber)).pipe(
      catchError((err) => {
        this.logger.error(`Fetch RSS updates failed for ${youtuber}`, err);
        return of([]);
      }),
    );
  }

  buildRssUrl(youtuber: string): string {
    throw new Error('Method not implemented.');
  }
}
