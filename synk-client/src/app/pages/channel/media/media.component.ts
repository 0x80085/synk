import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  EventEmitter,
  ViewChild,
  ViewContainerRef,
  Output,
  Type,
} from '@angular/core';

import { BaseMediaComponent } from './base-media.component';
import { YoutubeComponent, isValidYTid } from './youtube/youtube.component';
import { Subscription } from 'rxjs';
import { Html5Component } from './html5/html5.component';
import { isTwitchChannelUrl, TwitchComponent } from './twitch/twitch.component';
import { PlyrComponent } from './plyr/plyr.component';

export enum SupportedPlayers {
  YT = 'YT',
  HTML5 = 'HTML5',
  TWITCH = 'TWITCH',
}

// tslint:disable-next-line: directive-selector
@Directive({ selector: '[mediaHost]' })
export class MediaHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent {
  @Output() mediaEndedEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MediaHostDirective, { static: true }) host: MediaHostDirective;

  ref: ComponentRef<BaseMediaComponent>;

  videoEndedSubscription: Subscription;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  play(url: string): void {
    this.setupMediaPlayer(url);
    this.ref.instance.play(url);
  }

  pause(): void {
    this.ref.instance.pause();
  }

  seek(to: number): void {
    this.ref.instance.seek(to);
  }

  getCurrentTime() {
    return this.ref.instance.getCurrentTime();
  }

  getCurrentUrl(): string {
    return this.ref.instance.getCurrentUrl();
  }

  isPlaying() {
    return this.ref && this.ref.instance.isPlaying();
  }

  private setupMediaPlayer(url: string) {
    const playerType = this.resolveMediaType(url);

    this.createPlayerOfType(playerType);
    this.ref.instance.setCurrentUrl(url);
  }

  private resolveMediaType(url: string) {
    const isTwitch = isTwitchChannelUrl(url);
    const isYT = isValidYTid(url);
    if (isTwitch) {
      return SupportedPlayers.TWITCH;
    } else if (isYT) {
      return SupportedPlayers.YT;
    } else {
      return SupportedPlayers.HTML5;
    }
  }

  private createPlayerOfType(type: string) {
    switch (type) {
      case SupportedPlayers.YT:
        this.assemblePlayer(YoutubeComponent);
        break;
      case SupportedPlayers.TWITCH:
        this.assemblePlayer(TwitchComponent);
        break;
      default:
        this.assemblePlayer(PlyrComponent);
        // this.assemblePlayer(Html5Component);
        break;
    }
  }

  private assemblePlayer(type: Type<BaseMediaComponent>) {
    const isSameAsCurrentPlayer = this.ref && this.ref.componentType === type;

    if (isSameAsCurrentPlayer) {
      console.log('same as current');
      return;
    }

    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      type
    );
    this.ref = viewContainerRef.createComponent(componentFactory);
    this.resetVideoEndedSubscription();
  }

  private resetVideoEndedSubscription() {
    if (this.videoEndedSubscription) { this.videoEndedSubscription.unsubscribe(); }
    this.videoEndedSubscription = this.ref.instance.videoEnded.subscribe(ev => {
      this.mediaEndedEvent.emit();
    });
  }


}
