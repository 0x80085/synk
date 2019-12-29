import { Output, EventEmitter } from '@angular/core';

export interface BaseMediaComponent {
  videoEnded: EventEmitter<unknown>;
  isPlaying(): boolean;
  play(url?: string): void;
  pause(): void;
  seek(to: number): void;
  getCurrentTime(): number;
  getCurrentUrl(): string;
}
