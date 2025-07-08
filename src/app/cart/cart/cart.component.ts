// src/app/cart/cart.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { User, CartItem } from '../../shared/models/User';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
        this.cartItems$.next(items);
        this.calculateCartTotal(items);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el carrito:', error);
        this.errorMessage = error.message || 'No se pudo cargar el carrito.';
        this.isLoading = false;
        this.cartItems$.next([]);
      }
    });
  }

  calculateCartTotal(items: (CartItem & { product: Product })[]): void {
    this.cartTotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  getQuantityRange(maxStock: number): number[] {
    const range = [];
    for (let i = 1; i <= maxStock; i++) {
      range.push(i);
    }
    return range;
  }

  // --- ¡MODIFICACIÓN CLAVE AQUÍ! ---
  // newQuantity ya es el número, no un evento
  updateCartItemQuantity(productId: string, newQuantity: number): void {
    // ELIMINA ESTAS DOS LÍNEAS:
    // const target = event.target as HTMLSelectElement;
    // const newQuantity = Number(target.value);

    console.log('Depuración de cantidad:', { productId: productId, quantitySent: newQuantity, typeOfQuantity: typeof newQuantity });

    if (newQuantity <= 0) {
      this.removeCartItem(productId);
      return;
    }

    const currentItem = this.cartItems$.value.find(item => item.product._id === productId);
    if (currentItem && currentItem.quantity === newQuantity) {
        return;
    }

    this.isUpdatingQuantity = true;
    this.errorMessage = null;

    this.authService.addOrUpdateCartItem(productId, newQuantity).subscribe({
      next: (updatedCart) => {
        this.cartItems$.next(updatedCart);
        this.calculateCartTotal(updatedCart);
        this.isUpdatingQuantity = false;
        this.errorMessage = null; // Limpiar mensaje de error si fue exitoso
      },
      error: (error) => {
        console.error('Error al actualizar la cantidad del carrito:', error);
        this.errorMessage = error.message || 'Error al actualizar cantidad.';
        this.isUpdatingQuantity = false;
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