import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/user.service';
import { User } from '../../shared/models/User';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service'; // Para obtener el usuario logueado

@Component({
  selector: 'app-user-list-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list-admin.component.html',
  styleUrl: './user-list-admin.component.css',
})
export class UserListAdminComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loggedInUserId: string | null = null; // Para evitar que un admin se elimine a sí mismo

  constructor(
    private userService: UserService,
    private authService: AuthService, // Inyecta AuthService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loggedInUserId = this.authService.currentUserValue?._id || null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        console.log('Todos los usuarios cargados para admin:', this.users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios para admin:', error);
        this.errorMessage =
          error.error?.message || 'No se pudieron cargar los usuarios.';
        this.isLoading = false;
      },
    });
  }

  editUser(userId: string): void {
    this.router.navigate(['/admin/users/edit', userId]);
  }

  deleteUser(userId: string): void {
    if (this.loggedInUserId === userId) {
      this.errorMessage =
        'No puedes eliminar tu propia cuenta de administrador.';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(userId).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadUsers(); // Recargar la lista para reflejar el cambio
          setTimeout(() => (this.successMessage = null), 3000);
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.errorMessage =
            error.error?.message || 'No se pudo eliminar el usuario.';
          setTimeout(() => (this.errorMessage = null), 3000);
        },
      });
    }
  }

  goToAdminDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
