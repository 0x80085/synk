import { Component, OnInit, Input } from '@angular/core';
import { ChatService, Message } from '../chat.service';
import { Observable, Subject, combineLatest, pipe, forkJoin } from 'rxjs';
import { toArray, take, map, combineAll } from 'rxjs/operators';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @Input() name: string;

  messages: Message[] = [];
  singleMessage: Observable<Message> = new Observable();

  constructor(private chatServ: ChatService) {}

  ngOnInit() {
    this.chatServ.groupMessage$.subscribe(message =>
      this.messages.push(message)
    );
    this.singleMessage = this.chatServ.groupMessage$;
  }

  onJoinRoom() {
    this.chatServ.joinRoom(this.name);
  }
}
