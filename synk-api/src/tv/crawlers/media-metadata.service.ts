import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap } from 'rxjs/operators';

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
export class MediaMetaDataService {

    private logger = new Logger(MediaMetaDataService.name)

    invidiousInstanceUrls = [
        'https://inv.vern.cc',
        'https://invidious.nerdvpn.de',
        'https://invidious.namazso.eu',
        'https://inv.riverside.rocks',
        'https://invidious.flokinet.to',
        'https://y.com.sb'
    ];

    constructor(private httpService: HttpService) { }

    getVideoMetaData(id: string): Observable<YoutubeMetadata> {
        const url = `${getRandom(this.invidiousInstanceUrls)}/api/v1/videos/${id}`;
        const headers = {};
         this.logger.log(`fetching metadata at ${url}`)

        return this.httpService.get(url, { headers }).pipe(
            map(res => this.parseToMetaData(res, id)),
            catchError(err => {
                this.logger.error(`getVideoMetaData failed to get metadata from ${url}`, err)
                throw err
            })
        )
    }
    
    getVideoMetaDataWithRetry(id: string) {
        return of(id).pipe(
            switchMap(id =>this.getVideoMetaData(id)),
            retry(3)
        );
    }

    private parseToMetaData(res, id: string) {
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
        return data;
    }
}

function getRandom(list: any[]) {
    const randIndex = Math.floor(Math.random() * list.length);
    return list[randIndex];
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
