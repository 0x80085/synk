import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap } from 'rxjs/operators';
import { getRandom } from 'src/util/getRandom';

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
  private logger = new Logger(MediaMetaDataService.name);

  invidiousInstanceUrls = [
    'https://inv.vern.cc',
    'https://invidious.nerdvpn.de',
    'https://invidious.namazso.eu',
    'https://inv.riverside.rocks',
    'https://invidious.flokinet.to',
    'https://y.com.sb',
  ];

  constructor(private httpService: HttpService) {}

  getVideoMetaData(id: string): Observable<YoutubeMetadata> {
    const url = `${getRandom(this.invidiousInstanceUrls)}/api/v1/videos/${id}`;
    const headers = {};
    this.logger.log(`fetching metadata at ${url}`);

    return this.httpService.get(url, { headers }).pipe(
      map((res) => this.parseToMetaData(res, id)),
      catchError((err) => {
        this.logger.error(
          `getVideoMetaData failed to get metadata from ${url}`,
          err,
        );
        throw err;
      }),
    );
  }

  getVideoMetaDataWithRetry(id: string) {
    return of(id).pipe(
      switchMap((id) => this.getVideoMetaData(id)),
      retry(3),
    );
  }

//   async getFromSoundcloud(url: string) {
//     const clientId = this.getClientId();
//     const trackId = this.getTrackId(
//       'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1375400854&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
//     );
//     const info = await this.getFromSoundcloudAPI(clientId, trackId);
//   }

//   private getTrackId(embedUrl: string) {
//     const before = "api.soundcloud.com/tracks/"
//     const after = "&"

//     const [_, trackId] = embedUrl.split(after)[0].split(before);
//     return trackId;
// }

  // private async getFromSoundcloudAPI(clientId: void, url: string) {
  //   // https://api-v2.soundcloud.com/
  //   // https://api-v2.soundcloud.com/tracks/1375400854?client_id=YeTcsotswIIc4sse5WZsXszVxMtP6eLc
  //   // use only embed urls since they have trackid inside

  //   // def _extract_info_dict(self, info, full_title=None, secret_token=None):
  //   // track_id = compat_str(info['id'])
  //   // title = info['title']
  //   // format_urls = set()
  //   // formats = []
  //   // query = {'client_id': self._CLIENT_ID}
  //   // if secret_token:
  //   //     query['secret_token'] = secret_token
  //   // if info.get('downloadable') and info.get('has_downloads_left'):
  //   //     download_url = update_url_query(
  //   //         self._API_V2_BASE + 'tracks/' + track_id + '/download', query)
  // }

  // private getClientId() {
  //   // def _update_client_id(self):
  //   // webpage = self._download_webpage('https://soundcloud.com/', None)
  //   // for src in reversed(re.findall(r'<script[^>]+src="([^"]+)"', webpage)):
  //   //     script = self._download_webpage(src, None, fatal=False)
  //   //     if script:
  //   //         client_id = self._search_regex(
  //   //             r'client_id\s*:\s*"([0-9a-zA-Z]{32})"',
  //   //             script, 'client id', default=None)
  //   //         if client_id:
  //   //             self._CLIENT_ID = client_id
  //   //             self._store_client_id(client_id)
  //   //             return
  //   // raise ExtractorError('Unable to extract client id')
  // }

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
        thumbnail: video.videoThumbnails.find((it) => it.quality === 'medium')
          .url,
        etag: null,
        blocked: false,
        allowed: true,
      },
    };
    return data;
  }
}

export function YouTubeGetID(url: string) {
  const regx =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
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
