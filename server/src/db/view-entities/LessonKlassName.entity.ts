import { Column, DataSource, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "../entities/Klass.entity";
import { Lesson } from "../entities/Lesson.entity";

@ViewEntity("lesson_klass_name", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('lessons.id', 'id')
    .addSelect('lessons.user_id', 'user_id')
    .addSelect("GROUP_CONCAT(DISTINCT klasses.name SEPARATOR ', ')", 'name')
    .from(Lesson, 'lessons')
    .leftJoin(Klass, 'klasses', 'klasses.id = lessons.klassReferenceIds OR FIND_IN_SET(klasses.id, lessons.klassReferenceIds)')
    .groupBy('lessons.id')
})
export class LessonKlassName implements IHasUserId {
  @Column()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ name: 'name' })
  name: string;
}
