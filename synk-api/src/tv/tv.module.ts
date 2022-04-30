import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { RedditController } from './controllers/reddit.controller';
import { RedditCrawlerService } from './crawlers/reddit.crawler.service';
import { YoutubeV3Service } from './crawlers/youtube-v3.service';
import { ScrapeJobSchedulerService } from './services/scrape-job-scheduler.service';

import { CqrsModule } from '@nestjs/cqrs';
import { CrawlSubredditHandler } from './handlers/crawl-subreddit.handler';

export const QueryCommandHandlers = [CrawlSubredditHandler];

@Module({
    imports: [
        HttpModule,
        CqrsModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [
        RedditController
    ],
    providers: [
        RedditCrawlerService,
        ScrapeJobSchedulerService,
        YoutubeV3Service,
        ...QueryCommandHandlers,
    ],
    exports: [
        YoutubeV3Service,
        RedditCrawlerService
    ]
})
export class TvModule { }
