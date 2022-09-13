import config, { isProdEnv } from '@/config/configuration';
import { Logger } from '@/loaders/logger/loggerLoader';
import { User } from '@/models';
import { UserFollow } from '@/models/UserFollow/userFollow.entity';
import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

export class DBLoader {
  static init(): DynamicModule {
    const logger = new Logger(DBLoader.name);
    logger.log(`Initializing DBLoader...`);
    return TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.DB_HOST,
      port: parseInt(config.DB_PORT),
      username: config.USER_DB_USER,
      password: config.USER_DB_PASSWORD,
      database: config.USER_DB_NAME,
      synchronize: isProdEnv ? false : true,
      entities: [User, UserFollow],
      // entities: ['dist/**/**/*.entity.js'],
      logging: false,
    });
  }
}
