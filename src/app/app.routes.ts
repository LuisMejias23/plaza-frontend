import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CartComponent } from './cart/cart/cart.component';
import { CheckoutComponent } from './checkout/checkout/checkout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './user/profile/profile.component'; // Asumiendo que ProfileComponent está en user/
import { OrderHistoryComponent } from './orders/order-history/order-history.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { AuthGuard } from './core/auth/auth.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component'; // ¡Nueva Importación!
import { adminGuard } from './core/admin/admin.guard';
import { ProductListAdminComponent } from './admin/product-list-admin/product-list-admin.component';
import { ProductFormAdminComponent } from './admin/product-form-admin/product-form-admin.component';
import { OrderListAdminComponent } from './admin/order-list-admin/order-list-admin.component';
import { UserListAdminComponent } from './admin/user-list-admin/user-list-admin.component'; // ¡Nueva Importación!
import { UserFormAdminComponent } from './admin/user-form-admin/user-form-admin.component';

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
  { path: 'admin/dashboard', component: AdminDashboardComponent, title: 'Plaza - Admin', canActivate: [AuthGuard, adminGuard] },
  { path: 'admin/products', component: ProductListAdminComponent, title: 'Plaza - Admin Productos', canActivate: [AuthGuard, adminGuard] },
  { path: 'admin/products/new', component: ProductFormAdminComponent, title: 'Plaza - Crear Producto', canActivate: [AuthGuard, adminGuard] },
  { path: 'admin/products/edit/:id', component: ProductFormAdminComponent, title: 'Plaza - Editar Producto', canActivate: [AuthGuard, adminGuard] },
  { path: 'admin/orders', component: OrderListAdminComponent, title: 'Plaza - Admin Pedidos', canActivate: [AuthGuard, adminGuard] }, // ¡Nueva Ruta para órdenes!
  { path: 'admin/orders/:id', component: OrderDetailComponent, title: 'Plaza - Detalles Pedido Admin', canActivate: [AuthGuard, adminGuard] },
  { path: 'admin/users', component: UserListAdminComponent, title: 'Plaza - Admin Usuarios', canActivate: [AuthGuard, adminGuard] }, // ¡Nueva Ruta para usuarios!
  { path: 'admin/users/edit/:id', component: UserFormAdminComponent, title: 'Plaza - Editar Usuario', canActivate: [AuthGuard, adminGuard] },
  
  

  // Opcional: Ruta para el detalle de un pedido individual (si decides implementarla)
  { path: 'order/:id', component: OrderDetailComponent, title: 'Plaza - Detalle de Pedido', canActivate: [AuthGuard] },

  // Ruta comodín para cualquier URL no encontrada (siempre al final)
  { path: '**', redirectTo: '' }
];