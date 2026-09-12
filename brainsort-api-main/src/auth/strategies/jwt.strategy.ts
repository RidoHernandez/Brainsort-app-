import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const { sub, tipo } = payload;

    if (tipo === 'usuario') {
      const user = await this.prisma.usuario.findUnique({
        where: { id: sub as string },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      return {
        id: user.id,
        correo: user.correo,
        rol: user.rol,
        tipo: 'usuario',
      };
    } else if (tipo === 'administrador') {
      const admin = await this.prisma.administrador.findUnique({
        where: { id: sub as string },
      });
      if (!admin) {
        throw new UnauthorizedException();
      }
      return {
        id: admin.id,
        correo: admin.correo,
        rol: 'Administrador',
        tipo: 'administrador',
        credenciales: admin.credencialesAdmin,
      };
    }

    throw new UnauthorizedException();
  }
}
