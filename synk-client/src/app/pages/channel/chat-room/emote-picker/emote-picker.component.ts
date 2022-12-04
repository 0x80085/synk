import { Component, EventEmitter, Output } from '@angular/core';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmoteService } from '../../emote.service';

@Component({
  selector: 'app-emote-picker',
  templateUrl: './emote-picker.component.html',
  styleUrls: ['./emote-picker.component.scss'],
})
export class EmotePickerComponent {
  @Output() emoteSelect = new EventEmitter<EmojiData>();

  customEmojis = this.emoteService.customEmojis;

  constructor(private emoteService: EmoteService) {}

  selectEmoji(event: any) {
    const emote = event.emoji as EmojiData;
    this.emoteSelect.emit(emote);
  }
}
