import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamCompComponent } from './cam-comp-component';

describe('CamCompComponent', () => {
  let component: CamCompComponent;
  let fixture: ComponentFixture<CamCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CamCompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CamCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
