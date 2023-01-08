import { Logger } from "@nestjs/common";
import { BehaviorSubject, merge, of, Subject, Subscription, timer } from "rxjs";
import { catchError, filter, map, mapTo, mergeAll, mergeMap, tap, toArray, withLatestFrom } from "rxjs/operators";

import { Member } from "src/domain/entity/Member";
import { RedditCrawlerService } from "src/tv/crawlers/reddit-crawler.service";
import { YouTubeGetID, MediaMetaDataService } from "src/tv/crawlers/media-metadata.service";
import { Feed } from "../feed/feed";
import { Media } from "../media/media";
import { Playlist, UpdatePlayingStateCommand } from "../playlist/playlist";
import { YoutubeRssService } from "src/tv/youtube-rss/youtube-rss.service";

const oneSecond = 1000;

interface LoopState {
    currentTime: number
    media: Media
    isPlaying: boolean
}

enum LoopActions {
    play,
    stop,
    seek,
    timer,
}

interface LoopEffect {
    action: LoopActions,
    seekTo?: number
    media?: Media
}

export class AutomatedRoom {

    id: string;
    name: string;
    description: string;
    members: Member[] = [];
    messages: Feed = new Feed();
    currentPlaylist: Playlist = new Playlist('default', null, new Date());
    subredditsToScrape: string[];
    youtubersOfInterest: string[];

    leader = null
    owner = null
    moderators = []

    private readonly _playMediaSubject = new Subject<Media>();
    private readonly _stopPlayingSubject = new Subject<void>();
    private readonly _seekSubject = new Subject<number>(); // yet unused

    nowPlayingSubject = new Subject<{ media: Media, time: number }>();

    loopStateSubject: BehaviorSubject<LoopState> = new BehaviorSubject({ currentTime: 0, media: null, isPlaying: false } as LoopState);

    scrapeResultsSubscription = this.redditScraper.crawlResultsSubject.pipe(
        filter(it => it.channelName === this.name),
        map(it => it.results),
        filter(results => results.length > 0),
        tap(() => this.stopPlaying()),
        tap(() => this.currentPlaylist.clear()),
        tap(results => this.addBulkToPlaylist(results)),
        tap(() => this.startPlaying()),
    ).subscribe(
        res => this.logger.log(`${res.length} URLs found by scrape`),
        err => this.logger.error("scrape job error occured!", err),
    )
 
    rssUpdateResultsSubscription = this.youtubeRss.YoutubeRssResultsSubject.pipe(
        filter(it => it.channelName === this.name),
        map(it => it.results),
        filter(results => results.length > 0),
        tap(() => this.stopPlaying()),
        tap(() => this.currentPlaylist.clear()),
        tap(results => this.addBulkToPlaylist(results)),
        tap(() => this.startPlaying()),
    ).subscribe(
        res => this.logger.log(`${res.length} URLs found by scrape`),
        err => this.logger.error("scrape job error occured!", err),
    )

    private readonly logger = new Logger(AutomatedRoom.name);

    broadcastLoopSubscription = merge(
        timer(0, oneSecond).pipe(mapTo(
            ({ action: LoopActions.timer } as LoopEffect))),
        this._playMediaSubject.pipe(map((media) =>
            ({ action: LoopActions.play, media: media } as LoopEffect))),
        this._stopPlayingSubject.pipe(mapTo(
            ({ action: LoopActions.stop } as LoopEffect))),
        this._seekSubject.pipe(map((seconds) =>
            ({ action: LoopActions.seek, seekTo: seconds } as LoopEffect))),
    ).pipe(
        withLatestFrom(this.loopStateSubject),
        map(([effect, currentState]) => {

            const { isPlaying } = currentState;
            const { media: nowPlayingMedia, time: nowPlayingTime } = this.currentPlaylist.nowPlaying();
            const { action, seekTo: effectSeekTo, media: effectMedia } = effect;

            const newState = { ...currentState } as LoopState;

            switch (action) {
                case LoopActions.play:
                    this.currentPlaylist.updateNowPlaying(effectMedia.url, 0);

                    newState.isPlaying = true;

                    newState.currentTime = 0
                    newState.media = effectMedia
                    break;

                case LoopActions.stop:
                    this.currentPlaylist.stopPlaying();

                    newState.isPlaying = false;

                    newState.currentTime = 0
                    newState.media = null
                    break;

                case LoopActions.seek:

                    if (effectSeekTo <= nowPlayingMedia.length) {
                        this.currentPlaylist.updateCurrentTime(effectSeekTo);

                        newState.currentTime = effectSeekTo
                    }
                    break;

                case LoopActions.timer:
                    if (isPlaying) {
                        // update time
                        this.currentPlaylist.updateCurrentTime(nowPlayingTime + 1);

                        newState.currentTime = currentState.currentTime + 1

                        if (nowPlayingTime + 1 >= nowPlayingMedia.length) {
                            // play next and reset time
                            this.currentPlaylist.playNext()

                            const { media } = this.currentPlaylist.nowPlaying()

                            newState.currentTime = 0;
                            newState.media = media;
                        }
                    }
                    break;
                default:
                    console.log('invalid action', action);
                    break;
            }

            this.loopStateSubject.next(newState);

            return newState;
        }),
        tap(({ isPlaying,/* currentTime, media */ }) => {
            if (isPlaying) {
                this.nowPlayingSubject.next(this.currentPlaylist.nowPlaying())
            }
        }),
    ).subscribe();

