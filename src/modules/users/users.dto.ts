import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @MinLength(2)
  @IsOptional()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @MinLength(6)
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  locate: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  @IsOptional()
  bio: string;
}

export class UserFollowDto {
  @IsUUID('4')
  @IsNotEmpty()
  followingId: string;
}

export class GetUserDto {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;
}
