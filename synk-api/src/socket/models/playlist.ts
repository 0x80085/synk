import { MediaEvent } from './message';

export class ItemContent {
  mediaUrl: string;
  currentTime: number | null = null;

  constructor(mediaUrl: string, currentTime: number) {
    this.currentTime = currentTime;
    this.mediaUrl = mediaUrl;
  }
}

export class PlaylistItem extends ItemContent {
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
    const id = YouTubeGetID(media.mediaUrl);
    if (!id || id === '') {
      console.log('bad id');
      return;
    }
    const alreadyAdded = this.list.filter(i => i.mediaUrl === media.mediaUrl).length > 0;
    if (!alreadyAdded) { this.list.push(media); }
  }

  next(media: ItemContent, isPermenant: boolean, addedBy: string) {
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
    this.update(ev);

    this.publish(afterUpdateCallback);
  }

  update = (ev: MediaEvent) => {

    const selectedItem = this.list.find(it => it.mediaUrl === ev.mediaUrl);

    if (!selectedItem) {
      return;
    }

    this.current = selectedItem;
  }

  publish = (callback: (arg: ItemContent) => void) => {
    if (!this.current) {
      console.log('no vid selected ');
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

function YouTubeGetID(url: string) {
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
