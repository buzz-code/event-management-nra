import '@shared/config/crud.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { setupYemotRouter } from '@shared/utils/yemot/yemot-router';
import { yemotHandler, yemotProcessor } from './yemot-handler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const config = new DocumentBuilder()
    .setTitle('event-management-nra')
    .setDescription('Demo website description')
    .setVersion('1.0')
    .addTag('demo')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    credentials: true,
    origin: [
      new RegExp('http(s?)://' + process.env.DOMAIN_NAME),
      process.env.IP_ADDRESS && new RegExp('http(s?)://' + process.env.IP_ADDRESS + ':[\d]*'),
      'http://localhost:30013',
    ],
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  const yemotRouter = setupYemotRouter(yemotHandler, yemotProcessor);
  app.use('/yemot/handle-call', yemotRouter);

  await app.listen(3000);
  console.log(`Application is running on port ${3000}`);
}
bootstrap();
