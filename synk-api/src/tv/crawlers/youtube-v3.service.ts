import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { YoutubeDataAPI } from 'youtube-v3-api';

@Injectable()
export class YoutubeV3Service {

    api = new YoutubeDataAPI(process.env.YT_V3_API_KEY);

    constructor(private httpService: HttpService) { }

    getVideoMetaData(id: string) {
        const API_KEY = process.env.YT_V3_API_KEY;

        if (!API_KEY) {
            throw new Error('API key not set for YouTube v3 API');
        }

        const params = `key=${API_KEY}&part=contentDetails%2Cstatus%2Csnippet&id=${id}`;
        const url = `https://www.googleapis.com/youtube/v3/videos?${params}`;
        const headers = {};

        return this.httpService.get(url, { headers }).pipe(
            map(res => {
                switch (res.status) {
                    case 400:
                        console.error('YouTube API returned Bad Request: %s', res.data);
                        throw new Error('Error calling YouTube API: Bad Request');
                    case 403:
                        console.error('YouTube API returned Forbidden: %s', res.data);
                        throw Error("403");
                    case 500:
                    case 503:
                        throw new Error('YouTube API is unavailable.  Please try again later.');
                    default:
                        try {
                            res.data.items[0].snippet.localized.title
                        } catch (error) {

                        }
                        if (res.status !== 200) {
                            throw new Error(`Error calling YouTube API: HTTP ${res.status}`);
                        }
                        break;
                }

                const result = res.data;

                // Sadly, as of the v3 API, YouTube doesn't tell you *why* the request failed.
                if (result.items.length === 0) {
                    throw new Error('Video does not exist or is private');
                }

                const video = result.items[0];

                if (!video.status || !video.contentDetails || !video.snippet) {
                    console.log(`Incomplete video; assuming deleted video with id=${video.id}`, video.id);
                    throw new Error('This video is unavailable');
                }

                if (!video.status.embeddable) {
                    throw new Error('The uploader has made this video non-embeddable');
                }

                switch (video.status.uploadStatus) {
                    case 'deleted':
                        throw new Error('This video has been deleted');
                    case 'failed':
                        throw new Error(
                            'This video is unavailable: ' +
                            video.status.failureReason
                        );
                    case 'rejected':
                        throw new Error(
                            'This video is unavailable: ' +
                            video.status.rejectionReason
                        );
                    case 'processed':
                        break;
                    case 'uploaded':
                        // For VODs, we must wait for 'processed' before the video
                        // metadata is correct.  For livestreams, the status is
                        // 'uploaded' while the stream is live, and the metadata
                        // is presumably correct (we don't care about duration
                        // for livestreams anyways)
                        // See calzoneman/sync#710
                        if (video.snippet.liveBroadcastContent !== 'live') {
                            throw new Error(
                                'This video has not been processed yet.'
                            );
                        }
                        break;
                    default:
                        throw new Error(`This video is not available (status=${video.status.uploadStatus})`);
                }

                const data = {
                    id,
                    type: 'youtube',
                    title: video.snippet.title,
                    duration: parseDuration(video.contentDetails.duration),
                    meta: {
                        thumbnail: video.snippet.thumbnails.default.url,
                        etag: result.etag,
                        blocked: false,
                        allowed: true,
                    }
                };

                if (video.contentDetails.regionRestriction) {
                    const restriction = video.contentDetails.regionRestriction;
                    if (restriction.blocked) {
                        data.meta.blocked = restriction.blocked;
                    }
                    if (restriction.allowed) {
                        data.meta.allowed = restriction.allowed;
                    }
                }

                return data;
            })
        );
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

const DURATION_SCALE: [RegExp, number][] = [
    [/(\d+)D/, 24 * 3600],
    [/(\d+)H/, 3600],
    [/(\d+)M/, 60],
    [/(\d+)S/, 1]
];

function parseDuration(duration: any) {
    let time = 0;
    for (const [regex, scale] of DURATION_SCALE) {
        let m;
        // tslint:disable-next-line: no-conditional-assignment
        if (m = duration.match(regex)) {
            // tslint:disable-next-line: radix
            time += parseInt(m[1]) * scale;
        }
    }

    return time;
}
