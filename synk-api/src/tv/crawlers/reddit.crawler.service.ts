import { Injectable, HttpService, Logger } from '@nestjs/common';

import { map, tap, catchError, filter, mergeAll, mergeMap, toArray } from 'rxjs/operators';
import { from, of, OperatorFunction, Subject } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Media } from 'src/chat/models/media/media';
import { YouTubeGetID, YoutubeV3Service } from './youtube-v3.service';

@Injectable()
export class RedditCrawlerService {

    scrapeSubredditsJobSubject = new Subject<Media[]>()

    private readonly logger = new Logger(RedditCrawlerService.name);

    constructor(
        private httpService: HttpService,
        private ytService: YoutubeV3Service
    ) { }

    scrapeYTurlsFromSubreddit(subredditName: string, category: 'all' | 'new' = 'all') {
        return this.httpService.get(this.buildSubredditUrl(subredditName, category)).pipe(
            this.filterForMedia(),
            catchError(err => { console.error(err); return of(["Error fetching"]) })
        );
    }
    // @Cron(CronExpression.EVERY_12_HOURS, { name: 'bidaily_scraper' })

    @Cron(CronExpression.EVERY_12_HOURS, { name: 'bidaily_scraper' })
    scrapeSubredditsJob() {

        this.logger.debug('Starting scrapers');

        const subreddits = [
            'videos',
            'btc',
            'bitcoin',
            'cryptocurrencies',
            'anime',
            'ps5',
            'nintendo',
            'publicfreakout',
            'mealtimevideos',
        ];

        const scrapeWorkers = subreddits.map(subreddit =>
            this.scrapeYTurlsFromSubreddit(subreddit).pipe(
                // todo save the origin and datefound somewhere
                map(urls => urls.map(url => YouTubeGetID(url))),
                mergeMap(ids => ids.map(id =>
                    this.ytService.getVideoMetaData(id).pipe(
                        map((data) => ({ url: `https://www.youtube.com/watch?v=${id}`, ...data })),
                        map(({ url, title, duration }) => new Media(url, title, duration)),
                        catchError(() => of(null))
                    ).pipe(
                        filter((response) => !!response),
                        map(media => media as Media)
                    )
                ), 10),
                mergeAll(),
                toArray(),
            )
        );

        const MAX_CONCURRENT_SCRAPES = 5;
        let allResults: Media[] = [];

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
                this.logger.log(allResults.length + ' URLs found (allResults)')
                this.scrapeSubredditsJobSubject.next(allResults);
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
