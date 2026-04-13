import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpButtonDialog } from './help-button';

describe('HelpButton', () => {
  let component: HelpButtonDialog;
  let fixture: ComponentFixture<HelpButtonDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpButtonDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpButtonDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
