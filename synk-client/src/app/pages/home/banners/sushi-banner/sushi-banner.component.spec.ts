import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SushiBannerComponent } from './sushi-banner.component';

describe('SushiBannerComponent', () => {
  let component: SushiBannerComponent;
  let fixture: ComponentFixture<SushiBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SushiBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SushiBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
