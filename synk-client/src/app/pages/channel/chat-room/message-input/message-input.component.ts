import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { EmojiData, EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { CUSTOM_EMOJIS } from './custom-emoji.data';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
})
export class MessageInputComponent {
  @HostListener('keydown.enter', ['$event'])
  onEnter(evt: KeyboardEvent) {
    evt.preventDefault();
  }

  @Output() submitMessage = new EventEmitter<string>();

  customEmojis = CUSTOM_EMOJIS;

  msgBoxValue: string = '';

  inputChangedSubject = new BehaviorSubject<string>('');
  submitPressedSubject: Subject<{ ev?: any; text: string }> = new Subject();

  inputParsed$ = this.inputChangedSubject.pipe(
    map((inputText) => {
      console.log(inputText);

      const emojiRegex = /:([\w,\+,\-]+):/gim;
      let match;
      const emojiKeys = [];
      const emojiData: { id: string; index: number }[] = [];

      while ((match = emojiRegex.exec(inputText))) {
        // console.log(match);
        // [':sad:', 'sad', index: 12, input: 'hard :cry:  :sad:  ', groups: undefined]
        emojiKeys.push(...match.slice(1));
        emojiData.push({ id: match[1], index: match.index });
      }

      console.log(emojiData);

      emojiKeys.forEach((key) => {
        const emojiMartRef = [
          ...this.emojiService.emojis,
          ...this.customEmojis.map(({ name, shortNames }) => ({
            id: name,
            native: null,
            shortName: shortNames[0],
            colons: shortNames[0],
            name,
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
            // place emoji
          } else {
            // place img
          }
        }
      });

      return inputText;
    })
  );

  constructor(private emojiService: EmojiService) {}

  addEmoji(event: any) {
    this.msgBoxValue = this.msgBoxValue + (event.emoji as EmojiData).colons;
    this.inputChangedSubject.next(this.msgBoxValue);
  }
}
