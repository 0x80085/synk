export interface PlayerFeedbackMessage {
  [key: string]: {
    type: 'success' | 'info' | 'warning' | 'error' | 'blank';
    title: string;
    body: string;
  };
}

export const errorDictionary: PlayerFeedbackMessage = {
  [YT.PlayerError.EmbeddingNotAllowed]: {
    type: 'error',
    title: 'Video not playable',
    body: 'Disallowed embed playback'
  },
  [YT.PlayerError.EmbeddingNotAllowed2]: {
    type: 'error',
    title: 'Video not playable',
    body: 'Disallowed embed playback'
  },
  [YT.PlayerError.Html5Error]: {
    type: 'error',
    title: '',
    body: 'Incompatible player'
  },
  [YT.PlayerError.InvalidParam]: {
    type: 'error',
    title: 'Input invalid',
    body: 'Something went wrong requesting the video'
  },
  [YT.PlayerError.VideoNotFound]: {
    type: 'error',
    title: 'Nothing found',
    body: 'Video does not exist (anymore)'
  }
};
