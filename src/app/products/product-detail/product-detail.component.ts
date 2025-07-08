import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Para obtener el ID de la URL y para redireccionar
import { ProductService } from '../product.service'; // Servicio para obtener detalles del producto
import { Product } from '../../shared/models/Product'; // Modelo de producto
import { CartItem } from '../../shared/models/User'; // Modelo de CartItem
import { FormsModule } from '@angular/forms'; // Para ngModel en el selector de cantidad
import { AuthService } from '../../core//auth/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  quantity: number = 1; 
  isAddingToCart: boolean = false;
  addToCartMessage: string | null = null; 
  addToCartError: string | null = null; 

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('id'); 
      if (productId) {
        this.getProductDetails(productId); 
      } else {
        this.errorMessage = 'ID de producto no proporcionado en la URL.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Carga los detalles de un producto específico usando su ID.
   * @param id El ID del producto.
   */
  getProductDetails(id: string): void {
    this.isLoading = true; // Indicar que se está cargando
    this.errorMessage = null; // Limpiar mensajes de error previos

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product; // Asignar el producto recibido
        this.isLoading = false; // Finalizar la carga
        // Asegurarse de que la cantidad no exceda el stock si el stock es muy bajo
        if (this.product.countInStock === 0) {
          this.quantity = 0; // No se puede añadir nada si no hay stock
        } else if (this.quantity > this.product.countInStock) {
          this.quantity = 1; // Resetear a 1 si la cantidad seleccionada es mayor que el stock disponible
        }
      },
      error: (error) => {
        console.error('Error al obtener el detalle del producto:', error);
        this.errorMessage =
          error.error?.message ||
          'No se pudo cargar el detalle del producto. Intente de nuevo.';
        this.isLoading = false;
        this.product = null; // En caso de error, limpiar el producto para no mostrar datos incorrectos
      },
    });
  }

  /**
   * Añade el producto actual al carrito del usuario.
   */
  addToCart(): void {
    this.addToCartMessage = null; // Limpiar mensajes previos
    this.addToCartError = null; // Limpiar errores previos

    // 1. Verificar si el usuario está logueado
    if (!this.authService.currentUserValue) {
      this.addToCartError =
        'Debes iniciar sesión para añadir productos al carrito.';
      // Redirigir al login después de un breve retraso para que el usuario lea el mensaje
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    // 2. Verificar que haya un producto cargado
    if (!this.product) {
      this.addToCartError = 'No se ha seleccionado ningún producto válido.';
      return;
    }

    // 3. Validar la cantidad
    if (this.quantity <= 0 || this.quantity > this.product.countInStock) {
      this.addToCartError = `La cantidad debe ser entre 1 y ${this.product.countInStock} unidades.`;
      return;
    }

    this.isAddingToCart = true; // Indicar que la operación está en curso

    // Crear el CartItem para enviar al servicio
    const cartItem: CartItem = {
      product: this.product._id, // Solo necesitamos el ID del producto
      quantity: this.quantity,
    };

    
    this.authService
      .addOrUpdateCartItem(cartItem.product, cartItem.quantity)
      .subscribe({
        next: (updatedCart) => {
          this.isAddingToCart = false;
          this.addToCartMessage = 'Producto añadido al carrito exitosamente!';
          console.log('Carrito actualizado:', updatedCart);
          
          setTimeout(() => {
            this.addToCartMessage = null; // Ocultar mensaje
            this.router.navigate(['/cart']); // Redirigir al carrito para que el usuario vea su actualización
          }, 1500);
        },
        error: (error) => {
          this.isAddingToCart = false;
          // Capturar el mensaje de error del backend si existe, o un mensaje genérico
          this.addToCartError =
            error.error?.message ||
            'Error al añadir producto al carrito. Intente de nuevo.';
          console.error('Error al añadir al carrito:', error);
        },
      });
  }

  /**
   * Navega de vuelta a la página de lista de productos.
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }
}
