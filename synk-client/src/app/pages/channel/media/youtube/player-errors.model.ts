export interface PlayerFeedbackMessage {
  [key: string]: {
    type: 'success' | 'info' | 'warning' | 'error' | 'blank';
    title: string;
    body: string;
  };
}

enum PlayerError
{
    /**
     * The request contained an invalid parameter value.
     */
    InvalidParam = 2,

    /**
     * The requested content cannot be played in an HTML5 player.
     */
    Html5Error = 5,

    /**
     * The video requested was not found.
     */
    VideoNotFound = 100,

    /**
     * The owner of the requested video does not allow it to be played in embedded players.
     */
    EmbeddingNotAllowed = 101,

    /**
     * This error is the same as 101. It's just a 101 error in disguise!
     */
    EmbeddingNotAllowed2 = 150
}

export const errorDictionary: PlayerFeedbackMessage = {
  [PlayerError.EmbeddingNotAllowed]: {
    type: 'error',
    title: 'Video not playable',
    body: 'Disallowed embed playback'
  },
  [PlayerError.EmbeddingNotAllowed2]: {
    type: 'error',
    title: 'Video not playable',
    body: 'Disallowed embed playback'
  },
  [PlayerError.Html5Error]: {
    type: 'error',
    title: '',
    body: 'Incompatible player'
  },
  [PlayerError.InvalidParam]: {
    type: 'error',
    title: 'Input invalid',
    body: 'Something went wrong requesting the video'
  },
  [PlayerError.VideoNotFound]: {
    type: 'error',
    title: 'Nothing found',
    body: 'Video does not exist (anymore)'
  }
};
