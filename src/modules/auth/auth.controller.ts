import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService;

  @Post('login')
  async login(@Body() body: LoginDto) {
    const res = await this.authService.login(body);
    return res;
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    const res = await this.authService.signup(body);
    return res;
  }

  @UseGuards(AuthGuard('refresh-token'))
  @Get('refresh-token')
  async refreshToken(@Req() req: Request) {
    const user = req.user as any;
    if (user) {
      const res = await this.authService.refreshToken(user.id, user.rfToken);
      return res;
    }

    throw new ForbiddenException('Refresh token is not provided');
  }
}
