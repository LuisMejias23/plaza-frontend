import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormAdminComponent } from './product-form-admin.component';

describe('ProductFormAdminComponent', () => {
  let component: ProductFormAdminComponent;
  let fixture: ComponentFixture<ProductFormAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFormAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
