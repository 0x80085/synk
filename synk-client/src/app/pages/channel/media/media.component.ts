import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { BaseMediaComponent } from './base-media.component';
import { YoutubeComponent } from './youtube/youtube.component';

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
export class MediaComponent implements BaseMediaComponent, OnInit {

  @Input() mediaUrl: string;

  @ViewChild(MediaHostDirective, { static: true }) host: MediaHostDirective;

  ref: ComponentRef<BaseMediaComponent>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  play(): void {
    this.ref.instance.play();
  }
  pause(): void {
    this.ref.instance.pause();
  }
  seek(to: number): void {
    this.ref.instance.seek(to);
  }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.getCompatibleMediaComponent(this.mediaUrl));

    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();

    this.ref = viewContainerRef.createComponent(componentFactory);
    (this.ref.instance as BaseMediaComponent).start(this.mediaUrl);
  }

  getCompatibleMediaComponent(url: string): Type<BaseMediaComponent> {
    return YoutubeComponent;
  }

}

