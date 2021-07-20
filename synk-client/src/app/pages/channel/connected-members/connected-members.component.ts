import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { ChatService } from '../chat.service';
import { RoomUser } from '../models/room.models';

@Component({
  selector: 'app-connected-members',
  templateUrl: './connected-members.component.html',
  styleUrls: ['./connected-members.component.scss']
})
export class ConnectedMembersComponent {

  @Output() giveLeader = new EventEmitter<RoomUser>();

  members$: Observable<RoomUser[]> = this.chatService.roomUserList$;

  loggedInUserIsLeader$ = this.chatService.roomUserConfig$.pipe(
    map(ev => (ev.isLeader)), 
    shareReplay(1)
  );

  constructor(
    private chatService: ChatService,
  ) { }

  giveLeaderToMember(member: RoomUser) {
    this.giveLeader.emit(member);
  }

}
