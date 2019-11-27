import { Output, EventEmitter } from '@angular/core';

export interface BaseMediaComponent {
  videoEnded: EventEmitter<unknown>;
  url: string;
  start?(url: string): void;
  play(): void;
  pause(): void;
  seek(to: number): void;
  getCurrentTime(): number;
}
