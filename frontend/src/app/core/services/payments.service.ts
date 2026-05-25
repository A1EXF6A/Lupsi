import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private http = inject(HttpClient);

  // 1. Tarjeta: Crear intención de pago
  createIntent(appointmentId: string, amount: number) {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/payments/intent`, { appointmentId, amount });
  }

  // 2. Tarjeta: Confirmar éxito en nuestra DB
  confirmStripePayment(appointmentId: string, amount: number) {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/payments/card/confirm`, { appointmentId, amount });
  }

  // Reporta transferencia con recibo
  reportTransfer(appointmentId: string, amount: number, receiptUrl: string) {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/payments/transfer`, { appointmentId, amount, receiptUrl });
  }

  // Confirmar pago manualmente (admin/recepcionista)
  confirmManualPayment(appointmentId: string, method: 'CASH'|'TRANSFER', paymentId?: string, amount?: number) {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/payments/manual/confirm`, { appointmentId, paymentId, method, amount });
  }

  // Compresión y subida de archivo al backend
  async uploadReceipt(file: File): Promise<string> {
    const compressedBlob = await this.compressImage(file);
    const formData = new FormData();
    formData.append('file', compressedBlob, file.name);
    
    // Subir al backend
    const response = await lastValueFrom(
      this.http.post<{url: string}>(`${environment.apiUrl}/api/v1/payments/upload-receipt`, formData)
    );

    return response!.url;
  }

  // Compresión por Canvas HTML5 (reduce drásticamente el peso a <200kb manteniendo legibilidad)
  private compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1200px
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height *= maxDim / width));
              width = maxDim;
            } else {
              width = Math.round((width *= maxDim / height));
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Export at 80% quality JPEG
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          }, 'image/jpeg', 0.8);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  }
}
