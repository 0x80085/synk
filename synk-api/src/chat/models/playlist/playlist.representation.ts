import { MediaRepresentation } from "../media/media.representation";
import { Playlist } from "./playlist";

export interface PlaylistRepresentation {
    id: string;
    name: string;
    entries: MediaRepresentation[];
    nowPlaying: MediaRepresentation;
    isLive: boolean;
}

export function toRepresentation(list: Playlist): PlaylistRepresentation {
    return {
        id: list.id,
        name: list.name,
        entries: list.queue.toArray().map(it => it.media.toRepresentation(it.addedBy)),
        nowPlaying: list.nowPlaying().media?.toRepresentation(),
        isLive: list.nowPlaying().isLive
    }
}