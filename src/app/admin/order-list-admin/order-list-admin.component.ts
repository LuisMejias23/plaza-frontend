// src/app/admin/order-list-admin/order-list-admin.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { OrderService } from '../../orders/order.service';
import { Order, User } from '../../shared/models/Order'; // Asegúrate de tener User en tu modelo Order o importarlo
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-order-list-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './order-list-admin.component.html',
  styleUrl: './order-list-admin.component.css'
})
export class OrderListAdminComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
        console.log('Todas las órdenes cargadas para admin:', this.orders);
      },
      error: (error) => {
        console.error('Error al cargar todas las órdenes para admin:', error);
        this.errorMessage = error.error?.message || 'No se pudieron cargar las órdenes.';
        this.isLoading = false;
      }
    });
  }

  // Helper para obtener el nombre del usuario (si está populado)
  getUserName(order: Order): string {
    return order.user && typeof order.user !== 'string' ? (order.user as User).username : 'Usuario Desconocido';
  }

  // Helper para obtener el email del usuario (si está populado)
  getUserEmail(order: Order): string {
    return order.user && typeof order.user !== 'string' ? (order.user as User).email : 'N/A';
  }

  viewOrderDetails(id: string): void {
    this.router.navigate(['/admin/orders', id]); // Reutiliza el OrderDetailComponent
  }

  markAsDelivered(orderId: string): void {
    if (confirm('¿Estás seguro de que quieres marcar esta orden como entregada?')) {
      this.orderService.updateOrderToDelivered(orderId).subscribe({
        next: (updatedOrder) => {
          this.successMessage = `Orden ${updatedOrder._id} marcada como entregada.`;
          this.loadAllOrders(); // Recargar la lista para reflejar el cambio
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error) => {
          console.error('Error al marcar orden como entregada:', error);
          this.errorMessage = error.error?.message || 'No se pudo marcar la orden como entregada.';
          setTimeout(() => this.errorMessage = null, 3000);
        }
      });
    }
  }

   markAsPaid(orderId: string): void {
    if (confirm('¿Estás seguro de que quieres marcar esta orden como pagada?')) {
      // Simulación de un resultado de pago. En un caso real, esto vendría de un procesador de pagos.
      const paymentResult = {
        id: 'simulated_payment_id_' + Date.now(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: 'admin_simulated@example.com' // Email del pagador
      };

      this.orderService.markOrderAsPaid(orderId, paymentResult).subscribe({
        next: (updatedOrder) => {
          this.successMessage = `Orden ${updatedOrder._id} marcada como pagada.`;
          this.loadAllOrders(); // Recargar la lista para reflejar el cambio
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error) => {
          console.error('Error al marcar orden como pagada:', error);
          this.errorMessage = error.error?.message || 'No se pudo marcar la orden como pagada.';
          setTimeout(() => this.errorMessage = null, 3000);
        }
      });
    }
  }

  goToAdminDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}