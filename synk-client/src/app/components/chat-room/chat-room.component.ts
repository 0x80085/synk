import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { take, distinctUntilChanged, throttleTime, scan } from 'rxjs/operators';
import { ChatService, Message } from '../../services/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @Input() name: string;

  msgBoxValue: string;

  messages: Observable<Message[]> = new Observable();

  constructor(private chatServ: ChatService) { }

  ngOnInit() {
    this.messages = this.chatServ.groupMessages$
      .pipe(
        distinctUntilChanged(),
        throttleTime(100),
        take(10)
      );

  }

  onJoinRoom() {
    this.chatServ.joinRoom(this.name);
  }

  onSendMessageToGroup() {
    this.chatServ.sendGM({ msg: this.msgBoxValue }, this.name);
    this.msgBoxValue = "";
  }
}
