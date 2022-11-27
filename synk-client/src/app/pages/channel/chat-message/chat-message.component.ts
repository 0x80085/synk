import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  BehaviorSubject, Observable
} from 'rxjs';
import { EmoteService, MessagePart } from '../emote.service';
import { Message } from '../models/room.models';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnChanges {

  @Input() message: Message;

  private messageSubject = new BehaviorSubject('');
  parsedMessage$: Observable<MessagePart[]> = this.messageSubject.pipe(
    this.emoteService.parseToMessageParts()
  );

  constructor(
    private emoteService: EmoteService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.messageSubject.next((changes['message'] as any).currentValue.text);
  }
}
