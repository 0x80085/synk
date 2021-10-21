import { Component, EventEmitter, Output } from '@angular/core';
import { TwitchPlayer, TwitchPlayerEvent } from 'twitch-player';

import { BaseMediaComponent } from '../base-media.component';

export function isTwitchChannelUrl(url: string) {
  const regx = /^(?:https?:\/\/)?(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/
  return regx.test(url);
}

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss']
})
export class TwitchComponent implements BaseMediaComponent {

  @Output()
  mediaEnded: EventEmitter<unknown> = new EventEmitter();
  
  @Output()
  mediaNotPlayable: EventEmitter<unknown>;

  player: TwitchPlayer;

  private channel: string;
  private url: string;

  constructor() { }

  isPlaying(): boolean {
    return !this.player.isPaused();
  }

  play(url?: string): void {
    if (url) {
      this.setCurrentUrl(url);
      this.createPlayer(this.channel);
    }
    if (this.player && url) {
      this.player.setChannel(this.extractChannelNameFromUrl(url));
      this.player.play();
    }
  }

  pause(): void {
    this.player.pause();
  }

  seek(to: number): void {
    this.player.seek(to);
  }

  getCurrentTime(): number {
    return this.player.getCurrentTime();
  }

  getCurrentUrl(): string {
    return this.url;
  }

  setCurrentUrl(url: string): void {
    this.url = url;
    this.channel = this.extractChannelNameFromUrl(url);
  }

  ngAfterViewInit(): void {
    this.player.addEventListener(TwitchPlayerEvent.ENDED, () => this.mediaEnded.emit());
    this.player.setChannel(this.channel);
    this.player.play();
  }

  private createPlayer(channel: string) {
    this.player = TwitchPlayer.FromOptions('stage', {
      channel,
      autoplay: true,
      muted: false,
      height: '100%',
      width: '100%'
    });

  }

  private extractChannelNameFromUrl(url: string) {
    const urlObj = new URL(url);
    const channelName = urlObj.pathname.replace('/', '');
    return channelName;
  }
}
