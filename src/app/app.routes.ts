import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CartComponent } from './cart/cart/cart.component';
import { CheckoutComponent } from './checkout/checkout/checkout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './user/profile/profile.component'; // Asumiendo que ProfileComponent está en user/
import { OrderHistoryComponent } from './orders/order-history/order-history.component'; // <-- Revisa esta ruta si moviste el componente a 'user/'
import { AuthGuard } from './core/auth.guard'; // <-- Importa tu AuthGuard

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Plaza - Inicio' },
  { path: 'products', component: ProductListComponent, title: 'Plaza - Productos' },
  { path: 'products/:id', component: ProductDetailComponent, title: 'Plaza - Detalle de Producto' },
  { path: 'login', component: LoginComponent, title: 'Plaza - Iniciar Sesión' },
  { path: 'register', component: RegisterComponent, title: 'Plaza - Registrarse' },

  // Rutas protegidas por AuthGuard
  { path: 'cart', component: CartComponent, title: 'Plaza - Carrito', canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, title: 'Plaza - Checkout', canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, title: 'Plaza - Mi Perfil', canActivate: [AuthGuard] },
  { path: 'myorders', component: OrderHistoryComponent, title: 'Plaza - Mis Pedidos', canActivate: [AuthGuard] },

  // Opcional: Ruta para el detalle de un pedido individual (si decides implementarla)
  // { path: 'order/:id', component: OrderDetailComponent, title: 'Plaza - Detalle de Pedido', canActivate: [AuthGuard] },

  // Ruta comodín para cualquier URL no encontrada (siempre al final)
  { path: '**', redirectTo: '' }
];