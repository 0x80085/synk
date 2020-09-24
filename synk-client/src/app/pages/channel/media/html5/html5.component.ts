import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild
} from "@angular/core";
import { BaseMediaComponent } from '../base-media.component';
import { EventService } from './events.service';

@Component({
  selector: "app-video",
  templateUrl: "./html5.component.html",
  styleUrls: ["./html5.component.scss"]
})
export class Html5Component implements BaseMediaComponent, AfterViewInit, OnDestroy {

  constructor(private renderer: Renderer2, private evt: EventService) { }
  @ViewChild("video", { static: false }) private video: ElementRef;

  src: string;

  playing = false;

  isFullscreen = false;

  videoWidth: number;
  videoHeight: number;

  videoLoaded = false;

  videoEnded: EventEmitter<unknown> = new EventEmitter();

  private events: any[];

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
    this.video.nativeElement.c = to;
  }
  getCurrentTime(): number {
    const player = this.video.nativeElement as HTMLVideoElement;
    return player.currentTime;
  }
  getCurrentUrl(): string {
    return this.src;
  }

  ngAfterViewInit(): void {
    this.events = [
      {
        element: this.video.nativeElement,
        name: "loadstart",
        callback: event => (this.videoLoaded = false),
        dispose: null
      },
      {
        element: this.video.nativeElement,
        name: "loadedmetadata",
        callback: event => this.evLoadedMetadata(event),
        dispose: null
      },
      {
        element: this.video.nativeElement,
        name: "ended",
        callback: event => this.videoEnded.next(event),
        dispose: null
      },
      {
        element: this.video.nativeElement,
        name: "error",
        callback: event => console.error("Unhandled Video Error", event),
        dispose: null
      },

    ];
    this.video.nativeElement.onloadeddata = () => {
      this.videoLoaded = true;
      const player = this.video.nativeElement as HTMLVideoElement;
      player.play();
    };
    this.setVideoSrc(this.src);
    this.evt.addEvents(this.renderer, this.events);
  }

  ngOnDestroy(): void {
    this.video.nativeElement.onloadeddata = null;
    this.evt.removeEvents(this.events);
  }

  load(): void {
    // Use https://angular.io/api/core/Renderer2
    if (this.video && this.video.nativeElement) {
      this.video.nativeElement.load();
    }
  }

  getVideoTag(): HTMLVideoElement | null {
    return this.video && this.video.nativeElement ? (this.video.nativeElement as HTMLVideoElement) : null;
  }

  evLoadedMetadata(event: any): void {
    this.videoWidth = this.video.nativeElement.videoWidth;
    this.videoHeight = this.video.nativeElement.videoHeight;
    this.videoLoaded = true;
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
