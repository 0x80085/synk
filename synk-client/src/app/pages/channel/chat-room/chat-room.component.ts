import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { ChatService } from '../chat.service';
import { Message } from '../models/room.models';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnDestroy, OnInit {

  @Input() name: string;

  msgBoxValue: string;

  messages$: Observable<Message[]> = this.chatServ.roomMessages$
    .pipe(
      debounceTime(10),
      distinctUntilChanged()
    );

  constructor(private chatServ: ChatService) { }

  onSendMessageToGroup() {
    this.chatServ.sendMessageToRoom({ text: this.msgBoxValue.trim() }, this.name);
    this.msgBoxValue = '';
  }

  ngOnInit() {
    this.chatServ.enterRoom(this.name);
  }

  ngOnDestroy() {
    this.chatServ.exit(this.name);
  }


}
