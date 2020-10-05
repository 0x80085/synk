
export class ItemContent {
  mediaUrl: string;
  currentTime: number | null = null;

  constructor(mediaUrl: string, currentTime: number) {
    this.currentTime = currentTime;
    this.mediaUrl = mediaUrl;
  }
}

export class PlaylistItem extends ItemContent {
  isPermanent = false;
  addedByUsername?: string;
  active ? = false;
  title: any;
  duration: number;
  meta: {
    thumbnail: any;
    etag: any;
    blocked: boolean;
    allowed: boolean;
  };

  constructor(mediaUrl: string, addedByUsername: string) {
    super(mediaUrl, null);
  }
}

