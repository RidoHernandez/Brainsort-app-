import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // Check if the user has the required role
    const hasRole = requiredRoles.includes(user.rol as string);
    if (!hasRole) {
      throw new ForbiddenException('Access denied');
    }

    // For Administrador role, also verify the user exists in administradores table
    if (user.rol === 'Administrador' && user.tipo === 'administrador') {
      const admin = await this.prisma.administrador.findUnique({
        where: { id: user.id as string },
      });
      if (!admin) {
        throw new ForbiddenException('Access denied');
      }
    }

    return true;
  }
}
