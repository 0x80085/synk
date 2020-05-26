import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, tap, take, filter, map, mapTo } from 'rxjs/operators';
import { ChatService } from '../chat.service';
import { Message } from '../models/room.models';
import { NzNotificationService } from 'ng-zorro-antd';

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

  messages$: Observable<Message[]> = this.chatServ.roomMessages$
    .pipe(
      debounceTime(10),
      distinctUntilChanged()
    );

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
      const feed: HTMLDivElement = this.feed.nativeElement.children[1];
      feed.scrollTop = feed.scrollHeight;
    } catch (error) { }
  }

  ngOnInit() {
    this.chatServ.enterRoom(this.name);
  }

  ngOnDestroy() {
    this.sendMessageSub.unsubscribe();
    this.chatServ.exit(this.name);
  }

  ngAfterViewChecked() {
    this.scrollChatFeedDown();
  }
}
