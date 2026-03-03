import { TestBed } from '@angular/core/testing';

import { OCRService } from './ocr';

describe('OCRService', () => {
  let service: OCRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OCRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});