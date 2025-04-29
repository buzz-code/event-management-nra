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
      providers: [{
        provide: 'CONFIG',
        useValue: { entity: class MockEntity {} }
      }]
    })
  };
  
  // Export the mock for tests to use
  global.MockBaseEntityModule = MockBaseEntityModule;
  
  return {
    BaseEntityModule: MockBaseEntityModule
  };
});

// Get the mock from global for test assertions
const MockBaseEntityModule = global.MockBaseEntityModule;

// Import all configs and entities
import userConfig from '../entity-modules/user.config';
import attReportConfig from '../entity-modules/att-report.config';
import gradeConfig from '../entity-modules/grade.config';
import klassConfig from '../entity-modules/klass.config';
import klassTypeConfig from '../entity-modules/klass-type.config';
import knownAbsenceConfig from '../entity-modules/known-absence.config';
import lessonConfig from '../entity-modules/lesson.config';
import studentKlassConfig from '../entity-modules/student-klass.config';
import studentConfig from '../entity-modules/student.config';
import teacherConfig from '../entity-modules/teacher.config';
import textConfig from '../entity-modules/text.config';
import { StudentBaseKlass } from '../db/view-entities/StudentBaseKlass.entity';
import { YemotCall } from '@shared/entities/YemotCall.entity';
import { RecievedMail } from '@shared/entities/RecievedMail.entity';
import { Image } from "@shared/entities/Image.entity";
import { ReportMonth } from '../db/entities/ReportMonth.entity';
import { AttReportAndGrade } from "../db/view-entities/AttReportAndGrade.entity";
import { StudentGlobalReport } from "../db/view-entities/StudentGlobalReport.entity";
import { KnownAbsenceWithReportMonth } from "../db/view-entities/KnownAbsenceWithReportMonth.entity";
import { GradeName } from "../db/entities/GradeName.entity";
import { AttGradeEffect } from "../db/entities/AttGradeEffect";
import { GradeEffectByUser } from "@shared/view-entities/GradeEffectByUser.entity";
import { AbsCountEffectByUser } from "@shared/view-entities/AbsCountEffectByUser.entity";
import { LessonKlassName } from "../db/view-entities/LessonKlassName.entity";

describe('EntitiesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    const mockDataSource = {
      createEntityManager: jest.fn(),
      hasRepository: jest.fn().mockReturnValue(true),
      getRepository: jest.fn().mockReturnValue({
        metadata: {
          columns: [],
          relations: []
        }
      }),
      getMetadata: jest.fn().mockReturnValue({
        columns: [],
        relations: []
      })
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
              database: ':memory:',
              entities: [
                userConfig.entity,
                attReportConfig.entity,
                gradeConfig.entity,
                klassConfig.entity,
                klassTypeConfig.entity,
                knownAbsenceConfig.entity,
                lessonConfig.entity,
                studentKlassConfig.entity,
                studentConfig.entity,
                teacherConfig.entity,
                textConfig.entity,
                StudentBaseKlass,
                YemotCall,
                RecievedMail,
                Image,
                ReportMonth,
                AttReportAndGrade,
                StudentGlobalReport,
                KnownAbsenceWithReportMonth,
                GradeName,
                AttGradeEffect,
                GradeEffectByUser,
                AbsCountEffectByUser,
                LessonKlassName
              ],
              synchronize: true
            }
          })
        }
      ]
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
      
      imports.forEach(imp => {
        expect(typeof imp).toBe('object');
        expect(imp).toHaveProperty('module');
      });
    });
  });

  describe('Entity Configurations', () => {
    const configsToTest = [
      { name: 'userConfig', config: userConfig },
      { name: 'attReportConfig', config: attReportConfig },
      { name: 'gradeConfig', config: gradeConfig },
      { name: 'klassConfig', config: klassConfig },
      { name: 'klassTypeConfig', config: klassTypeConfig },
      { name: 'knownAbsenceConfig', config: knownAbsenceConfig },
      { name: 'lessonConfig', config: lessonConfig },
      { name: 'studentKlassConfig', config: studentKlassConfig },
      { name: 'studentConfig', config: studentConfig },
      { name: 'teacherConfig', config: teacherConfig },
      { name: 'textConfig', config: textConfig }
    ];

    configsToTest.forEach(({ name, config }) => {
      it(`should properly register ${name}`, () => {
        expect(config).toBeDefined();
        expect(config.entity).toBeDefined();
      });
    });

    const entitiesToTest = [
      { name: 'StudentBaseKlass', entity: StudentBaseKlass },
      { name: 'YemotCall', entity: YemotCall },
      { name: 'RecievedMail', entity: RecievedMail },
      { name: 'Image', entity: Image },
      { name: 'ReportMonth', entity: ReportMonth },
      { name: 'AttReportAndGrade', entity: AttReportAndGrade },
      { name: 'StudentGlobalReport', entity: StudentGlobalReport },
      { name: 'KnownAbsenceWithReportMonth', entity: KnownAbsenceWithReportMonth },
      { name: 'GradeName', entity: GradeName },
      { name: 'AttGradeEffect', entity: AttGradeEffect },
      { name: 'GradeEffectByUser', entity: GradeEffectByUser },
      { name: 'AbsCountEffectByUser', entity: AbsCountEffectByUser },
      { name: 'LessonKlassName', entity: LessonKlassName }
    ];

    entitiesToTest.forEach(({ name, entity }) => {
      it(`should properly register ${name} entity`, () => {
        expect(entity).toBeDefined();
        // Verify the entity is registered with TypeORM
        const metadata = getMetadataArgsStorage();
        const entityMetadata = metadata.tables.find(table => {
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

      imports.forEach(imp => {
        expect(typeof imp).toBe('object');
        expect(imp).toHaveProperty('module');
        expect(imp).toHaveProperty('providers');
        expect(Array.isArray(imp.providers)).toBe(true);
      });
    });

    it('should have valid configurations for all registered entities', () => {
      const imports = Reflect.getMetadata('imports', EntitiesModule);
      imports.forEach(imp => {
        const config = imp.providers.find(p => p.provide === 'CONFIG').useValue;
        expect(config).toBeDefined();
        expect(config.entity).toBeDefined();
      });
    });
  });
});