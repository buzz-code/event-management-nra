import { Column, DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { Student } from '../entities/Student.entity';
import { Class } from '../entities/Class.entity';
import { StudentClass } from '../entities/StudentClass.entity';
import { getGroupConcatExpression, getConcatExpression } from '@shared/utils/entity/column-types.util';

@ViewEntity({
  name: 'student_by_year', // Explicitly naming the view
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select(getConcatExpression('student_class.studentReferenceId', "'_'", 'student_class.year'), 'id')
      .addSelect('student_class.studentReferenceId', 'studentReferenceId')
      .addSelect('student.tz', 'studentTz')
      .addSelect('student.name', 'studentName')
      .addSelect('student_class.year', 'year')
      // Aggregated class information
      .addSelect(getGroupConcatExpression('class.name', ', ', true), 'class_names')
      .addSelect(getGroupConcatExpression('class.id', ', ', true), 'class_reference_ids')
      .from(StudentClass, 'student_class')
      .leftJoin(Class, 'class', 'class.id = student_class.classReferenceId')
      .leftJoin(Student, 'student', 'student.id = student_class.studentReferenceId')
      // GROUP BY clause for all non-aggregated selected columns
      .groupBy('student_class.studentReferenceId')
      .addGroupBy('student_class.year'),
})
export class StudentByYear {
  @Column()
  id: string;

  @Column()
  studentReferenceId: number;

  @Column()
  studentTz: string;

  @Column()
  studentName: string;

  @Column()
  year: number;

  @Column('simple-array', { name: 'class_names' })
  classNames: string[];

  @Column('simple-array', { name: 'class_reference_ids' })
  classReferenceIds: number[];
}
