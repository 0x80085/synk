import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface YoutubeMetadata {
    id: string;
    type: string;
    title: any;
    duration: number;
    isLive: boolean;
    meta: {
        thumbnail: any;
        etag: any;
        blocked: boolean;
        allowed: boolean;
    };
}

@Injectable()
export class YoutubeV3Service {

    constructor(private httpService: HttpService) { }

    /**
     * 
     * @param id youtube video id 
     * @returns Observable of metadata of YT video if found
     * (code taken from cytube thx guise :3)
     */
    getVideoMetaData(id: string): Observable<YoutubeMetadata> {
        const url = `https://inv.vern.cc/api/v1/videos/${id}`;
        const headers = {};

        return this.httpService.get(url, { headers }).pipe(
            map(res => {
                const result = res.data;
                const video = result;
                const durationInSeconds = video.lengthSeconds;
                const isLive = video.liveNow;

                const data = {
                    id,
                    type: 'youtube',
                    title: video.title,
                    duration: durationInSeconds,
                    isLive,
                    meta: {
                        thumbnail: video.videoThumbnails.find(it => it.quality === "medium").url,
                        etag: null,
                        blocked: false,
                        allowed: true,
                    }
                };
                return data
            })
        )
    }
}

export function YouTubeGetID(url: string) {
    const regx = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
    const isValid = regx.test(url);

    if (!isValid) {
        return;
    }
    let ID;
    const ytID = url
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (ytID[2] !== undefined) {
        ID = ytID[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = ytID;
    }
    return ID as string;
}
