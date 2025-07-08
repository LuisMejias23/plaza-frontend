// src/app/core/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../shared/models/Order';
import { AuthService } from '../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    const token = currentUser?.token;
    if (!token) {
      console.warn('OrderService: No se encontró token de autenticación.');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * @desc Create a new order
   * @route POST /api/orders
   * @access Private
   * @param order The order data to be sent to the backend (e.g., orderItems, shippingAddress)
   */
  createOrder(order: any): Observable<Order> { // You might want to define a specific interface for 'order' data later
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.post<Order>(this.apiUrl, order, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @desc Get all orders for the logged-in user
   * @route GET /api/orders/myorders
   * @access Private
   */
  getUserOrders(): Observable<Order[]> { 
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.get<Order[]>(`${this.apiUrl}/myorders`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @desc Get specific order by ID
   * @route GET /api/orders/:id
   * @access Private
   */
  getOrderById(id: string): Observable<Order> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.get<Order>(`${this.apiUrl}/${id}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // --- Métodos de administración ---

  getOrders(): Observable<Order[]> { // Obtener TODAS las órdenes (para admin)
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.get<Order[]>(this.apiUrl, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateOrderToDelivered(orderId: string): Observable<Order> { // Marcar orden como entregada (solo admin)
    const httpOptions = { headers: this.getAuthHeaders() };
    // Un PUT a /api/orders/:id/deliver con un cuerpo vacío es suficiente para el backend
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/deliver`, {}, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @desc Mark order as paid
   * @route PUT /api/orders/:id/pay
   * @access Private/Admin (or Private for payment gateway webhooks)
   * @param orderId The ID of the order to mark as paid
   * @param paymentResult An object with payment details (e.g., { id: 'paypal_id', status: 'COMPLETED' })
   */
  markOrderAsPaid(orderId: string, paymentResult: any): Observable<Order> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/pay`, paymentResult, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Un error desconocido ocurrió.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      console.error(
        `Código de error del backend ${error.status}, ` +
        `cuerpo: ${JSON.stringify(error.error)}`
      );
      errorMessage = error.error?.message || `Error del servidor: ${error.status} - ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}