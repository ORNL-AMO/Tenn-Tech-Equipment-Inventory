import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OCRComponent } from './ocr.component';

describe('Webcam', () => {
  let component: OCRComponent;
  let fixture: ComponentFixture<OCRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OCRComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OCRComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
