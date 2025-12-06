import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacionOtpComponent } from './verificacion-otp.component';

describe('VerificacionOtpComponent', () => {
  let component: VerificacionOtpComponent;
  let fixture: ComponentFixture<VerificacionOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificacionOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificacionOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
