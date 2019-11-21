export class MediaContent {
  mediaUrl: string;
  currentTime: number | null;

  constructor(mediaUrl: string, currentTime: number) {
    this.currentTime = currentTime;
    this.mediaUrl = mediaUrl;
  }
}

export class PlaylistItem extends MediaContent {
  isPermenant: boolean;
  addedByUsername: string;

  constructor(mediaUrl: string, currentTime: number) {
    super(mediaUrl, currentTime);
  }
}

export class Playlist {
  name: string;
  list: PlaylistItem[] = [];
  current: PlaylistItem | null = null;

  constructor(name: string) {
    this.name = name;
  }

  add(media: MediaContent, isPermenant: boolean, addedBy: string) {}

  remove(mediaUrl: string) {}

  next() {}

  skip() {}

  shuffle() {}

  bump(mediaUrl: string, toPosition: number) {}

  clear() {}
}
