import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../core/auth.service'; // Para obtener el token
import { Order } from '../shared/models/Order'; // Crearemos este modelo
import { CartItem, Address } from '../shared/models/User'; // Para tipos de OrderData

// Define la estructura de datos que se envía al backend para crear un pedido
interface CreateOrderData {
  orderItems: { product: string; quantity: number }[]; // Solo ID y cantidad
  shippingAddress: Address;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders'; // Asegúrate de que coincida con tu backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    const token = currentUser?.token;
    if (!token) {
      // Manejar el caso donde no hay token, quizás lanzar un error o redirigir
      throw new Error('No hay token de autenticación disponible.');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // @desc    Crear un nuevo pedido
  // @route   POST /api/orders
  // @access  Private
  createOrder(order: CreateOrderData): Observable<Order> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.post<Order>(this.apiUrl, order, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // @desc    Obtener los pedidos del usuario logueado
  // @route   GET /api/orders/myorders
  // @access  Private
  getMyOrders(): Observable<Order[]> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.get<Order[]>(`${this.apiUrl}/myorders`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // @desc    Obtener un pedido por ID
  // @route   GET /api/orders/:id
  // @access  Private
  getOrderById(id: string): Observable<Order> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.get<Order>(`${this.apiUrl}/${id}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores HTTP
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message || error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}