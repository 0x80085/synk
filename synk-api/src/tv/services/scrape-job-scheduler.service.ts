import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RedditCrawlerService } from 'src/tv/crawlers/reddit.crawler.service';
import { CronJob } from 'cron';

export enum Status {
    error = 'error',
    busy = 'busy',
    completed = 'completed',
    not_started = ' not started',
}

@Injectable()
export class ScrapeJobSchedulerService {

    constructor(private scheduler: SchedulerRegistry, private redditScraper: RedditCrawlerService) { }

    scheduleRecurringRedditScrapeJob(subreddit: string, seconds = 60) {
        const jobId = Math.random().toString().replace('.', '');
        const jobUrl = `http://localhost:3000/scapeddit/${jobId}`;

        const job = new CronJob(`${seconds} * * * * *`, () => this.redditScraper.scrapeYTurlsFromSubreddit(subreddit));

        this.scheduler.addCronJob(jobId, job);
        job.start();

        return {
            jobId,
            jobUrl
        };
    }

    scheduleSingleRedditScrapeRun(subreddit: string) {
        const jobId = Math.random().toString().replace('.', '');
        const jobUrl = `http://localhost:3000/scapeddit/${jobId}`;

        const operation = () => this.redditScraper.scrapeYTurlsFromSubreddit(subreddit);
        const oneMinute = 1000 * 60;
        const timeout = setTimeout(operation, oneMinute);
        this.scheduler.addTimeout(jobId, timeout);

        return {
            jobId,
            jobUrl
        };
    }

    getJobDetails(jobId: string): CronJob {
        const data = this.scheduler.getCronJob(jobId);
        return data;
    }

    getAllJobs(): Map<string, any> {
        const data = this.scheduler.getCronJobs();
        return data;
    }

    deleteJob(jobId: string) {
        this.scheduler.deleteCronJob(jobId);
    }
}
