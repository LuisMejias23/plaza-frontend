import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Para obtener el ID de la URL y para redireccionar
import { ProductService } from '../product.service'; // Servicio para obtener detalles del producto
import { Product } from '../../shared/models/Product'; // Modelo de producto
import { CartItem } from '../../shared/models/User'; // Modelo de CartItem
import { FormsModule } from '@angular/forms'; // Para ngModel en el selector de cantidad
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  quantity: number = 1; // Cantidad por defecto para añadir al carrito
  isAddingToCart: boolean = false;
  addToCartMessage: string | null = null;
  addToCartError: string | null = null;

  constructor(
    private route: ActivatedRoute, // Para leer parámetros de la URL
    private productService: ProductService,
    private authService: AuthService, // Para chequear el estado del login
    private router: Router // Para redirigir
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.getProductDetails(productId);
      } else {
        this.errorMessage = 'ID de producto no proporcionado.';
        this.isLoading = false;
      }
    });
  }

  getProductDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el detalle del producto:', error);
        this.errorMessage = error.message || 'No se pudo cargar el detalle del producto.';
        this.isLoading = false;
        this.product = null; // En caso de error, limpiar el producto
      }
    });
  }

  addToCart(): void {
    this.addToCartMessage = null;
    this.addToCartError = null;

    if (!this.authService.currentUserValue) {
      this.addToCartError = 'Debes iniciar sesión para añadir productos al carrito.';
      setTimeout(() => this.router.navigate(['/login']), 2000); // Redirigir al login después de 2 segundos
      return;
    }

    if (!this.product) {
      this.addToCartError = 'No se ha seleccionado ningún producto.';
      return;
    }

    if (this.quantity <= 0 || this.quantity > this.product.countInStock) {
      this.addToCartError = `La cantidad debe ser entre 1 y ${this.product.countInStock}.`;
      return;
    }

    this.isAddingToCart = true;
    const cartItem: CartItem = {
      product: this.product._id,
      quantity: this.quantity
    };

    this.authService.addOrUpdateCartItem(cartItem.product, cartItem.quantity).subscribe({
      next: (cart) => {
        this.isAddingToCart = false;
        this.addToCartMessage = 'Producto añadido al carrito exitosamente!';
        console.log('Carrito actualizado:', cart);
        // Opcional: Podrías emitir un evento o actualizar un contador de carrito global aquí
        setTimeout(() => {
          this.addToCartMessage = null; // Ocultar mensaje después de un tiempo
          this.router.navigate(['/cart']); // Redirigir al carrito
        }, 1500);
      },
      error: (error) => {
        this.isAddingToCart = false;
        this.addToCartError = error.message || 'Error al añadir producto al carrito.';
        console.error('Error al añadir al carrito:', error);
      }
    });
  }
}
