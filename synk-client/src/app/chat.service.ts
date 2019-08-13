import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  joinRoom(name: string) {
    this.socket.emit('join room', name);
  }

  sendDM(msg: string) {
    this.socket.emit('private message', msg);
  }
}
