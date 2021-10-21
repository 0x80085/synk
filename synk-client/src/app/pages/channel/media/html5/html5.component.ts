import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import { BaseMediaComponent } from '../base-media.component';

@Component({
  selector: "app-video",
  templateUrl: "./html5.component.html",
  styleUrls: ["./html5.component.scss"]
})
export class Html5Component implements BaseMediaComponent, AfterViewInit, OnDestroy {

  constructor() { }
  @ViewChild("video", { static: false }) private video: ElementRef;

  src: string;

  playing = false;

  videoLoaded = false;

  @Output()
  mediaEnded: EventEmitter<unknown> = new EventEmitter();
  
  @Output()
  mediaNotPlayable: EventEmitter<unknown> = new EventEmitter();

  setCurrentUrl(url: string): void {
    this.setVideoSrc(url);
  }

  isPlaying(): boolean {
    return this.videoLoaded;
  }
  play(url?: string): void {
    this.setVideoSrc(url);

    if (this.videoLoaded) {
      const player = this.video.nativeElement as HTMLVideoElement;
      player.play();
    }
  }
  pause(): void {
    const player = this.video.nativeElement as HTMLVideoElement;
    player.pause();
  }
  seek(to: number): void {
    const player = this.video.nativeElement as HTMLVideoElement;
    player.currentTime = to;
  }
  getCurrentTime(): number {
    const player = this.video.nativeElement as HTMLVideoElement;
    return player.currentTime;
  }
  getCurrentUrl(): string {
    return this.src;
  }

  ngAfterViewInit(): void {
    this.video.nativeElement.onended = () => {
      this.mediaEnded.next();
    };
    this.video.nativeElement.onerror = (event: any) => {
      console.log(event);
      this.mediaEnded.next();
    };
    this.video.nativeElement.onloadeddata = () => {
      this.videoLoaded = true;
      const player = this.video.nativeElement as HTMLVideoElement;
      player.play();
    };
    this.setVideoSrc(this.src);
  }

  ngOnDestroy(): void {
    this.video.nativeElement.onloadeddata = null;
  }

  load(): void {
    if (this.video && this.video.nativeElement) {
      this.video.nativeElement.load();
    }
  }

  getVideoTag(): HTMLVideoElement | null {
    return this.video && this.video.nativeElement ? (this.video.nativeElement as HTMLVideoElement) : null;
  }

  private setVideoSrc(src: string): void {
    this.src = src;

    if (!this.video || !this.video.nativeElement) {
      console.log('setVideoSrc cant find player');

      return;
    }

    this.video.nativeElement.src = src;
  }
}
