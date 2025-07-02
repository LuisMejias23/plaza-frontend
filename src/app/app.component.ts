import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router'; // Importar Router y RouterModule
import { AuthService } from './core/auth.service'; // Importar AuthService
import { User } from './shared/models/User'; // Importar el modelo User
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'plaza-frontend';
  currentUser$: Observable<User | null>; 

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser; 
  }

  ngOnInit(): void {
    
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }
}
