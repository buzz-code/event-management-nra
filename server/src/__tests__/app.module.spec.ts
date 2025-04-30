import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestContextModule } from 'nestjs-request-context';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from '@shared/auth/auth.module';
import { YemotModule } from '@shared/utils/yemot/yemot.module';
import { MailSendModule } from '@shared/utils/mail/mail-send.module';
import { EntitiesModule } from '../entities.module';
import { getPinoConfig } from '@shared/config/pino.config';
import { JwtModule } from '@nestjs/jwt';

// Mock required modules
jest.mock('../entities.module', () => ({
  EntitiesModule: class {
    static imports = [];
  }
}));

jest.mock('@shared/config/pino.config', () => ({
  getPinoConfig: jest.fn().mockImplementation((isDev) => ({
    pinoHttp: { level: isDev ? 'debug' : 'info' }
  }))
}));

// Mock JWT configuration
jest.mock('@shared/auth/constants', () => ({
  jwtConstants: {
    secret: 'test-secret',
    maxAge: '60s'
  }
}));

// Other external configurations
jest.mock('@shared/config/pino.config', () => ({
  getPinoConfig: jest.fn().mockReturnValue({
    pinoHttp: { level: 'silent' }
  })
}));

jest.mock('@shared/config/typeorm.config', () => ({
  typeOrmModuleConfig: {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false
  }
}));

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    })
    .overrideProvider('JWT_SECRET')
    .useValue('test-secret')
    .compile();

    module = moduleRef;
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AppController', () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });

  it('should have AppService', () => {
    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
  });

  it('should configure ThrottlerModule with correct options', () => {
    const throttlerModule = Reflect.getMetadata('imports', AppModule);
    const throttlerConfig = throttlerModule.find(
      (imp: any) => imp && imp.module === ThrottlerModule
    );
    expect(throttlerConfig).toBeDefined();
    expect(throttlerConfig.module).toBe(ThrottlerModule);
  });

  it('should register ThrottlerGuard as APP_GUARD', () => {
    const providers = Reflect.getMetadata('providers', AppModule);
    const guardProvider = providers.find(
      (provider: any) => provider.provide === APP_GUARD
    );
    expect(guardProvider).toBeDefined();
    expect(guardProvider.useClass).toBe(ThrottlerGuard);
  });

  it('should configure TypeOrmModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    const typeOrmConfig = imports.find(
      (imp: any) => imp && imp.module === TypeOrmModule
    );
    expect(typeOrmConfig).toBeDefined();
    expect(typeOrmConfig.module).toBe(TypeOrmModule);
  });

  it('should import RequestContextModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports.includes(RequestContextModule)).toBe(true);
  });

  it('should configure LoggerModule with Pino', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    const loggerConfig = imports.find(
      (imp: any) => imp && imp.module === LoggerModule
    );
    expect(loggerConfig).toBeDefined();
    expect(loggerConfig.module).toBe(LoggerModule);
    expect(getPinoConfig).toHaveBeenCalled();
  });

  it('should import MailSendModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports.includes(MailSendModule)).toBe(true);
  });

  it('should import EntitiesModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports.includes(EntitiesModule)).toBe(true);
  });

  it('should import AuthModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    const authModuleImport = imports.find(
      (imp: any) => imp && imp.module === AuthModule
    );
    expect(authModuleImport).toBeDefined();
  });

  it('should configure YemotModule with chain', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    const yemotConfig = imports.find(
      (imp: any) => imp && imp.module === YemotModule
    );
    expect(yemotConfig).toBeDefined();
    expect(yemotConfig.module).toBe(YemotModule);
  });

  describe('Environment configuration', () => {
    const previousEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    afterEach(() => {
      process.env.NODE_ENV = previousEnv;
    });

    it('should configure Pino logger for development environment', async () => {
      process.env.NODE_ENV = 'development';
      
      const moduleRef = await Test.createTestingModule({
        imports: [LoggerModule.forRoot(getPinoConfig(true))]
      }).compile();

      const loggerModule = moduleRef.get(LoggerModule);
      expect(getPinoConfig).toHaveBeenCalledWith(true);
      expect(loggerModule).toBeDefined();
    });

    it('should configure Pino logger for production environment', async () => {
      process.env.NODE_ENV = 'production';
      
      const moduleRef = await Test.createTestingModule({
        imports: [LoggerModule.forRoot(getPinoConfig(false))]
      }).compile();

      const loggerModule = moduleRef.get(LoggerModule);
      expect(getPinoConfig).toHaveBeenCalledWith(false);
      expect(loggerModule).toBeDefined();
    });
  });
});