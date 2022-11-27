import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {
  BehaviorSubject,
  map,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { EmoteService } from '../../emote.service';
import { Message } from '../../models/room.models';
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

  @ViewChild('messageInput', { static: true })
  messageInputElement: HTMLTextAreaElement;

  customEmojis = this.emoteService.customEmojis;

  msgBoxValue: string = '';

  inputChangedSubject = new BehaviorSubject<string>('');
  submitPressedSubject: Subject<{ ev?: any; text: string }> = new Subject();

  inputChange$ = this.inputChangedSubject.pipe(
    switchMap((text) =>
    this.emoteService.getEmoteKeysFromText(text).length > 0
        ? of(text).pipe(map((it) => ({ text: it, hasEmotes: true })))
        : of(text).pipe(map((it) => ({ text: it, hasEmotes: false })))
    ),
    map(({ text, hasEmotes }) => ({
      hasEmotes,
      text,
      message: {
        isSystemMessage: false,
        text,
      } as Message,
    }))
  );

  constructor(private emoteService: EmoteService) {}

  addEmoji(event: any) {
    this.msgBoxValue = this.msgBoxValue + (event.emoji as EmojiData).colons;
    this.inputChangedSubject.next(this.msgBoxValue);
    (this.messageInputElement as any).nativeElement.focus();
  }

  onSubmit() {
    this.submitMessage.next(this.msgBoxValue);
    this.msgBoxValue = '';
    this.inputChangedSubject.next('');
  }
}
