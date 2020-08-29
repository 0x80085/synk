import { MediaEvent } from './message';
import { PlaylistItem, ItemContent } from './playlist-item';
import { lookup } from '../../api/handlers/info/lookup-yt-video-info';

export class Playlist {
  name: string;
  list: PlaylistItem[] = [];
  current: PlaylistItem | null;

  constructor(name: string) {
    this.name = name;
  }

  async add(
    media: MediaEvent,
    next: () => void = () => { },
    error: (err: any) => void = () => { }
  ) {
    const YTid = YouTubeGetID(media.mediaUrl);
    const alreadyAdded = this.list.filter(i => i.mediaUrl === media.mediaUrl).length > 0;

    if (alreadyAdded) {
      error('duplicate id');
    }
    if (YTid) {
      try {
        const ytMetadata = await lookup(YTid);
        const playlistItem: PlaylistItem = { ...ytMetadata, ...media, isPermanent: false };
        console.log(playlistItem);

        this.list.push(playlistItem);
        next();
      } catch (e) {
        error(e);
      }
    }
    else {
      const playlistItem: PlaylistItem = { title: '?', duration: 0, meta: null, ...media, isPermanent: false };
      this.list.push(playlistItem);
      next();

    }
  }

  queueUpSecondPosition(media: ItemContent, isPermanent: boolean, addedBy: string) {
    const item = new PlaylistItem(media.mediaUrl, addedBy);
    item.isPermanent = isPermanent;

    this.list.push(item);
    this.bump(media.mediaUrl, 2);
  }

  remove(mediaUrl: string) {
    this.list = this.list.filter(it => it.mediaUrl !== mediaUrl);
  }

  skip() {
    const nextIndex = this.getIndexOfCurrentPlaying() + 1;
    this.current = this.list[nextIndex] || this.list[nextIndex - 1];
  }

  shuffle() {
    this.list = shuffleList(this.list);
  }

  bump(mediaUrl: string, toPosition: number) {
    const lastPosition = this.list.length;
    let fromPosition = this.getIndexByUrl(mediaUrl);

    while (fromPosition < 0) {
      fromPosition += lastPosition;
    }
    while (toPosition < 0) {
      toPosition += lastPosition;
    }
    if (toPosition >= lastPosition) {
      let k = toPosition - lastPosition;
      while (k-- + 1) {
        this.list.push(undefined);
      }
    }
    this.list.splice(toPosition, 0, this.list.splice(fromPosition, 1)[0]);
  }

  clear() {
    this.list = [];
  }

  handleListUpdate = (
    ev: MediaEvent,
    afterUpdateCallback: (arg: MediaEvent) => void
  ) => {
    const selectedItem = this.list.find(it => it.mediaUrl === ev.mediaUrl);

    if (!selectedItem) {
      return;
    }

    this.current = selectedItem;
    this.list.forEach(it => it.active = false);
    selectedItem.active = true;

    this.publish(afterUpdateCallback);
  }

  publish = (calledWithNewCurrentVideoState: (arg: ItemContent) => void) => {
    if (!this.current) {
      return;
    }
    const update = {
      list: this.list,
      nowPlaying: this.current
    };
    const ev: ItemContent = {
      currentTime: update.nowPlaying.currentTime,
      mediaUrl: update.nowPlaying.mediaUrl
    };

    calledWithNewCurrentVideoState(ev);
  }

  private getIndexOfCurrentPlaying() {
    return this.list.findIndex(it => it.mediaUrl === this.current.mediaUrl);
  }

  private getIndexByUrl(mediaUrl: string) {
    return this.list.findIndex(it => it.mediaUrl === mediaUrl);
  }
}

function YouTubeGetID(url: string) {
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

function shuffleList(list: any[]) {
  let listCount = { ...list }.length;

  while (listCount) {
    const newIndex = Math.floor(Math.random() * listCount--);
    const lastItem = list[listCount];

    list[listCount] = list[newIndex];
    list[newIndex] = lastItem;
  }

  return list;
}

function cloneOf(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}
