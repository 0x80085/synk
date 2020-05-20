
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
  addedByUsername?: string;
  active ? = false;

  constructor(mediaUrl: string, addedByUsername: string) {
    super(mediaUrl, null);
  }
}

// export const mockList: PlaylistItem[] = [
//   {
//     addedByUsername: 'lain',
//     currentTime: null,
//     isPermenant: false,
//     mediaUrl: 'https://www.youtube.com/watch?v=p2LMwxo0MVk'
//   },

//   {
//     addedByUsername: 'lain',
//     currentTime: null,
//     isPermenant: false,
//     mediaUrl: 'https://www.youtube.com/watch?v=_1rF38MjpHE'
//   },
//   {
//     addedByUsername: 'lain',
//     currentTime: null,
//     isPermenant: false,
//     mediaUrl: 'https://www.youtube.com/watch?v=qUDEyONQaCA'
//   }
// ];
