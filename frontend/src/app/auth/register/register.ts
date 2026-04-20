import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PwaService } from '../../core/services/pwa';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public pwaService = inject(PwaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  showPassword = false;

  installApp() {
    this.pwaService.installApp();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.pattern(/^[0-9\+\-\s]{7,20}$/)]],
    });
  }

  // Getter útil para acceder fácilmente a los controles en el HTML
  get f() {
    return this.registerForm.controls;
  }

  /**
   * Envía los datos al backend (NestJS). Si es exitoso, Fricción Cero lo
   * loguea y lo manda al dashboard sin pedirle volver a confirmar.
   */
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    // Sanear el payload: Si phone está vacío, enviarlo como null para pasar validación opcional
    const payload = { ...this.registerForm.value };
    if (!payload.phone) {
      payload.phone = null;
    }
    if (!payload.date_of_birth) {
      payload.date_of_birth = null;
    }

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Forzar actualización de vista
        // Redirigir al inicio/dashboard tras la cuenta exitosa y token inyectado
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.isSubmitting = false;

        // Manejar formato de NestJS ValidationPipe (Array de strings) o string simple
        const msg = err.error?.message;
        if (Array.isArray(msg)) {
          this.errorMessage = msg[0]; // Mostrar el primer error de validación
        } else {
          this.errorMessage = msg || 'Ha ocurrido un error inesperado al registrarte.';
        }

        this.cdr.detectChanges(); // Forzar actualización de UI (Soluciona botón atascado "Validando...")
      },
    });
  }
}
