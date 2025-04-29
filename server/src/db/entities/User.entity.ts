import { Entity, OneToMany } from "typeorm";
import { User as BaseUser } from "@shared/entities/User.entity";
import { Grade } from "src/db/entities/Grade.entity";
import { KlassType } from "src/db/entities/KlassType.entity";
import { Klass } from "src/db/entities/Klass.entity";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { Lesson } from "src/db/entities/Lesson.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { Student } from "src/db/entities/Student.entity";
import { Teacher } from "src/db/entities/Teacher.entity";

@Entity("users")
export class User extends BaseUser {
    // @OneToMany(() => Grade, (grades) => grades.user)
    grades: Grade[];
  
    // @OneToMany(() => KlassType, (klassTypes) => klassTypes.user)
    klassTypes: KlassType[];
  
    // @OneToMany(() => KnownAbsence, (knownAbsences) => knownAbsences.user)
    knownAbsences: KnownAbsence[];
  
    // @OneToMany(() => Student, (students) => students.user)
    students: Student[];
  
    // @OneToMany(() => Teacher, (teachers) => teachers.user)
    teachers: Teacher[];
}