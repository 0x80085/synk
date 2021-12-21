import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';

import { ChatService } from '../chat.service';
import { RoomUser } from '../models/room.models';
import { doLog } from 'src/app/utils/custom.operators';

@Component({
  selector: 'app-connected-members',
  templateUrl: './connected-members.component.html',
  styleUrls: ['./connected-members.component.scss']
})
export class ConnectedMembersComponent {

  @Output() giveLeader = new EventEmitter<RoomUser>();

  private config$ = this.chatService.roomUserConfig$

  members$: Observable<RoomUser[]> = this.chatService.roomUserList$;

  loggedInUserIsLeader$ = this.config$.pipe(
    map(ev => (ev.isLeader)),
    doLog('userlist isleader', true),
    share()
  );

  constructor(
    private chatService: ChatService,
  ) { }

  giveLeaderToMember(member: RoomUser) {
    this.giveLeader.emit(member);
  }

}
