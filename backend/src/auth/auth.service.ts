import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { EcuadorianIdValidatorService } from '../iam/services/ecuadorian-id-validator.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly idValidator: EcuadorianIdValidatorService,
  ) { }

  /**
   * Registro Fricción Cero (US-01)
   * 1. Valida Cédula.
   * 2. Crea Cuenta en Supabase Auth.
   * 3. Sincroniza con public.profiles y public.patients.
   * 4. Retorna el JWT para Auto-Login.
   */
  async register(dto: RegisterDto) {
    // 1. Validación del Algoritmo Módulo 10 para Cédula (Seguridad Silenciosa)
    this.logger.log(`Iniciando registro para cédula: ${dto.dni}`);
    const isDniValid = this.idValidator.validate(dto.dni);
    if (!isDniValid) {
      throw new BadRequestException(
        'El número de cédula no parece ser correcto. Por favor, verifica que lo hayas escrito bien e intenta de nuevo.',
      );
    }

    const supabase = this.supabaseService.getClient();

    // 2. Crear usuario en Auth (Supabase Admin)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true, // Auto-confirmar para "Fricción Cero"
      });

    if (authError) {
      this.logger.error(`Error al crear usuario en Auth: ${authError.message}`);
      if (authError.message.includes('already registered')) {
        throw new ConflictException(
          'El correo electrónico ya está registrado en el sistema.',
        );
      }
      throw new InternalServerErrorException(
        'Error al crear la cuenta de seguridad.',
      );
    }

    const userId = authData.user.id;

    // 3. Insertar en Perfiles
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: userId,
        role: 'PATIENT',
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
      },
    ]);

    if (profileError) {
      // Como el perfil falló (probablemente por constraint), borramos el usuario de Auth por seguridad
      await supabase.auth.admin.deleteUser(userId);
      this.logger.error(`Error al insertar perfil: ${profileError.message}`);
      throw new InternalServerErrorException(
        'Error al crear el perfil del usuario.',
      );
    }

    // 4. Insertar en Pacientes
    const { error: patientError } = await supabase.from('patients').insert([
      {
        id: userId,
        dni: dto.dni,
        phone: dto.phone || null,
        date_of_birth: dto.date_of_birth || null,
      },
    ]);

    if (patientError) {
      // Rollback manual de Auth (Profiles se borra en cascada por foreign key restricción si está configurado, igual borramos auth)
      await supabase.auth.admin.deleteUser(userId);
      this.logger.error(`Error al insertar paciente: ${patientError.message}`);
      if (
        patientError.message.includes('unique constraint') ||
        patientError.code === '23505'
      ) {
        throw new ConflictException(
          'Esta cédula ya se encuentra registrada en otra cuenta.',
        );
      }
      throw new InternalServerErrorException(
        'Error al completar el registro médico relacional.',
      );
    }

    // 5. Auto-Login para Fricción Cero
    const loginResult = await this.login({
      email: dto.email,
      password: dto.password,
    });

    return {
      message: 'Registro exitoso. Bienvenido a LUPSI.',
      userId: userId,
      session: loginResult.session,
      role: loginResult.role,
    };
  }

  /**
   * Login Estándar
   */
  async login(dto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      this.logger.warn(
        `Intento de login fallido para ${dto.email}: ${error.message}`,
      );
      throw new BadRequestException('Credenciales inválidas.');
    }

    // Obtener perfil para devolver el ROL en la respuesta
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || (data.user.app_metadata?.role as string) || 'PATIENT';

    return {
      message: 'Autenticación exitosa',
      session: data.session,
      userId: data.user.id,
      role: role,
    };
  }

  async changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: userData, error: userError } = await supabase.auth.getUser(
      accessToken,
    );

    if (userError || !userData?.user) {
      throw new BadRequestException('Token inválido o sesión expirada.');
    }

    const email = userData.user.email;
    if (!email) {
      throw new BadRequestException('No se pudo determinar el usuario.');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      throw new BadRequestException('La contraseña actual no es correcta.');
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      {
        password: newPassword,
      },
    );

    if (updateError) {
      throw new InternalServerErrorException(
        `Error al actualizar contraseña: ${updateError.message}`,
      );
    }

    return { message: 'Contraseña actualizada con éxito.' };
  }

  async requestPasswordRecovery(email: string) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new InternalServerErrorException(
        `Error al solicitar recuperación: ${error.message}`,
      );
    }

    return { message: 'Se envió un correo para recuperar la contraseña.' };
  }
}
