import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsString()
  locate: string;

  @IsString()
  username: string;

  @IsString()
  avatar: string;

  @IsString()
  bio: string;
}

export class UserFollowDto {
  @IsString()
  @IsNotEmpty()
  followingId: string;
}
