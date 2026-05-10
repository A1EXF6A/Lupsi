import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Post,
  Delete,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { ActiveUser } from '../iam/interfaces/active-user.interface';

type RequestWithUser = Request & { user?: ActiveUser };

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    console.log('[UsersController] getMe reached for user:', req.user?.id);
    // El perfil ya fue cargado por el JwtAuthGuard global para optimizar
    return req.user?.profile ?? null;
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
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.usersService.createDoctor(dto);
  }

  @Post('receptionists')
  createReceptionist(@Body() dto: CreateReceptionistDto) {
    return this.usersService.createReceptionist(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
