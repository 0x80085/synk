import { Queue } from "queue-typescript";
import { v4 as uuid } from 'uuid';

import { Media } from "../media/media";
import { Member } from "../../../domain/entity";

export interface PlayingState {
    media: Media;
    time: number;
    isLive: boolean;
    addedBy?: Member;
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

    queue: Queue<{ media: Media, addedBy: Member }> = new Queue();

    nowPlaying(): PlayingState {
        const entry = this.activeEntryIndex !== null
            ? this.selectFromQueue(this.activeEntryIndex)
            : null;

        return {
            media: entry?.media,
            time: this.currentTime,
            isLive: entry?.media?.isLive ?? false,
            addedBy: entry?.addedBy
        }
    }

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
        const next = this.activeEntryIndex + 2 > this.length()
            ? 0
            : this.activeEntryIndex + 1;
        this.setNowPlaying(next);
        this.currentTime = 0;
    }

    playPrevious() {
        const previous = this.activeEntryIndex - 1 >= 0
            ? this.activeEntryIndex - 1
            : 0;
        this.setNowPlaying(previous);
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
        this.stopPlaying();
    }

    updateCurrentTime(seconds: number) {
        if (seconds >= 0
            // Some videos have duration (aka length) 0 bc we dont know it
            // && seconds < this.nowPlaying().media.length
        ) {
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

    selectFromQueue(selector: Media | string | number): {
        media: Media; addedBy: Member;
    } {
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
            this.activeEntryIndex = selectedItemIndex;
        }
    }

    private insertAndShift(arr: any[], from: number, to: number) {
        const newArray = arr.map(a => ({ ...a }));
        const cutOut = newArray.splice(from, 1)[0]; // cut the element at index 'from'
        newArray.splice(to, 0, cutOut);            // insert it at index 'to'
        return newArray as { media: Media, addedBy: Member }[];
    }
}