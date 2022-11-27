import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap
} from 'rxjs';
import { CUSTOM_EMOJIS } from '../chat-room/message-input/custom-emoji.data';
import { EmoteService } from '../emote.service';
import { Message } from '../models/room.models';

interface MessagePart {
  text: string;
  emote?: {
    native: string;
    imageUrl: string;
  };
}

const emoteRegex = /(:[\w,\+,\-]+:)/g;

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnChanges {
  customEmojis = CUSTOM_EMOJIS;

  allEmotesById = this.emoteService.allEmojisByColonKey;

  @Input() message: Message;

  private messageSubject = new BehaviorSubject('');
  parsedMessage$: Observable<MessagePart[]> = this.messageSubject.pipe(
    distinctUntilChanged(),
    switchMap((text) =>
      this.emoteService.getEmoteKeysFromText(text).length > 0
        ? of(text).pipe(
            map((text) => text.split(emoteRegex)),
            map((parts) => {
              const messageParts: MessagePart[] = parts.map((part) => {
                if (!emoteRegex.test(part)) {
                  return {
                    text: part,
                    emote: null,
                  };
                }
                const inputWithoutColons = part.replaceAll(':', '');
                return {
                  emote: {
                    imageUrl: this.allEmotesById[inputWithoutColons]?.imageUrl,
                    native: this.allEmotesById[inputWithoutColons]?.native,
                  },
                  text: part,
                };
              });
              return messageParts;
            })
          )
        : of([
            {
              emoji: null,
              text,
            } as MessagePart,
          ])
    )
  );

  constructor(
    private emoteService: EmoteService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.messageSubject.next((changes['message'] as any).currentValue.text);
  }
}
