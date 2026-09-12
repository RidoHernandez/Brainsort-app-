import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    administrador: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    progresoUsuario: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      nombre: 'Test User',
      correo: 'test@example.com',
      rol: 'Estudiante',
      contrasena: 'Password123!',
    };

    it('debe registrar un usuario exitosamente', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.usuario.create.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test User',
        correo: 'test@example.com',
        rol: 'Estudiante',
        contrasena: 'hashed-password',
      });
      mockPrismaService.progresoUsuario.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('usuario');
      expect(result.usuario.correo).toBe('test@example.com');
      expect(result.usuario.tipo).toBe('usuario');
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    });

    it('debe rechazar registro con correo duplicado', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'existing-id',
        correo: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe crear ProgresoUsuario al registrar', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.usuario.create.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test User',
        correo: 'test@example.com',
        rol: 'Estudiante',
        contrasena: 'hashed-password',
      });
      mockPrismaService.progresoUsuario.create.mockResolvedValue({});

      await service.register(registerDto);

      expect(mockPrismaService.progresoUsuario.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 'uuid-1',
          puntosTotales: 0,
          nivelActual: 1,
          rachaDias: 0,
          posicionRanking: 0,
        },
      });
    });

    it('debe hashear la contraseña con bcrypt salt 10', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
      mockPrismaService.usuario.create.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test',
        correo: 'test@example.com',
        rol: 'Estudiante',
        contrasena: 'hashed-pass',
      });
      mockPrismaService.progresoUsuario.create.mockResolvedValue({});

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    });
  });

  describe('login', () => {
    const loginDto = {
      correo: 'test@example.com',
      contrasena: 'Password123!',
    };

    it('debe hacer login exitosamente como usuario', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test User',
        correo: 'test@example.com',
        rol: 'Estudiante',
        contrasena: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.usuario.tipo).toBe('usuario');
    });

    it('debe hacer login exitosamente como administrador', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.administrador.findUnique.mockResolvedValue({
        id: 'admin-1',
        nombre: 'Admin',
        correo: 'admin@brainsort.edu',
        contrasena: 'hashed-admin-pass',
        credencialesAdmin: 'SUPER_ADMIN',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.administrador.update.mockResolvedValue({});

      const result = await service.login({
        correo: 'admin@brainsort.edu',
        contrasena: 'AdminPass123!',
      });

      expect(result.usuario.tipo).toBe('administrador');
      expect(result.usuario.rol).toBe('Administrador');
      expect(mockPrismaService.administrador.update).toHaveBeenCalled();
    });

    it('debe rechazar login con credenciales incorrectas', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.administrador.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe rechazar login con contraseña incorrecta', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test User',
        correo: 'test@example.com',
        rol: 'Estudiante',
        contrasena: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe usar mensaje genérico para no revelar si falla correo o contraseña', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.administrador.findUnique.mockResolvedValue(null);

      try {
        await service.login(loginDto);
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });

  describe('refresh', () => {
    it('debe refrescar tokens exitosamente', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'uuid-1',
        correo: 'test@example.com',
        rol: 'Estudiante',
        tipo: 'usuario',
      });
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        correo: 'test@example.com',
        rol: 'Estudiante',
      });

      const result = await service.refresh('valid-refresh-token');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('debe refrescar tokens de administrador exitosamente', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'admin-1',
        correo: 'admin@brainsort.edu',
        rol: 'Administrador',
        tipo: 'administrador',
      });
      mockPrismaService.administrador.findUnique.mockResolvedValue({
        id: 'admin-1',
        correo: 'admin@brainsort.edu',
      });

      const result = await service.refresh('valid-admin-refresh-token');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.usuario.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.administrador.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-1' },
      });
    });

    it('debe rechazar refresh token inválido', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refresh('invalid-token')).rejects.toThrow();
    });

    it('debe rechazar si el usuario del token no existe', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'nonexistent-id',
        correo: 'deleted@example.com',
        rol: 'Estudiante',
        tipo: 'usuario',
      });
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.refresh('valid-but-user-deleted')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
