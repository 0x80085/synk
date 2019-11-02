export interface Message {
  userName: string;
  text: string;
}

export interface OutgoingGroupMessage {
  content: Message;
  roomName: string;
}

export interface IncomingGroupMessage {
  content: { text: string };
  roomName: string;
}

export interface MediaEvent {
  roomName: string;
  mediaUrl: string;
  currentTime: number;
}
