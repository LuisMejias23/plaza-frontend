// src/app/orders/order-detail/order-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common'; // Importa DatePipe y CurrencyPipe
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // RouterModule para routerLink
import { OrderService } from '../../orders/order.service';
import { Order, OrderItem, ShippingAddress } from '../../shared/models/Order'; // Importa tus interfaces de Order
import { Product } from '../../shared/models/Product'; // Necesitas Product para type casting si 'product' es populado
import { User } from '../../shared/models/User';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterModule], // Añade DatePipe, CurrencyPipe, RouterModule
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

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
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
        console.log('Detalles de la orden cargados:', this.order); // Para depuración
      },
      error: (error) => {
        console.error('Error al cargar los detalles de la orden:', error);
        this.errorMessage = error.error?.message || 'No se pudo cargar los detalles de la orden. Asegúrate de estar logueado y tener permisos.';
        this.isLoading = false;
        this.order = null;
      }
    });
  }

  // Helper para castear OrderItem.product a tipo Product
  getProductFromOrderItem(item: OrderItem): Product | null {
    return item.product && typeof item.product !== 'string' ? (item.product as Product) : null;
  }

  // Helper para castear Order.user a tipo User
  getUserFromOrder(order: Order): User | null {
    return order.user && typeof order.user !== 'string' ? (order.user as User) : null;
  }

  // Función para volver al historial de órdenes
  goBackToOrderHistory(): void {
    this.router.navigate(['/myorders']);
  }
}