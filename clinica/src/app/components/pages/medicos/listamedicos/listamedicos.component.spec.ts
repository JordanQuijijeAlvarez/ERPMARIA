import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListamedicosComponent } from './listamedicos.component';

describe('ListamedicosComponent', () => {
  let component: ListamedicosComponent;
  let fixture: ComponentFixture<ListamedicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListamedicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListamedicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
