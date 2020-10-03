import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NekoBannerComponent } from './neko-banner.component';

describe('NekoBannerComponent', () => {
  let component: NekoBannerComponent;
  let fixture: ComponentFixture<NekoBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NekoBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NekoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
