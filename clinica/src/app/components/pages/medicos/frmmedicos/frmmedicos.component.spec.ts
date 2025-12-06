import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmmedicosComponent } from './frmmedicos.component';

describe('FrmmedicosComponent', () => {
  let component: FrmmedicosComponent;
  let fixture: ComponentFixture<FrmmedicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrmmedicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrmmedicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
