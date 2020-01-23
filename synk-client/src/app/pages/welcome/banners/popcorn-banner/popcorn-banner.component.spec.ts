import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopcornBannerComponent } from './popcorn-banner.component';

describe('PopcornBannerComponent', () => {
  let component: PopcornBannerComponent;
  let fixture: ComponentFixture<PopcornBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopcornBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopcornBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
