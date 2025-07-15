import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

/**
 * Common HTTP test utilities
 */
export class HttpTestUtils {
  constructor(private app: INestApplication) {}

  /**
   * Perform a GET request
   */
  get(path: string) {
    return request(this.app.getHttpServer()).get(path);
  }

  /**
   * Perform a POST request
   */
  post(path: string, data?: any) {
    const req = request(this.app.getHttpServer()).post(path);
    if (data) {
      req.send(data);
    }
    return req;
  }

  /**
   * Perform a PUT request
   */
  put(path: string, data?: any) {
    const req = request(this.app.getHttpServer()).put(path);
    if (data) {
      req.send(data);
    }
    return req;
  }

  /**
   * Perform a DELETE request
   */
  delete(path: string) {
    return request(this.app.getHttpServer()).delete(path);
  }

  /**
   * Perform a PATCH request
   */
  patch(path: string, data?: any) {
    const req = request(this.app.getHttpServer()).patch(path);
    if (data) {
      req.send(data);
    }
    return req;
  }
}

/**
 * Test data generators
 */
export class TestDataGenerator {
  /**
   * Generate a random string
   */
  static randomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * Generate a random email
   */
  static randomEmail(): string {
    return `test_${this.randomString()}@example.com`;
  }

  /**
   * Generate a random number within a range
   */
  static randomNumber(min: number = 1, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

/**
 * Test assertion helpers
 */
export class TestAssertions {
  /**
   * Assert that response contains expected structure
   */
  static expectResponseStructure(response: any, expectedKeys: string[]) {
    expect(response).toBeDefined();
    expectedKeys.forEach(key => {
      expect(response).toHaveProperty(key);
    });
  }

  /**
   * Assert that response is a paginated result
   */
  static expectPaginatedResponse(response: any) {
    this.expectResponseStructure(response, ['data', 'count', 'total', 'page', 'pageCount']);
    expect(Array.isArray(response.data)).toBe(true);
  }
}
