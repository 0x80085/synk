export interface BaseMediaComponent {
  url: string;
  start?(url: string): void;
  play(): void;
  pause(): void;
  seek(to: number): void;
}
