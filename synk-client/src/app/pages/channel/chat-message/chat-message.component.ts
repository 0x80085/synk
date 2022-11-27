import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EmojiSearch } from '@ctrl/ngx-emoji-mart';
import { EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
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

  allEmojisByColonKey = [
    ...this.emojiMart.emojis,
    ...this.customEmojis.map(({ name, shortNames, imageUrl }) => ({
      id: name,
      native: null,
      shortName: shortNames[0],
      colons: shortNames[0],
      name,
      imageUrl,
    })),
  ].reduce((collector, curentItem) => {
    collector[curentItem.shortName] = curentItem;
    return collector;
  }, {});

  @Input() message: Message;

  private userNameSubject = new BehaviorSubject('');
  userName = this.userNameSubject.pipe();

  private parsedMessageSubject = new BehaviorSubject('');
  parsedMessage$: Observable<MessagePart[]> = this.parsedMessageSubject.pipe(
    tap((it) => console.warn('chat message: ', it)),
    switchMap((text) =>
      this.emoteService.getEmoteKeysFromText(text).length > 0
        ? of(text).pipe(
            map((it) => {
              const splitByEmojiRegex = it.split(emoteRegex);
              console.warn('chatmessage: ', splitByEmojiRegex);
              return splitByEmojiRegex;
            }),
            map((parts) => {
              const messageParts: MessagePart[] = parts.map((part) => {
                if (!emoteRegex.test(part)) {
                  return {
                    text: part,
                    emote: null,
                  };
                }
                const withoutColons = part.replaceAll(':', '');
                console.warn('chat message ', withoutColons);
                return {
                  emote: {
                    imageUrl: this.allEmojisByColonKey[withoutColons]?.imageUrl,
                    native: this.allEmojisByColonKey[withoutColons]?.native,
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
    ),
    tap((it) => console.warn('chat message parsed: ', it))
  );

  constructor(
    private emoteService: EmoteService,
    private emojiMart: EmojiService,
    private emojiMartSearch: EmojiSearch // wat do
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.parsedMessageSubject.next(
      (changes['message'] as any).currentValue.text
    );
    console.warn('chatmessage: ', changes);
  }
}
