import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, debounceTime, tap } from 'rxjs/operators';
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

  messages$: Observable<Message[]> = this.chatServ.roomMessages$
    .pipe(
      debounceTime(10),
      distinctUntilChanged()
    );

  constructor(private chatServ: ChatService) { }

  @HostListener('scroll', ['$event']) onScroll($event: Event): void {
    console.log($event.target);
  }

  onSendMessageToGroup() {
    this.chatServ.sendMessageToRoom({ text: this.msgBoxValue.trim() }, this.name);
    this.msgBoxValue = '';
  }

  ngOnInit() {
    this.chatServ.enterRoom(this.name);
  }

  ngOnDestroy() {
    this.chatServ.exit(this.name);
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
