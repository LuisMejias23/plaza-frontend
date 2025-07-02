import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, CartItem, Address, CurrentUser } from '../shared/models/User';
import { Product } from '../shared/models/Product';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Asegúrate de que coincida con tu backend

  
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    let user = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    user = localStorage.getItem('currentUser');
  }
  this.currentUserSubject = new BehaviorSubject<User | null>(user ? JSON.parse(user) : null);
  this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.currentUserValue;
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

  // Método para registrar un nuevo usuario
  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { username, email, password })
      .pipe(
        map(user => {
          // Almacenar el usuario en localStorage y actualizar el BehaviorSubject
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  // Método para iniciar sesión
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map(user => {
          // Almacenar el usuario en localStorage y actualizar el BehaviorSubject
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  // Método para cerrar sesión
  logout(): void {
    // Eliminar el usuario del localStorage y del BehaviorSubject
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  

  // Método para obtener el perfil del usuario (requiere token)
  getProfile(): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.currentUserValue?.token}` // Envía el token
      })
    };
    return this.http.get<User>(`${this.apiUrl}/profile`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Método para actualizar el perfil del usuario (requiere token)
 updateProfile(updateData: { username?: string; email?: string; password?: string }): Observable<User> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.put<User>(`${this.apiUrl}/profile`, updateData, httpOptions).pipe(
      tap(user => {
        // Actualizar el usuario en localStorage y BehaviorSubject si es necesario (ej. si el nombre de usuario cambia)
        const current = this.currentUserValue;
        if (current) {
          const updatedCurrentUser: CurrentUser = {
            ...current,
            username: user.username, // Actualizar solo los campos que pueden cambiar
            email: user.email,
            // No actualices el token aquí, el backend no lo devuelve en este endpoint
            // Asegúrate de que el backend devuelve al menos username y email en la respuesta
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
          this.currentUserSubject.next(updatedCurrentUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  // @desc    Añadir una nueva dirección al perfil del usuario
  // @route   POST /api/auth/profile/address
  // @access  Private
  addAddress(address: Address): Observable<User> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.post<User>(`${this.apiUrl}/profile/address`, address, httpOptions).pipe(
      tap(user => {
        // Opcional: actualizar el currentUserSubject con las nuevas direcciones
        const current = this.currentUserValue;
        if (current) {
          const updatedCurrentUser: CurrentUser = { ...current, addresses: user.addresses };
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
          this.currentUserSubject.next(updatedCurrentUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  // @desc    Actualizar una dirección existente del perfil del usuario
  // @route   PUT /api/auth/profile/address/:id
  // @access  Private
  updateAddress(addressId: string, address: Address): Observable<User> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.put<User>(`${this.apiUrl}/profile/address/${addressId}`, address, httpOptions).pipe(
      tap(user => {
        // Opcional: actualizar el currentUserSubject con las direcciones actualizadas
        const current = this.currentUserValue;
        if (current) {
          const updatedCurrentUser: CurrentUser = { ...current, addresses: user.addresses };
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
          this.currentUserSubject.next(updatedCurrentUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  // @desc    Eliminar una dirección del perfil del usuario
  // @route   DELETE /api/auth/profile/address/:id
  // @access  Private
  deleteAddress(addressId: string): Observable<User> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.delete<User>(`${this.apiUrl}/profile/address/${addressId}`, httpOptions).pipe(
      tap(user => {
        // Opcional: actualizar el currentUserSubject con las direcciones actualizadas
        const current = this.currentUserValue;
        if (current) {
          const updatedCurrentUser: CurrentUser = { ...current, addresses: user.addresses };
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
          this.currentUserSubject.next(updatedCurrentUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  // @desc    Añadir/Actualizar producto en el carrito del usuario
  // @route   POST /api/auth/cart
  // @access  Private
  addOrUpdateCartItem(productId: string, quantity: number): Observable<any[]> { // Devuelve el carrito actualizado
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.currentUserValue?.token}`
      })
    };
    return this.http.post<any[]>(`${this.apiUrl}/cart`, { productId, quantity }, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // @desc    Obtener el carrito del usuario logueado
  // @route   GET /api/auth/cart
  // @access  Private
  getUserCart(): Observable<(CartItem & { product: Product })[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.currentUserValue?.token}`
      })
    };
    // Esperamos que el backend devuelva los items del carrito con los detalles del producto populados
    return this.http.get<(CartItem & { product: Product })[]>(`${this.apiUrl}/cart`, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // @desc    Eliminar producto del carrito del usuario
  // @route   DELETE /api/auth/cart/:productId
  // @access  Private
  removeCartItem(productId: string): Observable<any[]> { // Devuelve el carrito actualizado
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.currentUserValue?.token}`
      })
    };
    return this.http.delete<any[]>(`${this.apiUrl}/cart/${productId}`, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // @desc    Vaciar el carrito del usuario logueado
  // @route   DELETE /api/auth/cart/all
  // @access  Private
  clearCart(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.currentUserValue?.token}`
      })
    };
    return this.http.delete(`${this.apiUrl}/cart/all`, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para actualizar el carrito en el BehaviorSubject localmente
  updateCurrentUserCart(cartItems: (CartItem & { product: Product })[]): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, cart: cartItems };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }


  // Manejo de errores HTTP
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message || error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}