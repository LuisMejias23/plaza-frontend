// src/app/orders/order-detail/order-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../orders/order.service';
import { Order, OrderItem, ShippingAddress } from '../../shared/models/Order';
import { Product } from '../../shared/models/Product';
import { User } from '../../shared/models/User';
import { tap, catchError } from 'rxjs/operators'; // Importa tap y catchError
import { of } from 'rxjs'; // Importa of para el manejo de errores

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  paymentProcessing: boolean = false; // Nuevo estado para indicar que el pago está en proceso

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (orderId) {
        this.getOrderDetails(orderId);
      } else {
        this.errorMessage = 'ID de la orden no proporcionado.';
        this.isLoading = false;
      }
    });
  }

  getOrderDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderService.getOrderById(id).pipe( // Usa pipe para encadenar operadores
      tap(order => {
        this.order = order;
        this.isLoading = false;
        console.log('Detalles de la orden cargados:', this.order);
      }),
      catchError(error => {
        console.error('Error al cargar los detalles de la orden:', error);
        this.errorMessage = error.error?.message || 'No se pudo cargar los detalles de la orden. Asegúrate de estar logueado y tener permisos.';
        this.isLoading = false;
        this.order = null;
        // Podrías redirigir si el pedido no existe o no es del usuario
        if (error.status === 404 || error.status === 403) {
          this.router.navigate(['/myorders']);
        }
        return of(null); // Devuelve un observable nulo para completar la suscripción
      })
    ).subscribe(); // Llama a subscribe al final del pipe
  }

  // --- NUEVO MÉTODO PARA PROCESAR EL PAGO ---
  proceedToPayment(): void {
    if (!this.order || this.order.isPaid || this.paymentProcessing) {
      return; // No hacer nada si no hay orden, ya está pagada, o el pago ya está en proceso
    }

    

    this.paymentProcessing = true; // Indicar que el pago está en proceso
    this.errorMessage = null; // Limpiar cualquier mensaje de error anterior
    console.log('Simulando proceso de pago para la orden:', this.order._id);

    const simulatedPaymentResult = {
    id: 'simulated_payment_id_' + Date.now(), // Un ID único simulado
    status: 'COMPLETED',
    update_time: new Date().toISOString(),
    email_address: 'usuario@ejemplo.com' // Un email simulado
  };

    // Llama al servicio para marcar la orden como pagada en el backend
    this.orderService.markOrderAsPaid(this.order._id, simulatedPaymentResult).pipe(
      tap(updatedOrder => {
        this.order = updatedOrder; // Actualiza la orden localmente con el estado de pagado
        this.paymentProcessing = false;
        // alert('¡Pago procesado con éxito!'); // O mostrar un mensaje más amigable
        this.errorMessage = null; // Limpiar error si hubo
        console.log('Orden marcada como pagada por el usuario:', updatedOrder);
        // Podrías mostrar un mensaje de éxito o redirigir
      }),
      catchError(err => {
        this.paymentProcessing = false;
        console.error('Error al procesar el pago o marcar la orden como pagada:', err);
        this.errorMessage = err.error?.message || 'Error al procesar el pago. Inténtalo de nuevo.';
        return of(null); // Devuelve un observable nulo para completar la suscripción
      })
    ).subscribe(); // Llama a subscribe al final del pipe
  }
  // --- FIN NUEVO MÉTODO ---

  // Helper para castear OrderItem.product a tipo Product
  getProductFromOrderItem(item: OrderItem): Product | null {
    // Asegúrate de que 'product' se haya populado en el backend y sea un objeto
    return item.product && typeof item.product !== 'string' ? (item.product as Product) : null;
  }

  // Helper para castear Order.user a tipo User
  getUserFromOrder(order: Order): User | null {
    // Asegúrate de que 'user' se haya populado en el backend y sea un objeto
    return order.user && typeof order.user !== 'string' ? (order.user as User) : null;
  }

  // Función para volver al historial de órdenes
  goBackToOrderHistory(): void {
    this.router.navigate(['/myorders']);
  }
}