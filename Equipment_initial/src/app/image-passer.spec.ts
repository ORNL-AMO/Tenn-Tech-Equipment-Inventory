import { TestBed } from '@angular/core/testing';

import { ImagePasser } from './image-passer';

describe('ImagePasser', () => {
  let service: ImagePasser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagePasser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
