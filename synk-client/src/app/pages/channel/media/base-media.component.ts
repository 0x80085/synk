export interface BaseMediaComponent {
  start?(url: string): void;
  play(): void;
  pause(): void;
  seek(to: number): void;
}
