import { Queue } from "queue-typescript";
import { v4 as uuid } from 'uuid';

import { Media } from "../media/media";
import { Member } from "../../../domain/entity";

export interface PlayingState {
    media: Media;
    time: number;
}

export interface UpdatePlayingStateCommand {
    url: string;
    time: number;
}

export class Playlist {

    id: string;
    name: string;
    owner: Member;
    createDate: Date

    activeEntryIndex = 0;
    currentTime = 0;

    maxVoteSkipCount = 10;
    voteSkipCount = 0;

    queue: Queue<{ media: Media, addedBy: Member }> = new Queue();

    nowPlaying (): PlayingState  {
        return {
        media: this.selectFromQueue(this.activeEntryIndex)?.media,
        time: this.currentTime
    }};

    constructor(name: string, createdBy: Member, createDate: Date) {
        this.id = uuid();
        this.name = name;
        this.owner = createdBy;
        this.createDate = createDate;
    }

    updateNowPlaying(url: string, time: number): UpdatePlayingStateCommand {

        if (this.nowPlaying().media.url !== url) {
            this.setNowPlaying(url);
        }

        this.updateCurrentTime(time);
        return { url: this.nowPlaying().media.url, time: this.nowPlaying().time };
    }

    playNext() {
        const nxt = this.activeEntryIndex + 1;
        this.setNowPlaying(nxt);
    }

    playPrevious() {
        const nxt = this.activeEntryIndex + 1;
        this.setNowPlaying(nxt);
    }

    skipTo(to: number) {
        this.setNowPlaying(to);
    }

    add(media: Media, member: Member) {
        const alreadyAdded = this.queue.toArray().find(it => it.media.url === media.url);
        if (alreadyAdded) {
            console.log("alreadyAdded");
            console.log(this.queue.toArray());
            
            throw new Error("No duplicates allowed");
        }
        this.queue.enqueue({ media, addedBy: member });
    }

    remove(media: Media) {
        const target = this.selectFromQueue(media);
        if (target) {
            this.queue.remove(target);
        }
    }

    updateCurrentTime(value: number) {
        if (value > 0 && value < this.nowPlaying().media.length) {
            this.currentTime = value;
        }
    }

    incrementVoteSkips() {
        this.voteSkipCount = this.voteSkipCount + 1;
        if (this.voteSkipCount > this.maxVoteSkipCount) {
            this.playNext();
        }
    }

    selectFromQueue(selector: Media | string | number) {
        if (typeof selector === "object" && !!selector.url) {
            return this.queue.toArray().find(it => it.media.url === selector.url);
        } else if (typeof selector === "string") {
            return this.queue.toArray().find(it => it.media.url === (selector as string));
        } else if (typeof selector === "number") {
            return this.queue.toArray()[(selector as number)];
        }
    }

    private setNowPlaying(selector: Media | string | number) {
        let selectedItemIndex: number;
        let isInRange: boolean;

        if (typeof selector === "object" && !!selector.url) {
            selectedItemIndex = this.queue.toArray().findIndex(it => it.media.url === selector.url);
        } else if (typeof selector === "string") {
            selectedItemIndex = this.queue.toArray().findIndex(it => it.media.url === (selector as string));
        } else if (typeof selector == "number") {
            selectedItemIndex = selector;    
        }

        isInRange = selectedItemIndex >= 0 && this.queue.length - 1 >= selectedItemIndex;

        if (isInRange) {
            this.voteSkipCount = 0;
            this.activeEntryIndex = selectedItemIndex; 
        }
    }
}