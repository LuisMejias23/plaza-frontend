import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product.service'; // Importar el servicio de productos
import { Product } from '../../shared/models/Product'; // Importar el modelo de producto
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.errorMessage = error.message || 'No se pudieron cargar los productos.';
        this.isLoading = false;
        this.products = []; // Limpiar la lista en caso de error
      }
    });
  }
}
