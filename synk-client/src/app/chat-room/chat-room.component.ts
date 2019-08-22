import { Component, OnInit, Input } from '@angular/core';
import { ChatService, Message } from '../chat.service';
import { Observable, Subject } from 'rxjs';
import { take, toArray, map, distinctUntilChanged, throttleTime, scan } from 'rxjs/operators';

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
      take(50)
      );

  }

  onJoinRoom() {
    this.chatServ.joinRoom(this.name);
  }

  onSendMessageToGroup(){
    this.chatServ.sendGM({msg :this.msgBoxValue}, this.name);
    this.msgBoxValue = "";
  }
}
