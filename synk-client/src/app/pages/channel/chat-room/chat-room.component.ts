import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';

import { doLog } from 'src/app/utils/custom.operators';
import { ChatService } from '../chat.service';
import { EmoteService } from '../emote.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChatRoomComponent implements OnDestroy, OnInit, AfterViewChecked {
  @ViewChild('feed', { static: false, read: ElementRef })
  private feed: ElementRef;

  @Input() name: string;
  shouldScrollDown: boolean;

  submitPressedSubject: Subject<{ ev?: any; text: string }> = new Subject();

  sendMessageSub = this.submitPressedSubject
    .pipe(
      filter(({ text }) => Boolean(text)),
      filter(({ text }) => Boolean(text.trim())),
      map(({ text }) => text.trim()),
      map((text) => ({
        roomName: this.name,
        content: { text: text.trim() },
      })),
      this.chatService.sendMessageToRoom()
    )
    .subscribe();

  config$ = this.chatService.roomUserConfig$;

  loggedInUserIsLeader$ = this.config$.pipe(
    map((ev) => ev.isLeader),
    doLog('chatroom isleader', true)
  );

  messages$ = this.chatService.roomMessages$.pipe(
    map((ls) => ls.map((it) => ({ ...it, parsedText: this.emoteService.parseText(it.text) })))
  );

  scrollDownListenerSub = this.messages$
    .pipe(tap((_) => (this.shouldScrollDown = true)))
    .subscribe();

  roomError$ = this.chatService.alreadyJoinedRoomError$.pipe(mapTo(true));

  constructor(
    private chatService: ChatService,
    private emoteService: EmoteService
  ) {}

  // @HostListener('scroll', ['$event'])
  // onScroll($event: Event): void {
  //   console.log($event.target);
  // }

  private scrollChatFeedDown() {
    try {
      const feed: HTMLDivElement = this.feed.nativeElement;
      feed.scrollTop = feed.scrollHeight;
    } catch (error) {
      console.log(error);
    }
  }

  ngOnInit() {
    this.chatService.enterRoom(this.name);
  }

  ngOnDestroy() {
    this.sendMessageSub.unsubscribe();
    this.scrollDownListenerSub.unsubscribe();
    this.chatService.exit(this.name);
  }

  ngAfterViewChecked() {
    if (this.shouldScrollDown) {
      this.scrollChatFeedDown();
      this.shouldScrollDown = false;
    }
  }
}
