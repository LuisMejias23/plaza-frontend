import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importa DatePipe para formatear fechas
import { OrderService } from '../order.service';
import { Order } from '../../shared/models/Order';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  orders$: BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>([]);
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderService.getMyOrders().pipe(
      tap(orders => {
        this.orders$.next(orders);
        this.isLoading = false;
      }),
      catchError(error => {
        console.error('Error al cargar pedidos:', error);
        this.errorMessage = error.message || 'Error al cargar tu historial de pedidos.';
        this.isLoading = false;
        return of([]); // Devuelve un observable vacío para que la suscripción no falle
      })
    ).subscribe();
  }
}
