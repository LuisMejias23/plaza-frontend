import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Usamos '!' para asegurar que se inicializará
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage = null; // Limpiar errores previos
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        console.log('Login exitoso:', user);
        this.isLoading = false;
        // Redirigir al usuario, por ejemplo, a la página de inicio o a los productos
        this.router.navigate(['/products']);
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
      }
    });
  }
}
