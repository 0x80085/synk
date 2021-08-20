import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, Subject } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';

import { ChatService } from '../chat.service';
import { Message } from '../models/room.models';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnDestroy, OnInit, AfterViewChecked {

  @ViewChild('feed', { static: false, read: ElementRef }) private feed: ElementRef;

  @Input() name: string;

  msgBoxValue: string;

  submitPressedSubject: Subject<{ ev?: KeyboardEvent, text: string }> = new Subject();
  shouldScrollDown: boolean;

  sendMessageSub = this.submitPressedSubject.pipe(
    filter(({ text }) => Boolean(text)),
    filter(({ text }) => Boolean(text.trim())),
    tap(() => this.msgBoxValue = ''),
    map(({ text }) => text.trim()),
    map((text) => ({
      roomName: this.name,
      content: { text: text.trim() }
    })),
    this.chatServ.sendMessageToRoom(),
  ).subscribe();

  messages$: Observable<Message[]> = this.chatServ.roomMessages$;

  scrollDownListenerSub = this.messages$.pipe(
    tap(_ => this.shouldScrollDown = true)
  ).subscribe()

  roomError$ = this.chatServ.alreadyJoinedRoomError$.pipe(
    mapTo(true),
    tap(() => {
      this.notification.error('Illegal operation', `Can't join the same room more than once!`);
    })
  );

  constructor(private chatServ: ChatService,
    private notification: NzNotificationService
  ) { }

  @HostListener('scroll', ['$event'])
  onScroll($event: Event): void {
    console.log($event.target);
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter(evt: KeyboardEvent) {
    evt.preventDefault();
  }

  private scrollChatFeedDown() {
    try {
      const feed: HTMLDivElement = this.feed.nativeElement;
      feed.scrollTop = feed.scrollHeight;
    } catch (error) {
      console.log(error);
    }
  }

  ngOnInit() {
    this.chatServ.enterRoom(this.name);
  }

  ngOnDestroy() {
    this.sendMessageSub.unsubscribe();
    this.scrollDownListenerSub.unsubscribe();
    this.chatServ.exit(this.name);
  }

  ngAfterViewChecked() {
    if (this.shouldScrollDown) {
      this.scrollChatFeedDown()
      this.shouldScrollDown = false;
    }
  }
}
