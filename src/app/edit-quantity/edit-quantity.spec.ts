import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditQuantity } from './edit-quantity';

describe('EditQuantity', () => {
  let component: EditQuantity;
  let fixture: ComponentFixture<EditQuantity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditQuantity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditQuantity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
