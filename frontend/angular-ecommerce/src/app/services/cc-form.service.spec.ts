import { TestBed } from '@angular/core/testing';

import { CcFormService } from './cc-form.service';

describe('CcFormService', () => {
  let service: CcFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