    scraperSubscriptions: Subscription[];

    
    /**
     * Can be decimal between 0 & 1. 
     * Used to calculate the amount of members to voteskip before next media plays.
     * 
     * Example: `0.4` being 40%
     */
    private minRequiredPercentageOfVoteSkippers = 0.5;

    public get votesNeededForSkip() : number {
        return Math.round(this.members.length * this.minRequiredPercentageOfVoteSkippers);
    }

    voteSkipCount = 0;
    voterIds: string[] = [];

    constructor(
        name: string,
        description: string,
        private redditScraper: RedditCrawlerService,
        private youtubeRss: YoutubeRssService,
        private ytService: MediaMetaDataService,
        subredditsToScrape: string[],
        youtubersOfInterest: string[],
    ) {
        this.name = name
        this.description = description
        this.id = name
        this.subredditsToScrape = subredditsToScrape
        this.youtubersOfInterest = youtubersOfInterest

        this.redditScraper.registerTargetsForChannel(this.name, subredditsToScrape);
        this.youtubeRss.registerTargetsForChannel(this.name, youtubersOfInterest);
    }

    startPlaying() {
        if (this.currentPlaylist.length() > 0) {
            if (!this.currentPlaylist.nowPlaying()?.media) {
                this.currentPlaylist.activeEntryIndex = 0;
                this._playMediaSubject.next(this.currentPlaylist.nowPlaying().media);
            }
        }
    }

    stopPlaying() {
        this._stopPlayingSubject.next();
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

            this.removeMemberSkipVote(member);
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

    playNext(): void {
        this.currentPlaylist.playNext();
    }

    voteSkip(member: Member) {

        if (this.voterIds.some(id => id === member.id)) {
            return;
        }

        this.voterIds.push(member.id);
        this.voteSkipCount = this.voteSkipCount + 1;

        if (this.voteSkipCount >= this.votesNeededForSkip) {
            this.playNext();
            this.voterIds = [];
            this.voteSkipCount = 0;
        }
    }

    addBulkToPlaylist(bulk: Media[]) {
        bulk.forEach(media => this.currentPlaylist.add(media, null));
    }

    removeMediaFromPlaylist(member: Member, url: string) {
        if (this.selectFromMembers(member)?.isAdmin) {
            const target = this.currentPlaylist.selectFromQueue(url);
            if (!target) {
                return
            }
            this.currentPlaylist.remove(target.media);
        }
    }

    startSubredditScraperRun(subreddit: string) {
        this.startScrapeSubscriptions([subreddit]);
    }

    stopSubredditScraperRun() {
        this.stopScrapeSubscriptions();
    }

    handleUnplayableMedia(media: Media): void {
        this.playNext();
        this.currentPlaylist.remove(media);
    }

    private removeMember(member: Member) {
        const index = this.members.findIndex(m => m.id === member.id);

        if (index > -1) {
            this.members = [...this.members.slice(0, index), ...this.members.slice(index + 1)];
        }
    }

    private removeMemberSkipVote(member: Member) {
        if (this.voterIds.includes(member.id)) {
            this.voterIds = this.voterIds.filter(id => id != member.id);
        }
    }

    private selectFromMembers(member: Member) {
        return this.members.find(m => m.id === member.id);
    }

    private startScrapeSubscriptions(subreddits: string[]) {
        this.scraperSubscriptions = subreddits.map(subreddit =>
            this.redditScraper.scrapeYTurlsFromSubreddit(subreddit).pipe(
                // todo save the origin and datefound somewhere
                map(urls => urls.map(url => YouTubeGetID(url))),
                mergeMap(ids => ids.map(id =>
                    this.ytService.getVideoMetaDataWithRetry(id).pipe(
                        filter(it => !it.isLive),
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