import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  schoolId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const cookieHeader = req?.headers?.cookie;
          if (!cookieHeader) return null;
          const cookies = cookieHeader
            .split(';')
            .reduce((acc: Record<string, string>, part: string) => {
              const [key, ...rest] = part.trim().split('=');
              if (!key) return acc;
              acc[key] = decodeURIComponent(rest.join('='));
              return acc;
            }, {});
          return cookies['token'] || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        school: true,
        student: true,
        parent: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return user;
  }
}
