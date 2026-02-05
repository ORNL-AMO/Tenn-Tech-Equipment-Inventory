import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Webcam } from './webcam';

describe('Webcam', () => {
  let component: Webcam;
  let fixture: ComponentFixture<Webcam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Webcam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Webcam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
