import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { RedditController } from './controllers/reddit.controller';
import { RedditCrawlerService } from './crawlers/reddit-crawler.service';
import { MediaMetaDataService } from './crawlers/media-metadata.service';
import { ScrapeJobSchedulerService } from './services/scrape-job-scheduler.service';

import { CqrsModule } from '@nestjs/cqrs';
import { CrawlSubredditHandler } from './handlers/crawl-subreddit.handler';
import { YoutubeRssService } from './youtube-rss/youtube-rss.service';

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
        MediaMetaDataService,
        ...QueryCommandHandlers,
        YoutubeRssService,
    ],
    exports: [
        MediaMetaDataService,
        RedditCrawlerService,
        YoutubeRssService,
    ]
})
export class TvModule { }
