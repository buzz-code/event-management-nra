import { Module } from '@nestjs/common';
import { UserInitializationService } from './user-initialization.service';

@Module({
  providers: [UserInitializationService],
  exports: [UserInitializationService],
})
export class UserInitModule {}
