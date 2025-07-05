// src/app/core/admin.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Asegúrate de importar tu AuthService
import { map, tap } from 'rxjs/operators';
import { User } from '../../shared/models/User'; // Asumiendo que tienes un modelo User

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser.pipe(
    map((user: User | null) => {
      // Si el usuario existe y es admin, permite el acceso
      if (user && user.role === 'admin') {
        return true;
      }
      // Si no es admin, redirige a la página de inicio y retorna false
      router.navigate(['/']);
      return false;
    }),
    // Opcional: Para depuración, puedes usar tap
    tap((isAllowed) => {
      if (!isAllowed) {
        console.warn('Acceso denegado: el usuario no es administrador.');
      }
    })
  );
};