import '@shared/config/crud.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { setupApplication, setupYemotRouter } from '@shared/utils/bootstrap.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApplication(app, {
    swaggerTitle: 'event-management-nra',
    swaggerDescription: 'Demo website description',
    swaggerTag: 'demo',
  });

  setupYemotRouter(app);

  await app.listen(3000);
}
bootstrap();
