import { Entity, OneToMany } from 'typeorm';
import { User as BaseUser } from '@shared/entities/User.entity';
import { Student } from 'src/db/entities/Student.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';

@Entity('users')
export class User extends BaseUser {
  // @OneToMany(() => Student, (students) => students.user)
  students: Student[];

  // @OneToMany(() => Teacher, (teachers) => teachers.user)
  teachers: Teacher[];
}
