import { Component, OnInit, Input } from '@angular/core';
import { ChatService, Message } from '../chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @Input() name: string;

  message: Observable<Message> = new Observable();

  constructor(private chatServ: ChatService) {}

  ngOnInit() {
    this.message = this.chatServ.groupMessage$;
  }

  onJoinRoom() {
    this.chatServ.joinRoom(this.name);
  }
}
