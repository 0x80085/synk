import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { ChatService, Message } from '../chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnDestroy, OnInit {

  @Input() name: string;

  msgBoxValue: string;

  messages$: Observable<Message[]> = this.chatServ.groupMessages$
    .pipe(
      debounceTime(10),
      distinctUntilChanged()
    );

  // empty$ = this.chatServ.groupMessages$.pipe(
  //   map(ls => ls.length === 0),
  //   tap(d => console.log(d))
  // );

  constructor(private chatServ: ChatService) { }

  onSendMessageToGroup() {
    this.chatServ.sendGM({ msg: this.msgBoxValue.trim() }, this.name);
    this.msgBoxValue = '';
  }

  ngOnInit() {
    this.chatServ.enter(this.name);
  }

  ngOnDestroy() {
    this.chatServ.exit();
  }


}
