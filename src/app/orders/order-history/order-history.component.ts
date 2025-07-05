// src/app/orders/order-history/order-history.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core'; // Importa OnDestroy
import { CommonModule, DatePipe } from '@angular/common';
import { OrderService } from '../../orders/order.service';
import { Order } from '../../shared/models/Order';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs'; // Importa Subscription
import { catchError, tap, filter } from 'rxjs/operators'; // Importa filter
import { Router, RouterModule, NavigationEnd } from '@angular/router'; // Importa NavigationEnd

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit, OnDestroy { // Implementa OnDestroy
  orders$: BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>([]);
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private routerSubscription!: Subscription; // Para manejar la suscripción del router

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar órdenes cuando el componente se inicializa por primera vez
    this.loadOrders();

    // Suscribirse a los eventos del router para recargar órdenes cuando se navega a esta ruta
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/myorders') // O la ruta exacta de tu historial de pedidos
    ).subscribe(() => {
      console.log('Navegación a /myorders detectada, recargando pedidos...');
      this.loadOrders(); // Vuelve a cargar los pedidos
    });
  }

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderService.getUserOrders().pipe(
      tap(orders => {
        this.orders$.next(orders);
        this.isLoading = false;
      }),
      catchError(error => {
        console.error('Error al cargar pedidos:', error);
        this.errorMessage = error.message || 'Error al cargar tu historial de pedidos.';
        this.isLoading = false;
        return of([]);
      })
    ).subscribe();
  }

}