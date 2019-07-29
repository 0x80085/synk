import { TestBed } from '@angular/core/testing';

import { ChatserviceService } from './chatservice.service';

describe('ChatserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatserviceService = TestBed.get(ChatserviceService);
    expect(service).toBeTruthy();
  });
});
