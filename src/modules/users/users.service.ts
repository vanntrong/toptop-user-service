import { toUserResponse } from '@/common/helper/utils.helper';
import { AppError } from '@/errors/AppError';
import { Logger } from '@/loaders/logger/loggerLoader';
import { User, UserFollow } from '@/models';
import { BaseQuery, T } from '@/types/common';
import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './users.dto';
import { UserErrorMessage } from './users.type';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
  ) {}

  async findAll(filter: any, query: BaseQuery) {
    try {
      const qp = this.userRepository
        .createQueryBuilder('user')
        .where({ isDeleted: false })
        .andWhere(filter);

      if (query.sort_by) {
        qp.orderBy(query.sort_by, query.sort_order || 'ASC');
      }

      if (query.q) {
        qp.andWhere('user.name like :q', { q: `%${query.q}%` });
      }

      const count = await qp.getCount();

      const data = await qp
        .skip((query.page - 1) * query.per_page)
        .take(query.per_page)
        .getMany();

      this.logger.log(`find all user: ${JSON.stringify(query, filter)}`);
      return {
        totalCount: count,
        items: data.map((user) => toUserResponse(user)),
      };
    } catch (error) {
      this.logger.error(`find all user:`, error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOneBy({
        id,
        isDeleted: false,
      });

      if (!user) {
        throw new AppError(
          UserErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      return { data: toUserResponse(user) };
    } catch (error) {
      this.logger.error(`find one user: ${id}`, error);
      throw error;
    }
  }

  async update(id: string, req: Request & T, body: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id,
        isDeleted: false,
      });

      if (!user) {
        throw new AppError(
          UserErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (req.user.id !== user.id) {
        throw new ForbiddenException();
      }

      const updatedUser = await this.userRepository
        .createQueryBuilder()
        .update({ ...body, updatedAt: new Date() })
        .where({ id, isDeleted: false })
        .returning('*')
        .execute();

      this.logger.log(`update user: ${JSON.stringify(body)}`);

      return { data: toUserResponse(updatedUser.raw[0]) };
    } catch (error) {
      this.logger.error(`update user: ${id}`, error);
      throw error;
    }
  }

  async delete(id: string, reqId: string) {
    try {
      const user = await this.userRepository.findOneBy({
        id,
        isDeleted: false,
      });

      if (!user) {
        throw new AppError(
          UserErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.id !== reqId) {
        throw new ForbiddenException();
      }

      await this.userRepository
        .createQueryBuilder()
        .update({ isDeleted: true, updatedAt: new Date() })
        .where({ id, isDeleted: false })
        .execute();

      this.logger.log(`delete user: ${id}`);

      return;
    } catch (error) {
      this.logger.error(`delete user: ${id}`, error);
      throw error;
    }
  }

  async follow(followId: string, reqId: string) {
    try {
      const isFollow = await this.userFollowRepository.findOne({
        where: { userId: reqId, followedId: followId },
      });

      if (!isFollow) {
        await this.userFollowRepository.save({
          userId: reqId,
          followedId: followId,
        });
      } else {
        await this.userFollowRepository.delete({
          userId: reqId,
          followedId: followId,
        });
      }

      return {
        isFollow: !isFollow,
      };
    } catch (error) {
      throw error;
    }
  }
}
