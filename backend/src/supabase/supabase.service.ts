import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || process.env['SUPABASE_URL'];
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error(
        '⚠️ FATAL: No se detectaron SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. El backend NO podrá registrar usuarios.',
      );
      throw new Error('Supabase credentials missing');
    }

    this.logger.log('Inicializando Supabase Client con permisos Administrativos 🔐');
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(supabaseUrl, supabaseKey, {
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
