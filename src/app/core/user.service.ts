// src/app/core/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../shared/models/User'; // Asegúrate de que tu modelo User esté aquí
import { AuthService } from '../core/auth/auth.service'; // Para obtener el token

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    const token = currentUser?.token;
    if (!token) {
      console.warn('UserService: No se encontró token de autenticación.');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getUsers(): Observable<User[]> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.get<User[]>(this.apiUrl, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.get<User>(`${this.apiUrl}/${id}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(userId: string, user: User): Observable<User> {
    const httpOptions = { headers: this.getAuthHeaders() };
    // Solo enviar los campos que pueden ser actualizados por el admin
    const updateData = {
      username: user.username,
      email: user.email,
      role: user.role
    };
    return this.http.put<User>(`${this.apiUrl}/${userId}`, updateData, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    const httpOptions = { headers: this.getAuthHeaders() };
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${userId}`, httpOptions).pipe(
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