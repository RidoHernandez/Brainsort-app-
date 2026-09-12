import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('debe retornar el perfil del usuario', async () => {
      const mockUser = {
        id: 'uuid-1',
        nombre: 'Test User',
        correo: 'test@example.com',
        rol: 'Estudiante',
        createdAt: new Date('2026-01-01'),
      };

      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('uuid-1');

      expect(result).toEqual(mockUser);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('nombre');
      expect(result).toHaveProperty('correo');
      expect(result).toHaveProperty('rol');
      expect(result).toHaveProperty('createdAt');
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe consultar solo los campos necesarios (select)', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test',
        correo: 'test@example.com',
        rol: 'Estudiante',
        createdAt: new Date(),
      });

      await service.getProfile('uuid-1');

      expect(mockPrismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true,
          createdAt: true,
        },
      });
    });
  });

  describe('updateProfile', () => {
    it('debe actualizar el nombre del usuario', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Old Name',
        correo: 'test@example.com',
      });
      mockPrismaService.usuario.update.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'New Name',
        correo: 'test@example.com',
        rol: 'Estudiante',
        createdAt: new Date(),
      });

      const result = await service.updateProfile('uuid-1', {
        nombre: 'New Name',
      });

      expect(result.nombre).toBe('New Name');
    });

    it('debe hashear la nueva contraseña al actualizar', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test',
        correo: 'test@example.com',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockPrismaService.usuario.update.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Test',
        correo: 'test@example.com',
        rol: 'Estudiante',
        createdAt: new Date(),
      });

      await service.updateProfile('uuid-1', {
        contrasena: 'NewPassword123!',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 10);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent-id', { nombre: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar nombre y contraseña simultáneamente', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'Old',
        correo: 'test@example.com',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrismaService.usuario.update.mockResolvedValue({
        id: 'uuid-1',
        nombre: 'New Name',
        correo: 'test@example.com',
        rol: 'Estudiante',
        createdAt: new Date(),
      });

      await service.updateProfile('uuid-1', {
        nombre: 'New Name',
        contrasena: 'NewPass123!',
      });

      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { nombre: 'New Name', contrasena: 'hashed' },
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true,
          createdAt: true,
        },
      });
    });
  });
});
