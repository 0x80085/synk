import { Get, Controller, Post, Delete, Param, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Observable, of } from "rxjs";
import { AdminGuard } from "src/admin/guards/admin.guard";
import { CrawlSubredditCommand } from "src/tv/models/commands/crawl-subreddit.command";

import { CrawlSubredditResult } from "src/tv/models/results/crawl-subreddit.result";
import { ScrapeJobSchedulerService } from "src/tv/services/scrape-job-scheduler.service";

@ApiTags('Scraping')
@Controller('scrape-reddit')
export class RedditController {

    constructor(
        private queryBus: QueryBus,
        private scrapeJobScheduler: ScrapeJobSchedulerService
    ) { }

    @Get(':subreddit')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'subreddit' })
    @ApiOperation({ summary: 'Scrape subreddit and return results in this request reponse' })
    async getRedditUrls(@Param('subreddit') subreddit = 'videos') {
        return await this.queryBus.execute<CrawlSubredditCommand, CrawlSubredditResult>(
            new CrawlSubredditCommand(subreddit)
        );
    }

    @Get('/jobs/:jobId')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'jobId' })
    @ApiOperation({ summary: 'Get details from a scheduled scrape job' })
    getScrapeJobDetails(@Param('jobId') jobId: string): Observable<any> {
        const job = this.scrapeJobScheduler.getJobDetails(jobId)
        if (job.lastDate()) {
            return of({ note: 'find way to store and access results ' });
        } else {
            return of(job);
        }
    }

    @Get('/jobs')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Get list of all running jobs' })
    getListOfJobs(): Observable<Map<string, any>> {
        const jobs = this.scrapeJobScheduler.getAllJobs();
        return of(jobs);
    }

    @Post('/jobs/cron/:subreddit')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'subreddit' })
    @ApiOperation({ summary: 'Create a new recurring scrape job' })
    createRecurringScrapeJob(@Param('subreddit') subreddit: string): Observable<{ jobUrl: string, jobId: string }> {
        const jobData = this.scrapeJobScheduler.scheduleRecurringRedditScrapeJob(subreddit);
        return of(jobData);
    }

    @Post('/jobs/once')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'subreddit' })
    @ApiOperation({ summary: 'Create a new one-time scrape job' })
    createOneScrapeJob(@Param('subreddit') subreddit: string): Observable<{ jobUrl: string, jobId: string }> {
        const jobData = this.scrapeJobScheduler.scheduleSingleRedditScrapeRun(subreddit);
        return of(jobData);
    }

    @Delete('/jobs/:jobId')
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'jobId' })
    @ApiOperation({ summary: 'Delete a scheduled scrape job' })
    deleteScrapeJob(@Param('jobId') jobId: string): Observable<boolean> {
        this.scrapeJobScheduler.deleteJob(jobId);
        return of(true);
    }

}
