import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesModule } from '../entities.module';
import { BaseEntityModule } from '@shared/base-entity/base-entity.module';
import { getMetadataArgsStorage, DataSource } from 'typeorm';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';

// Mock BaseEntityModule
jest.mock('@shared/base-entity/base-entity.module', () => {
  const MockBaseEntityModule = {
    register: jest.fn().mockReturnValue({
      module: class MockBaseEntityModule {},
      providers: [
        {
          provide: 'CONFIG',
          useValue: { entity: class MockEntity {} },
        },
      ],
    }),
  };

  // Export the mock for tests to use
  global.MockBaseEntityModule = MockBaseEntityModule;

  return {
    BaseEntityModule: MockBaseEntityModule,
  };
});

// Get the mock from global for test assertions
const MockBaseEntityModule = global.MockBaseEntityModule;

// Import all configs and entities
import userConfig from '../entity-modules/user.config';
import auditLogConfig from '../entity-modules/audit-log.config';
import importFileConfig from '../entity-modules/import-file.config';
import pageConfig from '../entity-modules/page.config';
import paymentTrackConfig from '../entity-modules/payment-track.config';
import textConfig from '../entity-modules/text.config';
import mailAddressConfig from '@shared/utils/mail/mail-address.config';
import eventConfig from '../entity-modules/event.config';
import eventTypeConfig from '../entity-modules/event-type.config';
import eventNoteConfig from '../entity-modules/event-note.config';
import giftConfig from '../entity-modules/gift.config';
import eventGiftConfig from '../entity-modules/event-gift.config';
import classConfig from '../entity-modules/class.config';
import studentConfig from '../entity-modules/student.config';
import teacherConfig from '../entity-modules/teacher.config';
import levelTypeConfig from '../entity-modules/level-type.config';
import studentClassConfig from '../entity-modules/student-class.config';
import studentByYearConfig from '../entity-modules/student-by-year.config';
import { YemotCall } from '@shared/entities/YemotCall.entity';
import { TextByUser } from '@shared/view-entities/TextByUser.entity';
import { RecievedMail } from '@shared/entities/RecievedMail.entity';
import { Image } from '@shared/entities/Image.entity';

describe('EntitiesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    const mockDataSource = {
      createEntityManager: jest.fn(),
      hasRepository: jest.fn().mockReturnValue(true),
      getRepository: jest.fn().mockReturnValue({
        metadata: {
          columns: [],
          relations: [],
        },
      }),
      getMetadata: jest.fn().mockReturnValue({
        columns: [],
        relations: [],
      }),
    };

    // Create test module
    module = await Test.createTestingModule({
      imports: [EntitiesModule],
      providers: [
        {
          provide: 'DataSource',
          useFactory: () => ({
            ...mockDataSource,
            options: {
              type: 'sqlite' as const,
              database: ':memory:',            entities: [
              userConfig.entity,
              auditLogConfig.entity,
              importFileConfig.entity,
              pageConfig.entity,
              paymentTrackConfig.entity,
              textConfig.entity,
              eventConfig.entity,
              eventTypeConfig.entity,
              eventNoteConfig.entity,
              giftConfig.entity,
              eventGiftConfig.entity,
              classConfig.entity,
              studentConfig.entity,
              teacherConfig.entity,
              levelTypeConfig.entity,
              studentClassConfig.entity,
              studentByYearConfig.entity,
              YemotCall,
              TextByUser,
              RecievedMail,
              Image,
            ],
              synchronize: true,
            },
          }),
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  describe('Module Configuration', () => {
    it('should have BaseEntityModule imports', () => {
      const imports = Reflect.getMetadata('imports', EntitiesModule);
      expect(imports).toBeDefined();
      expect(Array.isArray(imports)).toBe(true);

      imports.forEach((imp) => {
        expect(typeof imp).toBe('object');
        expect(imp).toHaveProperty('module');
      });
    });
  });

  describe('Entity Configurations', () => {
    const configsToTest = [
      { name: 'userConfig', config: userConfig },
      { name: 'auditLogConfig', config: auditLogConfig },
      { name: 'importFileConfig', config: importFileConfig },
      { name: 'pageConfig', config: pageConfig },
      { name: 'paymentTrackConfig', config: paymentTrackConfig },
      { name: 'textConfig', config: textConfig },
      { name: 'mailAddressConfig', config: mailAddressConfig },
      { name: 'eventConfig', config: eventConfig },
      { name: 'eventTypeConfig', config: eventTypeConfig },
      { name: 'eventNoteConfig', config: eventNoteConfig },
      { name: 'giftConfig', config: giftConfig },
      { name: 'eventGiftConfig', config: eventGiftConfig },
      { name: 'classConfig', config: classConfig },
      { name: 'studentConfig', config: studentConfig },
      { name: 'teacherConfig', config: teacherConfig },
      { name: 'levelTypeConfig', config: levelTypeConfig },
      { name: 'studentClassConfig', config: studentClassConfig },
      { name: 'studentByYearConfig', config: studentByYearConfig },
    ];

    configsToTest.forEach(({ name, config }) => {
      it(`should properly register ${name}`, () => {
        expect(config).toBeDefined();
        expect(config.entity).toBeDefined();
      });
    });

    const entitiesToTest = [
      { name: 'YemotCall', entity: YemotCall },
      { name: 'TextByUser', entity: TextByUser },
      { name: 'RecievedMail', entity: RecievedMail },
      { name: 'Image', entity: Image },
    ];

    entitiesToTest.forEach(({ name, entity }) => {
      it(`should properly register ${name} entity`, () => {
        expect(entity).toBeDefined();
        // Verify the entity is registered with TypeORM
        const metadata = getMetadataArgsStorage();
        const entityMetadata = metadata.tables.find((table) => {
          const target = table.target;
          if (typeof target === 'function') {
            return target === entity;
          }
          return target === entity.toString();
        });
        expect(entityMetadata).toBeDefined();
      });
    });
  });

  describe('BaseEntityModule Integration', () => {
    it('should properly configure BaseEntityModule for each entity', () => {
      const imports = Reflect.getMetadata('imports', EntitiesModule);
      expect(imports).toBeDefined();
      expect(Array.isArray(imports)).toBe(true);

      imports.forEach((imp) => {
        expect(typeof imp).toBe('object');
        expect(imp).toHaveProperty('module');
        expect(imp).toHaveProperty('providers');
        expect(Array.isArray(imp.providers)).toBe(true);
      });
    });

    it('should have valid configurations for all registered entities', () => {
      const imports = Reflect.getMetadata('imports', EntitiesModule);
      imports.forEach((imp) => {
        const config = imp.providers.find((p) => p.provide === 'CONFIG').useValue;
        expect(config).toBeDefined();
        expect(config.entity).toBeDefined();
      });
    });
  });
});
