import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateData: { nombre?: string; contrasena?: string },
  ) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: any = {};

    if (updateData.nombre) {
      data.nombre = updateData.nombre;
    }

    if (updateData.contrasena) {
      data.contrasena = (await bcrypt.hash(
        updateData.contrasena,
        10,
      )) as string;
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }
}
