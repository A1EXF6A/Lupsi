import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private deferredPrompt: any;
  public showInstallButton = signal<boolean>(false);

  /**
   * Captura el evento beforeinstallprompt desde el AppComponent
   */
  setInstallPrompt(event: any) {
    this.deferredPrompt = event;
    this.showInstallButton.set(true);
  }

  /**
   * Ejecuta el diálogo nativo de instalación
   */
  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      this.showInstallButton.set(false);
    }
    this.deferredPrompt = null;
  }
}
