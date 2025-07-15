import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';

/**
 * Helper class for setting up and tearing down the NestJS application in e2e tests
 */
export class TestAppHelper {
  private app: INestApplication;
  private moduleFixture: TestingModule;
  private dataSource: DataSource;

  /**
   * Initialize the test application
   */
  async initializeApp(): Promise<INestApplication> {
    this.moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.moduleFixture.createNestApplication();
    await this.app.init();
    
    // Get the DataSource for proper cleanup
    this.dataSource = this.moduleFixture.get<DataSource>(DataSource);
    
    return this.app;
  }

  /**
   * Get the initialized application instance
   */
  getApp(): INestApplication {
    if (!this.app) {
      throw new Error('Application not initialized. Call initializeApp() first.');
    }
    return this.app;
  }

  /**
   * Get the HTTP server from the application
   */
  getHttpServer() {
    return this.getApp().getHttpServer();
  }

  /**
   * Get a service from the module
   */
  getService<T>(token: any): T {
    if (!this.moduleFixture) {
      throw new Error('Module fixture not available. Call initializeApp() first.');
    }
    return this.moduleFixture.get<T>(token);
  }

  /**
   * Clean up and close the application
   */
  async cleanup(): Promise<void> {
    try {
      if (this.app) {
        // Close database connections first
        if (this.dataSource && this.dataSource.isInitialized) {
          await this.dataSource.destroy();
        }
        // Then close the application
        await this.app.close();
      }
      if (this.moduleFixture) {
        await this.moduleFixture.close();
      }
    } catch (error) {
      console.warn('Error during test cleanup:', error);
    }
  }
}

/**
 * Create and return a new TestAppHelper instance
 */
export function createTestApp(): TestAppHelper {
  return new TestAppHelper();
}
