import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LightMyRequestResponse } from 'fastify';
import { AppModule } from './../src/app.module';
import { createTestApp } from './create-test-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<NestFastifyApplication>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/biblioteca (GET)', async () => {
    const response: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/api/biblioteca',
      });

    expect(response.statusCode).toBe(200);
  });
});
