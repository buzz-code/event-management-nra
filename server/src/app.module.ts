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
import { YemotModule } from '@shared/utils/yemot/yemot.module';
// import { yemotProcessorProvider } from 'src/yemot.processor';
import yemotChain from './yemot/yemot.chain';
import { MailSendModule } from '@shared/utils/mail/mail-send.module';
import { EntitiesModule } from './entities.module';
import { getPinoConfig } from '@shared/config/pino.config';

@Module({
  imports: [
    RequestContextModule,
    LoggerModule.forRoot(getPinoConfig(process.env.NODE_ENV === 'development')),
    ThrottlerModule.forRoot({ ttl: 5, limit: 200 }),
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    MailSendModule,
    EntitiesModule,
    AuthModule,
    YemotModule.register(yemotChain)
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
