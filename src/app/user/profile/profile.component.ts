import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { User, Address } from '../../shared/models/User';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userForm!: FormGroup;
  addressForm!: FormGroup;
  currentUser: User | null = null;
  userAddresses: Address[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isUpdatingProfile: boolean = false;
  isAddressModalOpen: boolean = false;
  isEditingAddress: boolean = false;
  editingAddressId: string | null = null;
  isSavingAddress: boolean = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }

  initForms(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] // No requerido, solo para cambio
    });

    this.addressForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.getProfile().pipe(
      tap(user => {
        this.currentUser = user;
        this.userForm.patchValue({
          username: user.username,
          email: user.email
        });
        this.userAddresses = user.addresses || []; // Asegúrate de que haya un array
        this.isLoading = false;
      }),
      catchError(error => {
        console.error('Error al cargar perfil:', error);
        this.errorMessage = error.message || 'No se pudo cargar el perfil del usuario.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  updateProfile(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.isUpdatingProfile = true;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.isUpdatingProfile = false;
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
      return;
    }

    const { username, email, password } = this.userForm.value;
    const updateData: { username: string; email: string; password?: string } = { username, email };

    // Solo añadir la contraseña si se ha modificado
    if (password) {
      updateData.password = password;
    }

    this.authService.updateProfile(updateData).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.userForm.get('password')?.setValue(''); // Limpiar el campo de contraseña
        this.isUpdatingProfile = false;
        this.successMessage = 'Perfil actualizado exitosamente!';
        // Opcional: Recargar el perfil para asegurar la sincronización
        this.loadUserProfile();
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.errorMessage = error.message || 'Error al actualizar el perfil.';
        this.isUpdatingProfile = false;
      }
    });
  }

  // --- Funciones para la Gestión de Direcciones ---

  openAddressModal(address?: Address): void {
    this.isAddressModalOpen = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (address) {
      this.isEditingAddress = true;
      this.editingAddressId = address._id!;
      this.addressForm.patchValue(address);
    } else {
      this.isEditingAddress = false;
      this.editingAddressId = null;
      this.addressForm.reset(); // Limpiar el formulario para nueva dirección
    }
  }

  closeAddressModal(): void {
    this.isAddressModalOpen = false;
    this.addressForm.reset();
    this.isEditingAddress = false;
    this.editingAddressId = null;
  }

  saveAddress(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.isSavingAddress = true;

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.isSavingAddress = false;
      this.errorMessage = 'Por favor, completa todos los campos de la dirección.';
      return;
    }

    const addressData: Address = this.addressForm.value;

    if (this.isEditingAddress && this.editingAddressId) {
      this.authService.updateAddress(this.editingAddressId, addressData).subscribe({
        next: (updatedUser) => {
          this.userAddresses = updatedUser.addresses || [];
          this.isSavingAddress = false;
          this.closeAddressModal();
          this.successMessage = 'Dirección actualizada exitosamente!';
        },
        error: (error) => {
          console.error('Error al actualizar dirección:', error);
          this.errorMessage = error.message || 'Error al actualizar la dirección.';
          this.isSavingAddress = false;
        }
      });
    } else {
      this.authService.addAddress(addressData).subscribe({
        next: (updatedUser) => {
          this.userAddresses = updatedUser.addresses || [];
          this.isSavingAddress = false;
          this.closeAddressModal();
          this.successMessage = 'Dirección añadida exitosamente!';
        },
        error: (error) => {
          console.error('Error al añadir dirección:', error);
          this.errorMessage = error.message || 'Error al añadir la dirección.';
          this.isSavingAddress = false;
        }
      });
    }
  }

  deleteAddress(addressId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      this.errorMessage = null;
      this.successMessage = null;
      this.authService.deleteAddress(addressId).subscribe({
        next: (updatedUser) => {
          this.userAddresses = updatedUser.addresses || [];
          this.successMessage = 'Dirección eliminada exitosamente!';
        },
        error: (error) => {
          console.error('Error al eliminar dirección:', error);
          this.errorMessage = error.message || 'Error al eliminar la dirección.';
        }
      });
    }
  }

   editAddress(address: Address): void { // <--- ¡Asegúrate de que esta función esté presente!
    this.openAddressModal(address);
  }
}
