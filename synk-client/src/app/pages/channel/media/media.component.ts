import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Output
} from '@angular/core';

import { BaseMediaComponent } from './base-media.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { EventEmitter } from '@angular/core';

// tslint:disable-next-line: directive-selector
@Directive({ selector: '[mediaHost]' })
export class MediaHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {
  @Output() mediaEndedEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MediaHostDirective, { static: true }) host: MediaHostDirective;

  ref: ComponentRef<BaseMediaComponent>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.loadComponent();
  }

  start(url: string) {
    this.ref.instance.start(url);
  }

  play(url: string): void {
    this.ref.instance.play(url);
  }

  pause(): void {
    this.ref.instance.pause();
  }

  seek(to: number): void {
    console.log('basmedia seek');

    this.ref.instance.seek(to);
  }

  getCurrentTime() {
    return this.ref.instance.getCurrentTime();
  }

  getCurrentUrl(): string {
    return this.ref.instance.getCurrentUrl();
  }

  isPlaying() {
    return this.ref.instance.getCurrentUrl();
  }

  private loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      YoutubeComponent
    );

    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();

    this.ref = viewContainerRef.createComponent(componentFactory);

    this.ref.instance.videoEnded.subscribe(ev => {
      this.mediaEndedEvent.emit();
    });
  }
}
