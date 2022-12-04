import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { map, tap, catchError, filter, mergeAll, mergeMap, toArray } from 'rxjs/operators';
import { from, of, OperatorFunction, Subject } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Media } from 'src/chat/models/media/media';
import { YouTubeGetID, MediaMetaDataService } from './media-metadata.service';

const MAX_CONCURRENT_SCRAPES = 5;
const ONE_HOUR = 3600;

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
        private ytService: MediaMetaDataService
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
            catchError(err => { 
                this.logger.error(`scrapeYTurlsFromSubreddit failed to scrape for ${subredditName}`, err); 
                return of([]); 
            })
        );
    }

    @Cron(CronExpression.EVERY_6_HOURS, { name: 'bidaily_scraper' })
    scrapeSubredditsJob() {

        this.logger.debug('Starting scrapers');

        const subreddits = this.crawlTargetsPerChannel.reduce((it, it2) => it.concat(it2.subreddits), [] as string[])
        const uniqSubreddits = [...new Set([...subreddits])]

        const scrapeWorkers = uniqSubreddits.map(subreddit =>
            this.scrapeYTurlsFromSubreddit(subreddit).pipe(
                // todo save the origin and datefound somewhere
                map(urls => urls.map(url => YouTubeGetID(url))),
                mergeMap(ids => ids.map(id =>
                    this.ytService.getVideoMetaDataWithRetry(id).pipe(
                        map((data) => ({ url: `https://www.youtube.com/watch?v=${id}`, ...data })),
                        map(({ url, title, duration }) => ({ origin: subreddit, media: new Media(url, title, duration) })),
                        catchError((error) =>{
                            this.logger.error(`scrapeSubredditsJob failed to get YT metadata for ${id}`, error) 
                            return of(null)
                        })
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
        ).subscribe({
            next: partialResults => {
                allResults = allResults.concat(partialResults);
            },
            error: err => {
                this.logger.error('err while scraping ..', err)
            },
            complete: () => {
                this.crawlTargetsPerChannel.forEach(({ channelName, subreddits }) => {
                    const results = allResults
                        .filter(res => subreddits.includes(res.origin))
                        .reduce((mediaList, originAndMedia) => mediaList.concat(originAndMedia.media), [] as Media[]);

                    this.logger.log(`ScrapeJob for ${channelName} found ${results.length} results`)

                    this.crawlResultsSubject.next({ channelName, results });
                })

            }
        });
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
