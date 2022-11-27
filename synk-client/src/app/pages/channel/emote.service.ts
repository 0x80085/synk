import { Injectable } from '@angular/core';
import { EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {
  distinctUntilChanged,
  map,
  of,
  OperatorFunction,
  switchMap,
} from 'rxjs';
import { CUSTOM_EMOJIS } from './chat-room/message-input/custom-emoji.data';

export interface MessagePart {
  text: string;
  emote?: {
    native: string;
    imageUrl: string;
  };
}

export const EMOTE_REGEX = /(:[\w,\+,\-]+:)/g;

@Injectable({
  providedIn: 'root',
})
export class EmoteService {
  customEmojis = CUSTOM_EMOJIS;

  allEmotesById = [
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

  constructor(private emojiMart: EmojiService) {}

  parseToMessageParts(): OperatorFunction<string, MessagePart[]> {
    return (input$) =>
      input$.pipe(
        distinctUntilChanged(),
        switchMap((text) =>
          this.getEmoteKeysFromText(text).length > 0
            ? of(text).pipe(
                map((text) => text.split(EMOTE_REGEX)),
                map((parts) => parts.map((part) => this.parseMessagePart(part)))
              )
            : of([
                {
                  emoji: null,
                  text,
                } as MessagePart,
              ])
        ),
      );
  }

  getEmoteKeysFromText(inputText: string) {
    let match;
    const emoteData: { id: string; index: number }[] = [];

    while ((match = EMOTE_REGEX.exec(inputText))) {
      emoteData.push({ id: match[1], index: match.index });
    }
    return emoteData;
  }

  private parseMessagePart(part: string) {
    if (!EMOTE_REGEX.test(part)) {
      return {
        text: part,
        emote: null,
      };
    }
    const inputWithoutColons = part.replaceAll(':', '');
    const foundEmote = this.allEmotesById[inputWithoutColons];
    return {
      emote: foundEmote
        ? {
            imageUrl: foundEmote.imageUrl,
            native: foundEmote.native,
          }
        : null,
      text: part,
    };
  }
}
