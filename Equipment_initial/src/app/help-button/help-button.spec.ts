import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpButton } from './help-button';

describe('HelpButton', () => {
  let component: HelpButton;
  let fixture: ComponentFixture<HelpButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
