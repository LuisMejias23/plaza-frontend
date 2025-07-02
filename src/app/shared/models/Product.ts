export interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  brand: string;
  category: string;
  price: number;
  countInStock: number;
  rating: number; // Por ejemplo, promedio de reseñas
  numReviews: number; // Número de reseñas
  reviews: Review[]; // Array de reseñas
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id?: string; // Opcional, si MongoDB asigna IDs a subdocumentos
  user: string; // ID del usuario que hizo la reseña
  name: string; // Nombre del usuario
  rating: number; // Puntuación de la reseña
  comment: string; // Comentario de la reseña
  createdAt?: string;
}