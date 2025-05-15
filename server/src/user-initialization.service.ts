import { Injectable } from '@nestjs/common';
import { User } from '@shared/entities/User.entity';
import { IUserInitializationService } from '@shared/auth/user-initialization.interface';

@Injectable()
export class UserInitializationService implements IUserInitializationService {
  constructor() {}

  async initializeUserData(user: User): Promise<void> {}
}
