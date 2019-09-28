import { Component, OnInit, Input } from '@angular/core';
import { Observable, from } from 'rxjs';
import { take, distinctUntilChanged, throttleTime, scan, map, debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { ChatService, Message } from '../../../services/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @Input() name: string;

  msgBoxValue: string;

  messages: Observable<Message[]> = new Observable();

  empty = this.messages.pipe(
    map(ls => ls.length === 0)
  );

  constructor(private chatServ: ChatService) { }

  ngOnInit() {
    this.messages = this.chatServ.groupMessages$
      .pipe(
        debounceTime(10),
        distinctUntilChanged(),
      );

  }

  onJoinRoom() {
    this.chatServ.joinRoom(this.name);
  }

  onSendMessageToGroup() {
    this.chatServ.sendGM({ msg: this.msgBoxValue.trim() }, this.name);
    this.msgBoxValue = "";
  }
}
