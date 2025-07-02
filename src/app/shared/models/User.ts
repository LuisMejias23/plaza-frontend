import { Product } from './Product';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  token?: string; 
  addresses?: Address[]; 
  cart?: CartItem[]; 
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id?: string; // MongoDB ID para la dirección, opcional
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CartItem {
  product: string; // ID del producto
  quantity: number;
  // Opcional: para el frontend, podemos incluir detalles del producto "populados"
  name?: string;
  price?: number;
  imageUrl?: string;
}

export interface CurrentUser extends User {
  token?: string;
}