import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestContextModule } from 'nestjs-request-context';
import { LoggerModule } from 'nestjs-pino';
import { typeOrmModuleConfig } from '@shared/config/typeorm.config';
import { AuthModule } from '@shared/auth/auth.module';
import { MailSendModule } from '@shared/utils/mail/mail-send.module';
import { EntitiesModule } from './entities.module';
import { getPinoConfig } from '@shared/config/pino.config';
import { UserInitModule } from './user-init.module';
import { UserInitializationService } from './user-initialization.service';
import { YemotModule } from '@shared/utils/yemot/v2/yemot.module';
import { YemotHandlerService } from './yemot-handler.service';

@Module({
  imports: [
    RequestContextModule,
    LoggerModule.forRoot(getPinoConfig(process.env.NODE_ENV === 'development')),
    ThrottlerModule.forRoot({ ttl: 5, limit: 2000 }),
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    MailSendModule,
    EntitiesModule,
    YemotModule.register(YemotHandlerService),
    AuthModule.forRootAsync({
      imports: [UserInitModule],
      userInitServiceType: UserInitializationService,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
