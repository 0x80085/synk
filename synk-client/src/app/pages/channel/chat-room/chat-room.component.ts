import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { Observable, Subject, merge, of } from 'rxjs';
import { distinctUntilChanged, debounceTime, tap, map, filter } from 'rxjs/operators';
import { ChatService } from '../chat.service';
import { Message, RoomMessage } from '../models/room.models';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnDestroy, AfterViewChecked {

  @ViewChild('feed', { static: false, read: ElementRef }) private feed: ElementRef;

  @Input() name: string;

  submitChatMessageSub = new Subject();
  msgBoxValue: string;

  messages$: Observable<Message[]> = this.chatServ.roomMessages$
    .pipe(
      this.chatServ.enterRoom(this.name),
      debounceTime(10),
      distinctUntilChanged()
    );

  submitMessage$: Observable<RoomMessage> = this.submitChatMessageSub.pipe(
    map(() => ({
      roomName: this.name,
      content: {
        text: this.msgBoxValue
      }
    })),
    filter(msg => !!msg)
  );

  sendGroupMessage$ = this.chatServ.sendGroupMessage(this.submitMessage$);

  constructor(private chatServ: ChatService) { }

  @HostListener('scroll', ['$event']) onScroll($event: Event): void {
    console.log($event.target);
  }

  // onSendMessageToGroup() {
  //   this.chatServ.sendGroupMessage({ text: this.msgBoxValue.trim() }, this.name);
  //   this.msgBoxValue = '';
  // }

  ngOnDestroy() {
    this.chatServ.exit(of(this.name));
  }

  private scrollChatFeedDown() {
    try {
      const feed: HTMLDivElement = this.feed.nativeElement.children[1];
      // console.log(feed);

      feed.scrollTop = feed.scrollHeight;
    } catch (error) {

    }
  }

  ngAfterViewChecked() {
    this.scrollChatFeedDown();
  }


}
