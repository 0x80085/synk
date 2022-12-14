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
import { BehaviorSubject, Subscription } from 'rxjs';
import { isTwitchChannelUrl, TwitchComponent } from './twitch/twitch.component';
import { isVimeoUrl, PlyrComponent } from './plyr/plyr.component';
import { debugLog } from 'src/app/utils/custom.operators';
import { PlyrIframeComponent } from './plyr-iframe/plyr-iframe.component';


export enum SupportedPlayers {
  YT = 'YT',
  HTML5 = 'HTML5',
  TWITCH = 'TWITCH',
  VIMEO = 'VIMEO',
  IFRAME = 'IFRAME',
}

// tslint:disable-next-line: directive-selector
@Directive({ selector: '[appMediaHost]' })
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

  @Output() mediaNotPlayble: EventEmitter<string> = new EventEmitter();

  @ViewChild(MediaHostDirective, { static: true }) host: MediaHostDirective;

  ref: ComponentRef<BaseMediaComponent>;

  mediaEndedSubscription: Subscription;

  mediaNotPlayableSubscription: Subscription;

  isMediaSelected = new BehaviorSubject(false);

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
    try {
      return this.ref.instance.getCurrentTime();
    } catch (error) {
      debugLog("this.ref.instance not available - prob no player rendered.", error, true);
      return null;
    }
  }

  getCurrentUrl(): string {
    try {
      return this.ref.instance.getCurrentUrl();
    } catch (error) {
      debugLog("this.ref.instance not available - prob no player rendered.", error, true);
      return null;
    }
  }

  isPlaying() {
    return this.ref && this.ref.instance.isPlaying();
  }

  getDuration() {
    return this.ref && this.ref.instance.getDuration();
  }

  private setupMediaPlayer(url: string) {
    this.isMediaSelected.next(true);

    const playerType = this.resolveMediaType(url);
    debugLog(`${playerType} media type detected`)

    this.createPlayerOfType(playerType);
    this.ref.instance.setCurrentUrl(url);
  }

  private resolveMediaType(url: string) {
    const isTwitch = isTwitchChannelUrl(url);
    const isVimeo = isVimeoUrl(url);
    const isYT = isValidYTid(url);
    const isIframe = /(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/gi.test(url);

    if (isTwitch) {
      return SupportedPlayers.TWITCH;
    } else if (isYT) {
      return SupportedPlayers.YT;
    } else if (isVimeo) {
      return SupportedPlayers.VIMEO;
    } else if(isIframe){
      return SupportedPlayers.IFRAME;
    }
    else {
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
      case SupportedPlayers.VIMEO:
        this.assemblePlayer(PlyrComponent);
        break;
      case SupportedPlayers.IFRAME:
        console.warn('IFRAME ASSEMBLE');
        this.assemblePlayer(PlyrIframeComponent);
        break;
      default:
        console.warn('PLYR ASSEMBLE');

      this.assemblePlayer(PlyrComponent);
        break;
    }
  }

  private assemblePlayer(type: Type<BaseMediaComponent>) {
    const isSameAsCurrentPlayer = this.ref && this.ref.componentType === type;

    if (isSameAsCurrentPlayer) {
      return;
    }

    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      type
    );
    this.ref = viewContainerRef.createComponent(componentFactory);
    this.resetMediaEndedSubscription();
    this.resetMediaNotPlaybleSubscription();
  }

  private resetMediaEndedSubscription() {
    if (this.mediaEndedSubscription) { this.mediaEndedSubscription.unsubscribe(); }
    this.mediaEndedSubscription = this.ref.instance.mediaEnded.subscribe(() => {
      this.mediaEndedEvent.emit();
    });
  }

  private resetMediaNotPlaybleSubscription() {
    if (this.mediaNotPlayableSubscription) { this.mediaNotPlayableSubscription.unsubscribe(); }
    this.mediaNotPlayableSubscription = this.ref.instance.mediaNotPlayable.subscribe((url: string) => {
      this.mediaNotPlayble.emit(url);
    });
  }
}
