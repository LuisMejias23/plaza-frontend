import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../shared/models/Product'; // Crearemos este modelo en un momento
import { AuthService } from '../core/auth/auth.service'; // Importar AuthService para obtener el token

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products'; // Asegúrate de que coincida con tu backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Método auxiliar para obtener los headers con el token JWT
  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    const token = currentUser?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '' // Añadir el token si existe
    });
  }

  // @desc    Obtener todos los productos
  // @route   GET /api/products
  // @access  Public
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // @desc    Obtener un producto por ID
  // @route   GET /api/products/:id
  // @access  Public
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // @desc    Crear un nuevo producto (Admin)
  // @route   POST /api/products
  // @access  Private/Admin
  createProduct(product: Partial<Product>): Observable<Product> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.post<Product>(this.apiUrl, product, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // @desc    Actualizar un producto (Admin)
  // @route   PUT /api/products/:id
  // @access  Private/Admin
  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, httpOptions).pipe(
      catchError(this.handleError)
    ); 
  }

  // @desc    Eliminar un producto (Admin)
  // @route   DELETE /api/products/:id
  // @access  Private/Admin
  deleteProduct(id: string): Observable<{ message: string }> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores HTTP
  private handleError(error: any) {
    let errorMessage = '';
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
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