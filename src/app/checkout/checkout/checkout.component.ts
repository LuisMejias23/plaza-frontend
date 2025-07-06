// src/app/checkout/checkout/checkout.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OrderService } from '../../orders/order.service';
import { User, CartItem, Address } from '../../shared/models/User';
import { Product } from '../../shared/models/Product';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  shippingAddressForm!: FormGroup;
  paymentMethod: string = '';
  submitted: boolean = false;
  isProcessingOrder: boolean = false;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  cartItems$: BehaviorSubject<(CartItem & { product: Product })[]> =
    new BehaviorSubject<(CartItem & { product: Product })[]>([]);
  cartTotal: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
    this.loadCartAndProfile();
  }

  initForm(): void {
    this.shippingAddressForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  loadCartAndProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;

    combineLatest([
      this.authService.getUserCart(),
      this.authService.getProfile(),
    ])
      .pipe(
        tap(([cart, userProfile]) => {
          if (cart.length === 0) {
            this.errorMessage =
              'Tu carrito está vacío. Añade productos antes de finalizar la compra.';
            // Opcional: Redirigir a la página de productos si el carrito está vacío
            this.router.navigate(['/products']); // Redirige si el carrito está vacío
          } else {
            this.cartItems$.next(cart);
            this.calculateCartTotal(cart);
          }

          if (userProfile.addresses && userProfile.addresses.length > 0) {
            const defaultAddress = userProfile.addresses[0];
            this.shippingAddressForm.patchValue(defaultAddress);
          }
        }),
        catchError((err) => {
          console.error('Error loading cart or profile:', err);
          this.errorMessage =
            err.message || 'Error al cargar datos necesarios para el checkout.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  calculateCartTotal(items: (CartItem & { product: Product })[]): void {
    this.cartTotal = items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }

  placeOrder(): void {
    this.submitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.shippingAddressForm.invalid) {
      this.shippingAddressForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos de dirección.';
      return;
    }

    if (!this.paymentMethod) {
      this.errorMessage = 'Por favor, selecciona un método de pago.';
      return;
    }

    const currentCart = this.cartItems$.value;
    if (currentCart.length === 0) {
      this.errorMessage = 'Tu carrito está vacío. No se puede crear un pedido.';
      return;
    }

    this.isProcessingOrder = true;

    const orderItems = currentCart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    const orderData = {
      orderItems: orderItems,
      shippingAddress: this.shippingAddressForm.value as Address,
      paymentMethod: this.paymentMethod,
      itemsPrice: this.cartTotal,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: this.cartTotal,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.isProcessingOrder = false;
        this.successMessage =
          '¡Pedido realizado con éxito! Redirigiendo al pago...';
        console.log('Pedido creado:', order);

        // Limpiar el carrito en el frontend después de un pedido exitoso
        // Esto se hace independientemente de si el pago se completa ahora o después.
        this.authService.clearCart().subscribe({
          next: () => {
            console.log('Carrito vaciado en el backend.');
            this.authService.updateCurrentUserCart([]); // Actualiza el BehaviorSubject localmente
          },
          error: (err) =>
            console.error('Error al vaciar el carrito en el backend:', err),
        });

        // --- ¡CAMBIO CLAVE AQUÍ! Redirigir a la página de detalles de la orden para el pago ---
        setTimeout(() => {
          this.router.navigate(['/order-details', order._id]); // Redirige a la página de detalles de la orden
        }, 2000);
      },
      error: (error) => {
        this.isProcessingOrder = false;
        console.error('Error al crear el pedido:', error);
        this.errorMessage =
          error.message || 'Error al procesar tu pedido. Inténtalo de nuevo.';
      },
    });
  }
}
