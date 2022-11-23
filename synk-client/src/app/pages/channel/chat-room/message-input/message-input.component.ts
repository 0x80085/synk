import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { EmoteService } from '../../emote.service';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MessageInputComponent {
  @HostListener('keydown.enter', ['$event'])
  onEnter(evt: KeyboardEvent) {
    evt.preventDefault();
  }

  @Output() submitMessage = new EventEmitter<string>();

  customEmojis = this.emoteService.customEmojis;

  msgBoxValue: string = '';

  inputChangedSubject = new BehaviorSubject<string>('');
  submitPressedSubject: Subject<{ ev?: any; text: string }> = new Subject();

  inputParsed$ = this.inputChangedSubject.pipe(
    map((inputText) => this.emoteService.parseText(inputText))
  );

  constructor(private emoteService: EmoteService) {}

  addEmoji(event: any) {
    this.msgBoxValue = this.msgBoxValue + (event.emoji as EmojiData).colons;
    this.inputChangedSubject.next(this.msgBoxValue);
  }
  onSubmit() {
    this.submitMessage.next(this.msgBoxValue);
    this.msgBoxValue = '';
    this.inputChangedSubject.next('');
  }
}
