import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImage } from './upload-image';

describe('UploadImage', () => {
  let component: UploadImage;
  let fixture: ComponentFixture<UploadImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
