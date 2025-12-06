import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmconsultasComponent } from './frmconsultas.component';

describe('FrmconsultasComponent', () => {
  let component: FrmconsultasComponent;
  let fixture: ComponentFixture<FrmconsultasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrmconsultasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrmconsultasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
