import { TestBed } from '@angular/core/testing';

import { ImageUtils } from './image-utils';

describe('ImageUtils', () => {
  let service: ImageUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
