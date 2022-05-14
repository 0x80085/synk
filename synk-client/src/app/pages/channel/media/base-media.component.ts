import { EventEmitter } from '@angular/core';

export interface BaseMediaComponent {
  mediaEnded: EventEmitter<unknown>;
  mediaNotPlayable: EventEmitter<unknown>;
  isPlaying(): boolean;
  play(url?: string): void;
  pause(): void;
  seek(to: number): void;
  getCurrentTime(): number;
  getCurrentUrl(): string;
  setCurrentUrl(url:string): void;
}
