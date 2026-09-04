import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpload } from './pop-upload';

describe('PopUpload', () => {
  let component: PopUpload;
  let fixture: ComponentFixture<PopUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
