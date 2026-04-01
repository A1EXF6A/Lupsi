import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Usamos la Service Role Key para saltarnos el RLS al momento de crear pacientes/perfiles
    const supabaseKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn(
        'Faltan credenciales de Supabase (SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY). El AuthModule podría fallar.',
      );
    }

    this.supabase = createClient(supabaseUrl || '', supabaseKey || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Obtiene la instancia del cliente Supabase inicializado con permisos de Admin.
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
