import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelcontenidoComponent } from './panelcontenido.component';

describe('PanelcontenidoComponent', () => {
  let component: PanelcontenidoComponent;
  let fixture: ComponentFixture<PanelcontenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PanelcontenidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelcontenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
