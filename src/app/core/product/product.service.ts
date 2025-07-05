// src/app/core/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../../shared/models/Product';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método auxiliar para obtener los headers con el token JWT del usuario logueado
  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    const token = currentUser?.token;
    if (!token) {
      console.warn('ProductService: No se encontró token de autenticación.');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // --- Métodos de administración ---

  createProduct(product: Product): Observable<Product> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.post<Product>(this.apiUrl, product, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, httpOptions).pipe(
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