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

    activeEntryIndex: number = null;
    currentTime = 0;

    maxVoteSkipCount = 10;
    voteSkipCount = 0;

    queue: Queue<{ media: Media, addedBy: Member }> = new Queue();

    nowPlaying(): PlayingState {
        const media = this.activeEntryIndex !== null
            ? this.selectFromQueue(this.activeEntryIndex)?.media
            : null;

        return {
            media,
            time: this.currentTime
        }
    };

    length() {
        return this.queue.length;
    }

    constructor(name: string, createdBy: Member, createDate: Date) {
        this.id = uuid();
        this.name = name;
        this.owner = createdBy;
        this.createDate = createDate;
    }

    updateNowPlaying(url: string, time: number): UpdatePlayingStateCommand {
        const isAnyMediaPlaying = Boolean(this.nowPlaying().media && this.nowPlaying().media.url);
        const isAlreadyPlayingRequestedMedia = this.nowPlaying().media?.url === url;

        if (!isAnyMediaPlaying || !isAlreadyPlayingRequestedMedia) {
            this.setNowPlaying(url);
        }
        if (isAnyMediaPlaying) {
            this.updateCurrentTime(time);
        }
        return { url: this.nowPlaying()?.media?.url, time: this.nowPlaying().time };
    }

    stopPlaying() {
        this.currentTime = 0;
        this.activeEntryIndex = null;
    }

    playNext() {
        let next = this.activeEntryIndex + 2 > this.length()
            ? 0
            : this.activeEntryIndex + 1;
        this.setNowPlaying(next);
        this.currentTime = 0;
    }

    playPrevious() {
        let previous = this.activeEntryIndex - 1 >= 0
            ? this.activeEntryIndex - 1
            : 0;
        this.setNowPlaying(previous);
    }

    skipTo(to: number) {
        this.setNowPlaying(to);
        this.currentTime = 0;
    }

    add(media: Media, member: Member) {
        const alreadyAdded = this.queue.toArray().find(it => it.media.url === media.url);
        if (alreadyAdded) {
            return;
        }
        this.queue.enqueue({ media, addedBy: member });
    }

    remove(media: Media) {
        const target = this.selectFromQueue(media);
        const isOnlyEntry = target && this.queue.length === 1;

        if (isOnlyEntry) {
            if (this.nowPlaying()?.media?.url === media.url) {
                this.activeEntryIndex = null;
            }
            this.queue.removeHead();
        } else if (target) {
            if (this.nowPlaying()?.media?.url === media.url) {
                this.playNext();
            }
            this.queue.remove(target);
        }
    }

    clear() {
        this.queue = new Queue();
    }

    updateCurrentTime(seconds: number) {
        if (seconds >= 0 && seconds < this.nowPlaying().media.length) {
            this.currentTime = seconds;
        }
    }

    movePositionInListByMedia(url: string, newPosition: number) {
        const media = this.selectFromQueue(url);
        if (!media) {
            throw new Error("media not found")
        }
        const currentIndex = this.queue.toArray().findIndex(it => it.media.url === url);
        this.movePositionInListByIndex(currentIndex, newPosition)
    }

    movePositionInListByIndex(currentPosition: number, newPosition: number) {
        if (this.queue.length - 1 < currentPosition || this.queue.length - 1 < newPosition) {
            throw new Error("invalid position args")
        }
        const newList = this.insertAndShift(this.queue.toArray(), currentPosition, newPosition);

        this.queue = new Queue(...newList);
    }

    incrementVoteSkips() {
        this.voteSkipCount = this.voteSkipCount + 1;
        if (this.voteSkipCount > this.maxVoteSkipCount) {
            this.playNext();
        }
    }

    selectFromQueue(selector: Media | string | number) {
        switch (typeof selector) {
            case "object":
                if (!!selector.url)
                    return this.queue.toArray().find(it => it.media.url === selector.url);
                break;
            case "string":
                return this.queue.toArray().find(it => it.media.url === (selector as string));
            case "number":
                return this.queue.toArray()[(selector as number)];
            default:
                break;
        }
    }

    private setNowPlaying(selector: Media | string | number) {
        let selectedItemIndex: number;

        if (typeof selector === "object" && !!selector.url) {
            selectedItemIndex = this.queue.toArray().findIndex(it => it.media.url === selector.url);
        } else if (typeof selector === "string") {
            selectedItemIndex = this.queue.toArray().findIndex(it => it.media.url === (selector as string));
        } else if (typeof selector == "number") {
            selectedItemIndex = selector;
        }

        const isInRange = selectedItemIndex >= 0 && this.queue.length - 1 >= selectedItemIndex;

        if (isInRange) {
            this.voteSkipCount = 0;
            this.activeEntryIndex = selectedItemIndex;
        }
    }

    private insertAndShift(arr: any[], from: number, to: number) {
        const newArray = arr.map(a => ({ ...a }));
        let cutOut = newArray.splice(from, 1)[0]; // cut the element at index 'from'
        newArray.splice(to, 0, cutOut);            // insert it at index 'to'
        return newArray as { media: Media, addedBy: Member }[];
    }
}