import { MediaEvent } from './message';

export class MediaContent {
  mediaUrl: string;
  currentTime: number | null = null;

  constructor(mediaUrl: string, currentTime: number) {
    this.currentTime = currentTime;
    this.mediaUrl = mediaUrl;
  }
}

export class PlaylistItem extends MediaContent {
  isPermenant = false;
  addedByUsername: string;

  constructor(mediaUrl: string, addedByUsername: string) {
    super(mediaUrl, null);
  }
}

const mockList: PlaylistItem[] = [
  {
    addedByUsername: 'lain',
    currentTime: null,
    isPermenant: false,
    mediaUrl: 'https://www.youtube.com/watch?v=p2LMwxo0MVk'
  },

  {
    addedByUsername: 'lain',
    currentTime: null,
    isPermenant: false,
    mediaUrl: 'https://www.youtube.com/watch?v=_1rF38MjpHE'
  },
  {
    addedByUsername: 'lain',
    currentTime: null,
    isPermenant: false,
    mediaUrl: 'https://www.youtube.com/watch?v=qUDEyONQaCA'
  }
];

export class Playlist {
  name: string;
  list: PlaylistItem[] = mockList;
  current: PlaylistItem | null = mockList[0];

  constructor(name: string) {
    this.name = name;
  }

  add(media: PlaylistItem) {
    this.list.push(media);
  }

  next(media: MediaContent, isPermenant: boolean, addedBy: string) {
    const item = new PlaylistItem(media.mediaUrl, addedBy);
    item.isPermenant = isPermenant;

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
    let listCount = this.list.length;

    while (listCount) {
      const newIndex = Math.floor(Math.random() * listCount--);
      const lastItem = this.list[listCount];

      this.list[listCount] = this.list[newIndex];
      this.list[newIndex] = lastItem;
    }
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
    this.update(ev);

    this.publish(afterUpdateCallback);
  }

  update = (ev: MediaEvent) => {
    const selectedItem = this.list.find(it => it.mediaUrl === ev.mediaUrl);

    if (!selectedItem) {
      // delete/throw when add media is implemnted
      const selectedItem = {
        addedByUsername: 'lain',
        currentTime: ev.currentTime,
        isPermenant: false,
        mediaUrl: ev.mediaUrl
      };
      this.add(selectedItem);
    }
    this.current = selectedItem;
  }

  publish = (callback: (arg: MediaContent) => void) => {
    if (!this.current) {
      console.log('no vid selected ');
      return;
    }
    const update = {
      list: this.list,
      nowPlaying: this.current
    };
    const ev: MediaContent = {
      currentTime: update.nowPlaying.currentTime,
      mediaUrl: update.nowPlaying.mediaUrl
    };
    console.log('publish = (', ev);

    callback(ev);
  }

  private getIndexOfCurrentPlaying() {
    return this.list.findIndex(it => it.mediaUrl === this.current.mediaUrl);
  }

  private getIndexByUrl(mediaUrl: string) {
    return this.list.findIndex(it => it.mediaUrl === mediaUrl);
  }
}
