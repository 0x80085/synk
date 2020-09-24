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

  @Input()
  get time() {
    return this.getVideoTag().currentTime;
  }

  set time(val: number) {
    const video: HTMLVideoElement = this.getVideoTag();
    if (video && val) {
      if (val > video.duration) {
        val = video.duration;
      }
      if (val < 0) {
        val = 0;
      }
      if (Math.abs(val - video.currentTime) > 0.0001) {
        video.currentTime = val;
      }
      if (Math.abs(this.lastTime - video.currentTime) > 0.0001) {
        setTimeout(() => this.timeChange.emit(video.currentTime), 0);
        this.lastTime = video.currentTime;
      }
    }
  }

  constructor(private renderer: Renderer2, private evt: EventService) { }
  @ViewChild("video", { static: false }) private video: ElementRef;

  @Input() title: string = null;
  @Input() autoplay = false;
  @Input() preload = true;
  @Input() quality = true;
  @Input() fullscreen = true;
  @Input() poster: string = null;
  @Input() keyboard = true;

  @Output() timeChange = new EventEmitter<number>();

  src: string | MediaStream | MediaSource | Blob = null;

  playing = false;

  isFullscreen = false;

  videoWidth: number;
  videoHeight: number;
  lastTime: number;

  videoLoaded = false;

  videoEnded: EventEmitter<unknown> = new EventEmitter();

  private srcObjectURL: string;

  private events: any[];


  setCurrentUrl(url: string): void {
    this.setVideoSrc(url);
  }

  isPlaying(): boolean {
    return this.videoLoaded;
  }
  play(url?: string): void {
    this.setVideoSrc(url);
    if (!this.videoLoaded) {
      this.load();
    }

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
    return this.time;
  }
  getCurrentUrl(): string {
    return this.srcObjectURL;
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
        name: "error",
        callback: event => console.error("Unhandled Video Error", event),
        dispose: null
      },
      {
        element: this.video.nativeElement,
        name: "timeupdate",
        callback: event => this.evTimeUpdate(event),
        dispose: null
      }
    ];
    this.video.nativeElement.onloadeddata = () => {
      this.videoLoaded = true;
      const player = this.video.nativeElement as HTMLVideoElement;
      this.setVideoSrc(this.src);
      this.play();
    };
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

  evTimeUpdate(event: any): void {
    this.time = this.getVideoTag().currentTime;
  }

  private setVideoSrc(src: string | MediaStream | MediaSource | Blob): void {
    this.src = src;

    if (this.srcObjectURL) {
      URL.revokeObjectURL(this.srcObjectURL);
      this.srcObjectURL = null;
    }

    if (!this.video || !this.video.nativeElement) {
      return;
    }

    if (!src) {
      this.video.nativeElement.src = null;
      if ("srcObject" in HTMLVideoElement.prototype) {
        this.video.nativeElement.srcObject = new MediaStream();
      }
    } else if (typeof src === "string") {
      this.video.nativeElement.src = src;
    } else if ("srcObject" in HTMLVideoElement.prototype) {
      this.video.nativeElement.srcObject = src;
    } else {
      this.srcObjectURL = URL.createObjectURL(src);
      this.video.nativeElement.src = this.srcObjectURL;
    }
  }
}
