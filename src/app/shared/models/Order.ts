
import { Product } from './Product'; 
import { User } from './User'; 


export interface OrderItem {
  name: string;
  quantity: number;
  imageUrl: string; // Cambiado de 'image' a 'imageUrl' para coincidir con el backend
  price: number;
  product: string | Product; // Puede ser el ID (string) o el objeto Product completo si está populado
}

// Interfaz para la dirección de envío
export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  // Si tienes 'state' en tu backend, agrégalo aquí también
   state?: string;
}

// Interfaz para el resultado del pago (opcional, si integras con pasarela real)
export interface PaymentResult {
  id?: string;
  status?: string;
  update_time?: string;
  email_address?: string;
}

// Interfaz principal de la Orden
export interface Order {
  _id: string;
  user: string | User; // Puede ser el ID del usuario (string) o el objeto User completo si está populado
  orderItems: OrderItem[]; // Ahora usa la interfaz OrderItem exportada
  shippingAddress: ShippingAddress; // Ahora usa la interfaz ShippingAddress exportada
  paymentMethod: string;
  paymentResult?: PaymentResult;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type { User };
