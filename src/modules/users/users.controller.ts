import { PaginationParams } from '@/common/dto/common.dto';
import { buildQueryFilter } from '@/common/helper/utils.helper';
import { JwtAuthGuard } from '@/guards/jwt.guard';
import { T } from '@/types/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
  async findAll(@Query() _query: PaginationParams): Promise<any> {
    const { filter, query } = buildQueryFilter(_query);
    const res = await this.usersService.findAll(filter, query);
    return { ...res };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const res = await this.usersService.findOne(id);
    return { ...res };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: Request & T,
    @Body() body: UpdateUserDto,
  ): Promise<any> {
    const res = await this.usersService.update(id, req, body);
    return { ...res };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: Request & any,
  ): Promise<any> {
    await this.usersService.delete(id, req.user.id);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('follow')
  async follow(@Body() body: UserFollowDto, @Req() req: Request & any) {
    const res = await this.usersService.follow(body.followingId, req.user.id);
    return res;
  }

  @MessagePattern('get_user')
  async getUser(data: GetUserDto): Promise<any> {
    const res = await this.usersService.findOne(data.id);
    return res.data;
  }
}
