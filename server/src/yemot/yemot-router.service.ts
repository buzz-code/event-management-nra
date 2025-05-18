import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import * as express from 'express';
import { setupYemotRouter } from '@shared/utils/yemot/yemot-router';
import { messageConstants, yemotHandler, yemotProcessor } from './yemot-handler';

@Injectable()
export class YemotRouterService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  getRouter(): express.Router {
    return setupYemotRouter(
      yemotHandler,
      yemotProcessor,
      this.dataSource,
      messageConstants
    );
  }
}
