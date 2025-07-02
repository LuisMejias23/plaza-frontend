import { Product } from './Product'; // Importamos Product para los orderItems
import { Address } from './User'; // Importamos Address para la dirección de envío

export interface Order {
  _id: string;
  user: string; // ID del usuario que hizo el pedido
  orderItems: {
    name: string;
    quantity: number;
    image: string;
    price: number;
    product: string; // ID del producto
  }[]; // Aquí esperamos que los detalles del producto estén populados
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: { // Detalles del pago si se integra con pasarela real
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string; // Fecha de pago
  isDelivered: boolean;
  deliveredAt?: string; // Fecha de entrega
  createdAt: string;
  updatedAt: string;
}