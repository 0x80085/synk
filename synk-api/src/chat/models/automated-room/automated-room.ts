import { of, Subject, Subscription, timer } from "rxjs";
import { catchError, filter, map, mergeAll, mergeMap, take, tap, toArray } from "rxjs/operators";

import { Member } from "src/domain/entity/Member";
import { RedditCrawlerService } from "src/tv/crawlers/reddit.crawler.service";
import { YouTubeGetID, YoutubeV3Service } from "src/tv/crawlers/youtube-v3.service";
import { Feed } from "../feed/feed";
import { Media } from "../media/media";
import { Playlist, UpdatePlayingStateCommand } from "../playlist/playlist";

export class AutomatedRoom {

    id: string;
    name: string;
    members: Member[] = [];
    messages: Feed = new Feed();
    currentPlaylist: Playlist = new Playlist('default', null, new Date());

    leader = null
    owner = null
    moderators = []

    timer = timer(0, 1000);
    timerSubscription: Subscription = null;

    nowPlayingSubject = new Subject<{ media: Media, time: number }>();
    scraperSubscriptions: Subscription[];

    constructor(name: string, private redditScraper: RedditCrawlerService, private ytService: YoutubeV3Service) {
        this.name = name
        this.id = name
    }

    startPlaying() {
        if (this.currentPlaylist.length() > 0) {
            this.currentPlaylist.activeEntryIndex = 1;
            this.startTimer();
        }
    }

    stopPlaying() {
        this.stopTimer();
    }

    enter(member: Member) {
        // this.throwIfMemberIsBanned(member); // TODO
        if (!this.selectFromMembers(member)) {
            this.members.push(member);
            this.messages.post({ author: { username: "" } as any, content: `${member.username} joined`, isSystemMessage: true })
        }
    }

    leave(member: Member) {
        const toBeRemoved = this.selectFromMembers(member);

        if (toBeRemoved) {

            this.removeMember(member);
            this.messages.post({ author: { username: '' } as Member, content: `${member.username} left.`, isSystemMessage: true });

        } else {
            console.log(`LEAVE ROOM - ${member.username} not found, not removed.`);
        }
    }

    addMessage(member: Member, content: string) {
        this.messages.post({ author: member, content, isSystemMessage: false })
    }

    updateNowPlaying({ url, time }: UpdatePlayingStateCommand): UpdatePlayingStateCommand {
        return this.currentPlaylist.updateNowPlaying(url, time);
    }

    clearPlaylist() {
        this.currentPlaylist.clear()
    }

    addBulkToPlaylist(bulk: Media[]) {
        bulk.forEach(media => this.currentPlaylist.add(media, null))
    }

    startSubredditScraperRun(subreddit: string) {
        this.startScrapeSubscriptions([subreddit]);
    }
    
    stopSubredditScraperRun() {
        this.stopScrapeSubscriptions();
    }

    private removeMember(member: Member) {
        var index = this.members.findIndex(m => m.id === member.id);

        if (index > -1) {
            this.members = [...this.members.slice(0, index), ...this.members.slice(index + 1)];
        }
    }

    private selectFromMembers(member: Member) {
        return this.members.find(m => m.id === member.id);
    }

    private startTimer() {
        this.stopTimer();

        const { time, media } = this.currentPlaylist.nowPlaying();

        this.timerSubscription = this.timer.pipe(
            tap((seconds) => this.updateNowPlaying({ url: media.url, time: seconds })),
            tap(() => this.nowPlayingSubject.next(this.currentPlaylist.nowPlaying())),
            take(media.length)
        ).subscribe()
    }

    private stopTimer() {
        if (this.timerSubscription != null) {
            this.timerSubscription.unsubscribe();
        }
    }

    private startScrapeSubscriptions(subreddits: string[]) {
        this.scraperSubscriptions = subreddits.map(subreddit =>
            this.redditScraper.scrapeYTurlsFromSubreddit(subreddit, "new").pipe(
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
                tap(entries => {
                    entries.forEach(entry => this.currentPlaylist.add(entry, null));
                })
            ).subscribe())
    }

    private stopScrapeSubscriptions() {
        this.scraperSubscriptions.forEach(sub => sub.unsubscribe())
        this.scraperSubscriptions = null;
    }
}