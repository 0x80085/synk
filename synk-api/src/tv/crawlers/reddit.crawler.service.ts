import { Injectable, HttpService } from '@nestjs/common';

import { map, tap, catchError } from 'rxjs/operators';
import { of, OperatorFunction } from 'rxjs';

@Injectable()
export class RedditCrawlerService {

    constructor(private httpService: HttpService) { }

    scrapeYTurlsFromSubreddit(subredditName: string, category = 'all') {
        console.log('filtering URL::' + subredditName);

        return this.httpService.get(this.buildSubredditUrl(subredditName, category)).pipe(
            this.filterForMedia(),
            tap(result => console.log(result)),
            catchError(err => { console.error(err); return of(["Error fetching"]) })
        );
    }

    filterForMedia(): OperatorFunction<any, string[]> {
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
