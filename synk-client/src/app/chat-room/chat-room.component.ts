import { Component, OnInit, Input } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @Input() name: string;

  constructor(private chatServ: ChatService) {}

  ngOnInit() {}

  onJoinRoom() {
    this.chatServ.joinRoom(this.name);
  }
}
