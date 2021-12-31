import { Injectable, HttpService, Logger } from '@nestjs/common';

import { map, tap, catchError, filter, mergeAll, mergeMap, toArray } from 'rxjs/operators';
import { from, of, OperatorFunction, Subject } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Media } from 'src/chat/models/media/media';
import { YouTubeGetID, YoutubeV3Service } from './youtube-v3.service';

const MAX_CONCURRENT_SCRAPES = 5;
const ONE_HOUR = 60000;

@Injectable()
export class RedditCrawlerService {

    crawlResultsSubject = new Subject<{ channelName: string, results: Media[] }>()

    private readonly logger = new Logger(RedditCrawlerService.name);

    private crawlTargetsPerChannel: { channelName: string, subreddits: string[] }[] = [
        {
            channelName: 'The Daily Scraper',
            subreddits: [
                'anime',
            ]
        }
    ];

    constructor(
        private httpService: HttpService,
        private ytService: YoutubeV3Service
    ) { }

    registerTargetsForChannel(channelName: string, subreddits: string[]) {
        let registeredEntry = this.crawlTargetsPerChannel
            .find(target => target.channelName === channelName)

        if (registeredEntry) {
            registeredEntry.subreddits = [...new Set([...registeredEntry.subreddits, ...subreddits])];
        } else {
            this.crawlTargetsPerChannel.push({
                channelName,
                subreddits
            })
            registeredEntry = this.crawlTargetsPerChannel
            .find(target => target.channelName === channelName)
        }

        this.logger.log(`Registered targets for ${channelName} (${registeredEntry.subreddits.length}):\n ${registeredEntry.subreddits.toString()} `)

    }

    scrapeYTurlsFromSubreddit(subredditName: string, category: 'all' | 'new' = 'all') {
        return this.httpService.get(this.buildSubredditUrl(subredditName, category)).pipe(
            this.filterForMedia(),
            catchError(err => { console.error(err); return of(["Error fetching"]) })
        );
    }

    @Cron(CronExpression.EVERY_30_SECONDS, { name: 'bidaily_scraper' })
    scrapeSubredditsJob() {

        this.logger.debug('Starting scrapers');

        const subreddits = this.crawlTargetsPerChannel.reduce((it, it2) => it.concat(it2.subreddits), [] as string[])
        const uniqSubreddits = [...new Set([...subreddits])]

        const scrapeWorkers = uniqSubreddits.map(subreddit =>
            this.scrapeYTurlsFromSubreddit(subreddit).pipe(
                // todo save the origin and datefound somewhere
                map(urls => urls.map(url => YouTubeGetID(url))),
                mergeMap(ids => ids.map(id =>
                    this.ytService.getVideoMetaData(id).pipe(
                        map((data) => ({ url: `https://www.youtube.com/watch?v=${id}`, ...data })),
                        map(({ url, title, duration }) => ({ origin: subreddit, media: new Media(url, title, duration) })),
                        catchError(() => of(null))
                    ).pipe(
                        filter((response) => !!response),
                        map(entry => entry as { origin: string, media: Media })
                    )
                ), 10),
                mergeAll(),
                toArray(),
                map(entries => entries.filter(entry => entry.media.length < ONE_HOUR)
                )));

        let allResults: { origin: string, media: Media }[] = [];

        from(scrapeWorkers).pipe(
            mergeAll(MAX_CONCURRENT_SCRAPES),
        ).pipe(
            tap(partialResults => {
                this.logger.log(partialResults.length + ' URLs found (partialResults)')
            })
        ).subscribe(
            partialResults => {
                allResults = allResults.concat(partialResults);
            },
            err => {
                // handle error
                this.logger.error('err while scraping ..', err)
            },
            () => {
                this.crawlTargetsPerChannel.forEach(({ channelName, subreddits }) => {
                    const results = allResults
                        .filter(res => subreddits.includes(res.origin))
                        .reduce((mediaList, originAndMedia) => mediaList.concat(originAndMedia.media), [] as Media[]);
                    
                    this.logger.log(`ScrapeJob for ${channelName} found ${results.length} results`)

                    this.crawlResultsSubject.next({ channelName, results });
                })

            }
        );
    }

    private filterForMedia(): OperatorFunction<any, string[]> {
        return (source) => source.pipe(
            map(response => response.data.data.children),
            map(data => data.filter(ch => ch.data.media !== null)),
            map(allMediaEntries => allMediaEntries.filter(entry => entry.data.media.type === "youtube.com")),
            map((youtubeEntries: any[]) => youtubeEntries.map(entry => entry.data.url)),
        );
    }

    private buildSubredditUrl(subreddit: string, subcategory: string) {
        if (subcategory === "all") {
            return `https://www.reddit.com/r/${subreddit}.json`
        }
        return `https://www.reddit.com/r/${subreddit}/${subcategory}.json`
    }
}
