import { BaseNraAppModule } from '@shared/app/base-app.module';
import { EntitiesModule } from './entities.module';
import { YemotHandlerService } from './yemot-handler.service';

export const AppModule = BaseNraAppModule.forRoot({
  entitiesModule: EntitiesModule,
  yemotHandlerService: YemotHandlerService,
});
