import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Security Integration (Guards)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Global JWT Protection', () => {
    it('should return 401 Unauthorized for a protected route (e.g., /health)', () => {
      // Al ser un guard global en IamModule, /health está protegido por defecto
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer()).get('/health').expect(401);
    });

    it('should return 200 OK for a public route marked with @Public() (e.g., /api/v1/catalogs/specialties)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get('/api/v1/catalogs/specialties')
        .expect(200);
    });
  });

  describe('Authentication Flow Access', () => {
    it('should allow access to registration without token', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({}) // El error será 400 (BadRequest) por validación, no 401
        .expect((res) => {
          if (res.status === 401)
            throw new Error('Auth route should be public');
        });
    });

    it('should allow access to login without token', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect((res) => {
          if (res.status === 401)
            throw new Error('Login route should be public');
        });
    });
  });
});
