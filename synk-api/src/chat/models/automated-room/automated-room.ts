import { BehaviorSubject, merge, Observable, of, ReplaySubject, Subject, Subscription, timer } from "rxjs";
import { catchError, exhaustMap, filter, finalize, map, mapTo, mergeAll, mergeMap, repeatWhen, switchMap, take, takeUntil, tap, toArray, withLatestFrom } from "rxjs/operators";

import { Member } from "src/domain/entity/Member";
import { RedditCrawlerService } from "src/tv/crawlers/reddit.crawler.service";
import { YouTubeGetID, YoutubeV3Service } from "src/tv/crawlers/youtube-v3.service";
import { Feed } from "../feed/feed";
import { Media } from "../media/media";
import { Playlist, UpdatePlayingStateCommand } from "../playlist/playlist";

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
    members: Member[] = [];
    messages: Feed = new Feed();
    currentPlaylist: Playlist = new Playlist('default', null, new Date());

    leader = null
    owner = null
    moderators = []

    readonly _playMediaSubject = new Subject<Media>();
    readonly _stopPlayingSubject = new Subject<void>();
    readonly _seekSubject = new Subject<number>(); // yet unused

    nowPlayingSubject = new Subject<{ media: Media, time: number }>();

    loopStateSubject: BehaviorSubject<LoopState> = new BehaviorSubject({ currentTime: 0, media: null, isPlaying: false } as LoopState);

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

            let newState = { ...currentState } as LoopState;

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

    constructor(
        name: string,
        private redditScraper: RedditCrawlerService,
        private ytService: YoutubeV3Service
    ) {
        this.name = name
        this.id = name
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

    clearPlaylist() {
        this.currentPlaylist.clear();
    }

    addBulkToPlaylist(bulk: Media[]) {
        bulk.forEach(media => this.currentPlaylist.add(media, null));
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
        var index = this.members.findIndex(m => m.id === member.id);

        if (index > -1) {
            this.members = [...this.members.slice(0, index), ...this.members.slice(index + 1)];
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