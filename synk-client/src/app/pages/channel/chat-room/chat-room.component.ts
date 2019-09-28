import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, debounceTime, tap } from 'rxjs/operators';
import { ChatService, Message } from '../../../services/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent {

  @Input() name: string;

  msgBoxValue: string;

  messages$: Observable<Message[]> = this.chatServ.groupMessages$
    .pipe(
      debounceTime(10),
      distinctUntilChanged(),
    );

  empty = this.chatServ.groupMessages$.pipe(
    map(ls => ls.length === 0),
    tap(d => console.log(d))
  );

  constructor(private chatServ: ChatService) { }

  onJoinRoom() {
    this.chatServ.joinRoom(this.name);
  }

  onSendMessageToGroup() {
    this.chatServ.sendGM({ msg: this.msgBoxValue.trim() }, this.name);
    this.msgBoxValue = '';
  }
}
