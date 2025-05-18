import { Module } from '@nestjs/common';
import { YemotRouterService } from './yemot-router.service';

/**
 * Module that provides the Yemot router functionality
 */
@Module({
  providers: [YemotRouterService],
  exports: [YemotRouterService],
})
export class YemotModule {}
