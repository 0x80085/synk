import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Html5Component } from './html5.component';

describe('Html5Component', () => {
  let component: Html5Component;
  let fixture: ComponentFixture<Html5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Html5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Html5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
