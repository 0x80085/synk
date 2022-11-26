import { Injectable } from '@angular/core';
import { EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { CUSTOM_EMOJIS } from './chat-room/message-input/custom-emoji.data';

@Injectable({
  providedIn: 'root',
})
export class EmoteService {
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
  ].reduce(
    (collector, curentItem) => {
      collector[curentItem.shortName] = curentItem
      return collector
    },
    {}
  );

  constructor(private emojiMart: EmojiService) {}

  /**
   * Replaces :words_like_this:, :this: :+or: :-this_one: (if known emote) with renderable content for emote
   * @param inputText text to parse to html
   * @returns parsed text
   */
  parseText(inputText: string) {
    let parsedText: string = this.replaceSelectorsWithGraphic(inputText);
    return parsedText;
  }

  private replaceSelectorsWithGraphic(inputText: string): string {
    let parsedText: string = inputText;

    const emoteData: {
      id: string;
      index: number;
    }[] = this.getEmoteKeysFromText(inputText);

    console.log(emoteData);

    if (emoteData.length == 0) {
      return parsedText;
    }
    const uniqueEmotes = [...new Set(emoteData)];

    uniqueEmotes.forEach(({ id }) => {
      const emoteRef = this.allEmojisByColonKey[id];
      if (emoteRef) {
        parsedText = this.replaceKeyWithEmoteGraphic(emoteRef, parsedText);
      }
    });

    return parsedText;
  }

  private replaceKeyWithEmoteGraphic(emoteRef: any, parsedText: string) {
    if (emoteRef.native) {
      parsedText = parsedText.replace(
        `:${emoteRef.shortName}:`,
        emoteRef.native
      );
    } else {
      parsedText = parsedText.replace(
        `:${emoteRef.colons.replace(':', '')}:`,
        `<img class="emote-img" title="${emoteRef.colons.replace(':', '')}" src="${emoteRef.imageUrl}" loading="lazy"/>`
      );
    }
    return parsedText;
  }

  getEmoteKeysFromText(inputText: string) {
    const emojiRegex = /:([\w,\+,\-]+):/gim;
    let match;
    const emoteData: { id: string; index: number }[] = [];

    while ((match = emojiRegex.exec(inputText))) {
      emoteData.push({ id: match[1], index: match.index });
    }
    return emoteData;
  }
}
