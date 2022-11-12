import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RedditCrawlerService } from "../crawlers/reddit-crawler.service";
import { CrawlSubredditCommand } from "../models/commands/crawl-subreddit.command";
import { CrawlSubredditResult } from "../models/results/crawl-subreddit.result";

@QueryHandler(CrawlSubredditCommand)
export class CrawlSubredditHandler implements IQueryHandler<CrawlSubredditCommand, Observable<CrawlSubredditResult>> {
    constructor(private redditCrawler: RedditCrawlerService) { }

    async execute({ name }: CrawlSubredditCommand) {
        return this.redditCrawler.scrapeYTurlsFromSubreddit(name).pipe(
            map(res => ({ name, ytUrls: res })));
    }
}