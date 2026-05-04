import { Body, Controller, Get, Param, Put, Post, Delete, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { Public } from '../iam/decorators/public.decorator';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    console.log('[UsersController] getMe reached for user:', req.user?.id);
    // El perfil ya fue cargado por el JwtAuthGuard global para optimizar
    return req.user.profile;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Post('doctors')
  createDoctor(@Body() dto: any) {
    return this.usersService.createDoctor(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
