import axios from 'axios';

interface Media {
  id: string;
  type: string;
  title: any;
  duration: number;
  meta: {
    thumbnail: any;
    etag: any;
    blocked: boolean;
    allowed: boolean;
  };
}

/**
 *
 *
 * Retrieve metadata for a single YouTube video.
 * (Taken from https://github.com/CyTube/mediaquery/blob/master/src/provider/youtube.js)
 *
 * Returns a Media object
 */
export async function lookup(id: string) {

  const media = await _lookupInternal(id);

  return media;
}

function _lookupInternal(videoId: string) {
  const API_KEY = process.env.YT_V3_API_KEY;

  if (!API_KEY) {
    return Promise.reject(new Error('API key not set for YouTube v3 API'));
  }

  const params = `key=${API_KEY}&part=contentDetails%2Cstatus%2Csnippet&id=${videoId}`;
  const url = `https://www.googleapis.com/youtube/v3/videos?${params}`;
  const headers = {};

  return axios.get(url, { headers })
    .then(res => {
      switch (res.status) {
        case 400:
          console.error('YouTube API returned Bad Request: %s', res.data);
          throw new Error('Error calling YouTube API: Bad Request');
        case 403:
          console.error('YouTube API returned Forbidden: %s', res.data);
          throw map403Error(res.data);
        case 500:
        case 503:
          throw new Error('YouTube API is unavailable.  Please try again later.');
        default:
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

      const data: Media = {
        id: videoId,
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
    });
}


function getErrorReason(body: any) {
  try {
    body = JSON.parse(body);
  } catch (error) {
    return null;
  }

  if (!body.error || !body.error.errors) { return null; }

  return body.error.errors[0].reason;
}

function map403Error(body: any) {
  switch (getErrorReason(body)) {
    case 'dailyLimitExceeded':
    case 'quotaExceeded':
      return new Error(
        'YouTube videos are temporarily unavailable due to the website ' +
        'exceeding the YouTube API quota.  ' +
        'Quota resets daily at midnight Pacific Time'
      );
    case 'accessNotConfigured':
      return new Error(
        'The YouTube API is not properly configured for this website.  ' +
        'See https://console.developers.google.com/apis/api/youtube.googleapis.com/overview'
      );
    default:
      return new Error(
        'Unable to access YouTube API'
      );
  }
}

/*
 * Parse an ISO 8601 time duration (the format used by YouTube).
 * In the interest of sanity, only days, hours, minutes, and seconds are
 * considered.
 */
// https://en.wikipedia.org/wiki/ISO_8601#Durations
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
