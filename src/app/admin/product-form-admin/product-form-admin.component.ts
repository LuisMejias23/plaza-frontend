// src/app/admin/product-form-admin/product-form-admin.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/product/product.service';
import { Product } from '../../shared/models/Product';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importa módulos de formularios

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Añade FormsModule y ReactiveFormsModule
  templateUrl: './product-form-admin.component.html',
  styleUrl: './product-form-admin.component.css'
})
export class ProductFormAdminComponent implements OnInit {
  productForm!: FormGroup; // Usamos FormGroup para el formulario reactivo
  productId: string | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Define algunas categorías y marcas de ejemplo para el formulario
  categories: string[] = ['Electrónica', 'Ropa', 'Hogar', 'Libros', 'Juguetes', 'Comida'];
  brands: string[] = ['Marca A', 'Marca B', 'Marca C', 'Genérica'];

  constructor(
    private fb: FormBuilder, // Inyecta FormBuilder
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.initializeForm(); // Inicializa el formulario al inicio

    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      if (this.productId) {
        this.isEditMode = true;
        this.loadProductForEdit(this.productId);
      } else {
        this.isEditMode = false;
        this.isLoading = false; // No hay carga si es un nuevo producto
      }
    });
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]], // Validar URL
      brand: ['', Validators.required],
      category: ['', Validators.required],
      countInStock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadProductForEdit(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product); // Rellenar el formulario con los datos del producto
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar producto para edición:', error);
        this.errorMessage = error.error?.message || 'No se pudo cargar el producto para editar.';
        this.isLoading = false;
        this.router.navigate(['/admin/products']); // Redirigir si el producto no se encuentra
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.productForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos y válidos.';
      this.productForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores
      return;
    }

    const productData: Product = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (updatedProduct) => {
          this.successMessage = 'Producto actualizado exitosamente.';
          console.log('Producto actualizado:', updatedProduct);
          setTimeout(() => {
            this.router.navigate(['/admin/products']); // Volver a la lista después de un éxito
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          this.errorMessage = error.error?.message || 'No se pudo actualizar el producto.';
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: (newProduct) => {
          this.successMessage = 'Producto creado exitosamente.';
          console.log('Producto creado:', newProduct);
          setTimeout(() => {
            this.router.navigate(['/admin/products']); // Volver a la lista después de un éxito
          }, 2000);
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          this.errorMessage = error.error?.message || 'No se pudo crear el producto.';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']); // Volver a la lista de productos
  }
}