import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedMembersComponent } from './connected-members.component';

describe('ConnectedMembersComponent', () => {
  let component: ConnectedMembersComponent;
  let fixture: ComponentFixture<ConnectedMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectedMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
