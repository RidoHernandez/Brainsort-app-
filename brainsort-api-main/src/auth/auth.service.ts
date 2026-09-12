import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Rol } from '../../generated/prisma';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { nombre, correo, rol, contrasena } = registerDto;

    // Check if email already exists
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword: string = await bcrypt.hash(contrasena, 10);

    // Create user
    const user = await this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        rol: rol as Rol,
        contrasena: hashedPassword,
      },
    });

    // Create user progress
    await this.prisma.progresoUsuario.create({
      data: {
        usuarioId: user.id,
        puntosTotales: 0,
        nivelActual: 1,
        rachaDias: 0,
        posicionRanking: 0,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(
      user.id,
      user.correo,
      user.rol,
      'usuario',
    );

    return {
      ...tokens,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        tipo: 'usuario',
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { correo, contrasena } = loginDto;

    // Search in users table first
    const user = await this.prisma.usuario.findUnique({
      where: { correo },
    });

    let tipo = 'usuario';
    let rol: string;
    let userId: string;
    let userName: string;
    let userCorreo: string;
    let password: string;

    // If not found in users, search in administrators
    if (!user) {
      const admin = await this.prisma.administrador.findUnique({
        where: { correo },
      });

      if (admin) {
        tipo = 'administrador';
        rol = 'Administrador';
        userId = admin.id;
        userName = admin.nombre;
        userCorreo = admin.correo;
        password = admin.contrasena;

        // Update ultimoAcceso for administrators
        await this.prisma.administrador.update({
          where: { id: admin.id },
          data: { ultimoAcceso: new Date() },
        });
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      rol = user.rol;
      userId = user.id;
      userName = user.nombre;
      userCorreo = user.correo;
      password = user.contrasena;
    }

    // Verify password
    const isPasswordValid: boolean = await bcrypt.compare(contrasena, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(userId, userCorreo, rol, tipo);

    return {
      ...tokens,
      usuario: {
        id: userId,
        nombre: userName,
        correo: userCorreo,
        rol: rol,
        tipo: tipo,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; tipo?: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tipo === 'administrador') {
      const admin = await this.prisma.administrador.findUnique({
        where: { id: payload.sub },
      });

      if (!admin) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(
        admin.id,
        admin.correo,
        'Administrador',
        'administrador',
      );
    }

    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.generateTokens(
      user.id,
      user.correo,
      user.rol,
      'usuario',
    );

    return tokens;
  }

  private generateTokens(
    userId: string,
    correo: string,
    rol: string,
    tipo: string,
  ) {
    const payload = {
      sub: userId,
      correo,
      rol,
      tipo,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    return {
      token: accessToken,
      refreshToken,
    };
  }
}
