import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../iam/decorators/public.decorator';

@Public()
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body('current_password') currentPassword: string,
    @Body('new_password') newPassword: string,
    @Body('access_token') accessToken: string,
  ) {
    return this.authService.changePassword(
      accessToken,
      currentPassword,
      newPassword,
    );
  }

  @Public()
  @Post('recovery-password')
  @HttpCode(HttpStatus.OK)
  async requestPasswordRecovery(@Body('email') email: string) {
    return this.authService.requestPasswordRecovery(email);
  }
}
