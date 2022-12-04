import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  ViewChild
} from '@angular/core';
import {
  BehaviorSubject,
  map, Subject
} from 'rxjs';
import { EmoteService } from '../../emote.service';
import { Message } from '../../models/room.models';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  @HostListener('keydown.enter', ['$event'])
  onEnter(evt: KeyboardEvent) {
    evt.preventDefault();
  }

  @Output() submitMessage = new EventEmitter<string>();

  @ViewChild('messageInput', { static: true })
  messageInputElement: HTMLTextAreaElement;

  msgBoxValue: string = '';

  inputChangedSubject = new BehaviorSubject<string>('');
  submitPressedSubject: Subject<{ ev?: any; text: string }> = new Subject();

  inputChange$ = this.inputChangedSubject.pipe(
    map((text) => ({
      text,
      hasEmotes: this.emoteService.getEmoteKeysFromText(text).length > 0,
    })),
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
    this.msgBoxValue = this.msgBoxValue + event.colons;
    this.inputChangedSubject.next(this.msgBoxValue);
    (this.messageInputElement as any).nativeElement.focus();
  }

  onSubmit() {
    this.submitMessage.next(this.msgBoxValue);
    this.msgBoxValue = '';
    this.inputChangedSubject.next('');
  }
}
