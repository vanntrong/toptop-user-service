import { PaginationParams } from '@/common/dto/common.dto';
import { buildQueryFilter } from '@/common/helper/utils.helper';
import { AppError } from '@/errors/AppError';
import { JwtAuthGuard } from '@/guards/jwt.guard';
import { UserRequest } from '@/types/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Request } from 'express';
import { GetUserDto, UpdateUserDto, UserFollowDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Query() _query: PaginationParams) {
    const { filter, query } = buildQueryFilter(_query);
    const res = await this.usersService.findAll(filter, query);
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@UserRequest('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@UserRequest('id') id: string, @Body() body: UpdateUserDto) {
    if (!id) throw new AppError('User not found', HttpStatus.NOT_FOUND);
    const res = await this.usersService.update(id, body);
    return res;
  }

  @UseGuards(new JwtAuthGuard({ isPrivateRoute: true }))
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const res = await this.usersService.update(id, body);
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('me')
  async deleteMe(@UserRequest('id') id: string) {
    await this.usersService.delete(id);
    return;
  }

  @UseGuards(new JwtAuthGuard({ isPrivateRoute: true }))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('follow')
  async follow(@Body() body: UserFollowDto, @Req() req: Request & any) {
    const res = await this.usersService.follow(body.followingId, req.user.id);
    return res;
  }

  @MessagePattern('get_user')
  async getUser(_data: GetUserDto) {
    const { data } = await this.usersService.findOne(_data.id);
    return data;
  }
}
