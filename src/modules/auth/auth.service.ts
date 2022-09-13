import { AppError } from '@/errors/AppError';
import { User, UserFollow } from '@/models';
import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthError } from './auth.type';
import * as bcrypt from 'bcryptjs';
import { toUserResponse } from '@/common/helper/utils.helper';
import { JwtService } from '@nestjs/jwt';
import config from '@/config/configuration';
import { pick } from 'lodash';
import { Logger } from '@/loaders/logger/loggerLoader';
import { Cache } from 'cache-manager';
import { LoginDto, SignupDto } from './auth.dto';
import { UserErrorMessage } from '../users/users.type';

@Injectable()
export class AuthService {
  private readonly hashSalt = Number(config.PASSWORD_SALT);
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private redisCache: Cache,
  ) {}

  isValidPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }

  async genToken(payload: any) {
    try {
      const fieldToSign = pick(payload, ['id', 'name', 'email', 'role']);

      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(fieldToSign, {
          secret: config.ACCESS_TOKEN_SECRET,
          expiresIn: Number(config.ACCESS_TOKEN_LIFE),
          algorithm: 'HS256',
        }),
        this.jwtService.signAsync(fieldToSign, {
          secret: config.REFRESH_TOKEN_SECRET,
          expiresIn: Number(config.REFRESH_TOKEN_LIFE),
          algorithm: 'HS256',
        }),
      ]);

      return {
        access_token,
        refresh_token,
        exp: Number(config.ACCESS_TOKEN_LIFE),
      };
    } catch (error) {
      this.logger.error('Gen token error', error);
      return null;
    }
  }

  async login(payload: LoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: payload.email,
          isDeleted: false,
        },
      });

      if (!user) {
        throw new AppError(
          AuthError.INCORRECT_EMAIL_OR_PASSWORD,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!this.isValidPassword(payload.password, user.password)) {
        throw new AppError(
          AuthError.INCORRECT_EMAIL_OR_PASSWORD,
          HttpStatus.BAD_REQUEST,
        );
      }

      const tokens = await this.genToken(user);

      this.redisCache.set(user.id, tokens.refresh_token, {
        ttl: Number(config.REFRESH_TOKEN_LIFE),
      });

      const following = await this.userFollowRepository.count({
        where: { userId: user.id },
      });

      const follower = await this.userFollowRepository.count({
        where: { followedId: user.id },
      });

      this.logger.log('USER LOGGING::', JSON.stringify(payload));

      return {
        data: { ...toUserResponse(user), following, follower },
        tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async signup(payload: SignupDto) {
    try {
      const user = await this.userRepository.findOneBy({
        email: payload.email,
        isDeleted: false,
      });

      if (user) {
        throw new AppError(AuthError.USER_EXISTS, HttpStatus.BAD_REQUEST);
      }

      const newUser = this.userRepository.create({
        ...payload,
      });

      const userSaved = await this.userRepository.save(newUser);

      const tokens = await this.genToken(userSaved);

      this.redisCache.set(userSaved.id, tokens.refresh_token, {
        ttl: Number(config.REFRESH_TOKEN_LIFE),
      });

      this.logger.log('USER SIGNUP::', payload.email);
      return {
        data: { ...toUserResponse(userSaved), following: 0, follower: 0 },
        tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(userId: string, rfToken: string) {
    try {
      const user = await this.userRepository.findOneBy({
        id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw new AppError(
          UserErrorMessage.USER_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }

      const cachedToken = await this.redisCache.get(userId);

      if (cachedToken !== rfToken) {
        throw new AppError(
          AuthError.INVALID_REFRESH_TOKEN,
          HttpStatus.BAD_REQUEST,
        );
      }

      const tokens = await this.genToken(user);

      this.redisCache.set(user.id, tokens.refresh_token, {
        ttl: Number(config.REFRESH_TOKEN_LIFE),
      });

      return {
        tokens,
      };
    } catch (error) {
      throw error;
    }
  }
}
