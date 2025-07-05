// src/app/admin/user-form-admin/user-form-admin.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/user.service';
import { User } from '../../shared/models/User';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-user-form-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-form-admin.component.html',
  styleUrl: './user-form-admin.component.css'
})
export class UserFormAdminComponent implements OnInit {
  userForm!: FormGroup;
  userId: string | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loggedInUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loggedInUserId = this.authService.currentUserValue?._id || null;
    this.initializeForm();

    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      if (this.userId) {
        this.loadUserForEdit(this.userId);
      } else {
        this.router.navigate(['/admin/users']);
      }
    });
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required], // <-- Usar 'username'
      email: ['', [Validators.required, Validators.email]],
      isAdmin: [false] // <-- Mantener 'isAdmin' como booleano para el checkbox del frontend
    });
  }

  loadUserForEdit(id: string): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        // Rellenar el formulario: mapear 'username' y 'role' a 'isAdmin'
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          isAdmin: user.role === 'admin' // <-- Mapear 'role' a 'isAdmin' booleano
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuario para edición:', error);
        this.errorMessage = error.error?.message || 'No se pudo cargar el usuario para editar.';
        this.isLoading = false;
        this.router.navigate(['/admin/users']);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.userForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos y válidos.';
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = this.userForm.value;
    const userDataToSend: Partial<User> = { // Usar Partial<User> porque no enviamos _id, etc.
      username: formData.username,
      email: formData.email,
      role: formData.isAdmin ? 'admin' : 'user' // <-- Mapear 'isAdmin' booleano a 'role' string
    };

    console.log('Datos del formulario que se van a enviar:', userDataToSend);

    // Lógica para evitar que un admin se quite el rol a sí mismo si es el único
    if (this.userId === this.loggedInUserId && userDataToSend.role === 'user') { // <-- Verificar rol 'user'
        this.userService.getUsers().subscribe(allUsers => {
            const adminCount = allUsers.filter(u => u.role === 'admin').length; // <-- Contar admins por 'role'
            if (adminCount <= 1) {
                this.errorMessage = 'No puedes quitarte el rol de administrador si eres el único administrador.';
                return;
            }
            this.updateUserCall(userDataToSend as User); // Castear a User para la llamada
        });
    } else {
        this.updateUserCall(userDataToSend as User); // Castear a User para la llamada
    }
  }

  private updateUserCall(userData: User): void {
    if (this.userId) {
      this.userService.updateUser(this.userId, userData).subscribe({
        next: (updatedUser) => {
          this.successMessage = 'Usuario actualizado exitosamente.';
          console.log('Usuario actualizado:', updatedUser);
          setTimeout(() => {
            this.router.navigate(['/admin/users']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.errorMessage = error.error?.message || 'No se pudo actualizar el usuario.';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
}