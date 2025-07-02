import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service'; // Para obtener/actualizar el carrito
import { User, CartItem } from '../../shared/models/User'; // Modelos de Usuario y CartItem
import { Router, RouterModule } from '@angular/router'; // Para redireccionar y enlaces
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Product } from '../../shared/models/Product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
cartItems$: BehaviorSubject<(CartItem & { product: Product })[]> = new BehaviorSubject<(CartItem & { product: Product })[]>([]);

  isLoading: boolean = true;
  errorMessage: string | null = null;
  cartTotal: number = 0;
  isUpdatingQuantity: boolean = false;
  isRemovingItem: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Si no está logueado, redirigir al login
    if (!this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }
    this.getCartItems();
  }

  getCartItems(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.authService.getUserCart().subscribe({
      next: (items) => {
        // Asegúrate de que los items vienen populados del backend con la info del producto
        this.cartItems$.next(items);
        this.calculateCartTotal(items);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el carrito:', error);
        this.errorMessage = error.message || 'No se pudo cargar el carrito.';
        this.isLoading = false;
        this.cartItems$.next([]); // Vaciar el carrito en caso de error
      }
    });
  }

  calculateCartTotal(items: (CartItem & { product: Product })[]): void {
    this.cartTotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  updateCartItemQuantity(productId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newQuantity = Number(target.value);

    if (newQuantity <= 0) {
      this.removeCartItem(productId); // Si la cantidad es 0, eliminar el item
      return;
    }

    this.isUpdatingQuantity = true;
    this.authService.addOrUpdateCartItem(productId, newQuantity).subscribe({
      next: (updatedCart) => {
        this.cartItems$.next(updatedCart);
        this.calculateCartTotal(updatedCart);
        this.isUpdatingQuantity = false;
      },
      error: (error) => {
        console.error('Error al actualizar la cantidad del carrito:', error);
        this.errorMessage = error.message || 'Error al actualizar cantidad.';
        this.isUpdatingQuantity = false;
        // Opcional: Recargar el carrito para sincronizar con el backend si hay un error
        // this.getCartItems();
      }
    });
  }

  removeCartItem(productId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      this.isRemovingItem = true;
      this.authService.removeCartItem(productId).subscribe({
        next: (updatedCart) => {
          this.cartItems$.next(updatedCart);
          this.calculateCartTotal(updatedCart);
          this.isRemovingItem = false;
        },
        error: (error) => {
          console.error('Error al eliminar el producto del carrito:', error);
          this.errorMessage = error.message || 'Error al eliminar producto.';
          this.isRemovingItem = false;
          // Opcional: Recargar el carrito
          // this.getCartItems();
        }
      });
    }
  }

  proceedToCheckout(): void {
    const currentCart = this.cartItems$.value;
    if (currentCart.length > 0) {
      this.router.navigate(['/checkout']);
    } else {
      this.errorMessage = 'Tu carrito está vacío. Añade productos antes de proceder al checkout.';
    }
  }
}
