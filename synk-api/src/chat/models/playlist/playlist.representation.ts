import { MediaRepresentation } from "../media/media.representation";
import { Playlist } from "./playlist";

export interface PlaylistRepresentation {
    id: string;
    name: string;
    entries: MediaRepresentation[];
    nowPlaying: MediaRepresentation;
}

export function toRepresentation(list: Playlist): PlaylistRepresentation {
    return {
        id: list.id,
        name: list.name,
        entries: list.queue.toArray().map(it => it.media.toRepresentation()),
        nowPlaying: list.nowPlaying().media
    }
}