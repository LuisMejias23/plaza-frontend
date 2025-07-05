// src/app/admin/product-list-admin/product-list-admin.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common'; // Importa CurrencyPipe
import { ProductService } from '../../products/product.service'; // Asegúrate de que la ruta sea correcta
import { Product } from '../../shared/models/Product';
import { RouterModule, Router } from '@angular/router'; // Importa Router también

@Component({
  selector: 'app-product-list-admin',
  standalone: true,
  imports: [CommonModule, RouterModule], // Agrega CurrencyPipe
  templateUrl: './product-list-admin.component.html',
  styleUrl: './product-list-admin.component.css'
})
export class ProductListAdminComponent implements OnInit {
  products: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null; // Limpiar mensajes al recargar
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos para admin:', error);
        this.errorMessage = error.error?.message || 'No se pudieron cargar los productos.';
        this.isLoading = false;
      }
    });
  }

  editProduct(id: string): void {
    this.router.navigate(['/admin/products/edit', id]);
  }

  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.successMessage = 'Producto eliminado exitosamente.';
          this.loadProducts(); // Recargar la lista de productos
          setTimeout(() => this.successMessage = null, 3000); // Ocultar mensaje después de 3 segundos
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          this.errorMessage = error.error?.message || 'No se pudo eliminar el producto.';
          setTimeout(() => this.errorMessage = null, 3000); // Ocultar mensaje después de 3 segundos
        }
      });
    }
  }

  createNewProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }
}