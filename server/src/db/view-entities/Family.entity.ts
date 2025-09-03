import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { Student } from '../entities/Student.entity';
import { getConcatExpression } from '@shared/utils/entity/column-types.util';

@ViewEntity({
  name: 'families',
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select(
        getConcatExpression(
          'students.userId',
          "'_'",
          'COALESCE(students.fatherName, "")',
          "'_'",
          'COALESCE(students.motherName, "")',
          "'_'",
          'COALESCE(students.motherPreviousName, "")',
          "'_'",
          'COALESCE(students.fatherContact, "")',
          "'_'",
          'COALESCE(students.motherContact, "")'
        ),
        'id'
      )
      .addSelect('students.userId', 'userId')
      .addSelect(
        // Extract family name from last name of students (assuming it's the family name)
        'SUBSTRING_INDEX(MIN(students.name), \' \', -1)',
        'familyName'
      )
      .addSelect(
        // Get father name from first student (MIN by id ensures consistent selection)
        'MIN(students.fatherName)',
        'fatherName'
      )
      .addSelect(
        // Get mother name from first student
        'MIN(students.motherName)',
        'motherName'
      )
      .addSelect(
        // Get mother previous name from first student
        'MIN(students.motherPreviousName)',
        'motherPreviousName'
      )
      .addSelect(
        // Get father contact from first student
        'MIN(students.fatherContact)',
        'fatherContact'
      )
      .addSelect(
        // Get mother contact from first student
        'MIN(students.motherContact)',
        'motherContact'
      )
      .addSelect(
        // Count number of daughters in family
        'COUNT(students.id)',
        'numberOfDaughters'
      )
      .addSelect(
        // Get representative student ID (first student by ID)
        'MIN(students.id)',
        'representativeStudentId'
      )
      .from(Student, 'students')
      .groupBy('students.userId')
      .addGroupBy('students.fatherName')
      .addGroupBy('students.motherName')
      .addGroupBy('students.motherPreviousName')
      .addGroupBy('students.fatherContact')
      .addGroupBy('students.motherContact'),
})
export class Family {
  @PrimaryColumn()
  id: string;

  @ViewColumn()
  userId: number;

  @ViewColumn()
  familyName: string;

  @ViewColumn()
  fatherName: string;

  @ViewColumn()
  motherName: string;

  @ViewColumn()
  motherPreviousName: string;

  @ViewColumn()
  fatherContact: string;

  @ViewColumn()
  motherContact: string;

  @ViewColumn()
  numberOfDaughters: number;

  @ViewColumn()
  representativeStudentId: number;
}
