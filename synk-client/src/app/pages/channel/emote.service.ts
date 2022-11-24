import { Injectable } from '@angular/core';
import { EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { CUSTOM_EMOJIS } from './chat-room/message-input/custom-emoji.data';

@Injectable({
  providedIn: 'root',
})
export class EmoteService {
  customEmojis = CUSTOM_EMOJIS;

  constructor(private emojiService: EmojiService) {}

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

    const emojiRegex = /:([\w,\+,\-]+):/gim;
    let match;
    const emojiData: { id: string; index: number }[] = [];

    while ((match = emojiRegex.exec(inputText))) {
      emojiData.push({ id: match[1], index: match.index });
    }

    console.log(emojiData);

    if (emojiData.length == 0) {
      return parsedText;
    }

    emojiData.forEach(({ id: key }) => {
      const emojiMartRef = [
        ...this.emojiService.emojis,
        ...this.customEmojis.map(({ name, shortNames, imageUrl }) => ({
          id: name,
          native: null,
          shortName: shortNames[0],
          colons: shortNames[0],
          name,
          imageUrl,
        })),
      ].find(
        (e) =>
          e.id === key ||
          e.shortName === key ||
          (e.colons && e.colons.replace(':', '') === key)
      );
      if (emojiMartRef) {
        console.log('found emoji:');
        console.warn(emojiMartRef.name);
        if (emojiMartRef.native) {
          parsedText = parsedText.replace(
            `:${emojiMartRef.shortName}:`,
            emojiMartRef.native
          );
        } else {
          parsedText = parsedText.replace(
            `:${emojiMartRef.colons.replace(':', '')}:`,
            `<img class="emote-img" src="${emojiMartRef.imageUrl}"/>`
          );
        }
        console.log(emojiMartRef.colons);
      }
    });
    return parsedText;
  }
}
