import { MigrationInterface, QueryRunner, EntityManager } from 'typeorm';
import { User } from 'src/db/entities/User.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { LevelType } from 'src/db/entities/LevelType.entity';
import { Class } from 'src/db/entities/Class.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { Student } from 'src/db/entities/Student.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { Event } from 'src/db/entities/Event.entity';
import { EventNote } from 'src/db/entities/EventNote.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';

export class AddTestData1746606524234 implements MigrationInterface {
  private readonly TIMESTAMP = new Date('2025-05-05T05:05:05.000Z');

  public async up(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;

    // 1. Create manager user with email event@wolf.org.il (empty permissions)
    const managerUser = await this.createManagerUser(manager);

    // 2. Create event types
    const eventTypes = await this.createEventTypes(manager, managerUser);

    // 3. Create level types
    const levelTypes = await this.createLevelTypes(manager, managerUser);

    // 4. Create classes
    const classes = await this.createClasses(manager, managerUser);

    // 5. Create teachers with user accounts
    const teachers = await this.createTeachers(manager, managerUser);

    // 6. Create students
    const students = await this.createStudents(manager, managerUser, classes);

    // 7. Create gifts
    const gifts = await this.createGifts(manager, managerUser);

    // 8. Create events
    const events = await this.createEvents(manager, managerUser, eventTypes, teachers, students, levelTypes);

    // 9. Create event notes
    await this.createEventNotes(manager, events);

    // 10. Create event gifts
    await this.createEventGifts(manager, events, gifts);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all data created with our timestamp
    // Delete in reverse order to avoid foreign key constraints
    const timestamp = this.TIMESTAMP.toISOString();

    await queryRunner.query(`DELETE FROM event_notes WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM event_gifts WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM events WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM gifts WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM students WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM teachers WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM classes WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM level_types WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM event_types WHERE createdAt = '${timestamp}'`);
    await queryRunner.query(`DELETE FROM users WHERE createdAt = '${timestamp}'`);
  }

  private async createManagerUser(manager: EntityManager): Promise<User> {
    const user = manager.create(User, {
      name: 'מנהל מערכת',
      email: 'event@wolf.org.il',
      password: 'password123',
      active: 1,
      permissions: { manager: true },
      isPaid: true,
      createdAt: this.TIMESTAMP,
      updatedAt: this.TIMESTAMP,
    });

    return await manager.save(user);
  }

  private async createEventTypes(manager: EntityManager, user: User): Promise<EventType[]> {
    const eventTypes = [
      manager.create(EventType, {
        userId: user.id,
        name: 'חתונת אח או אחות',
        description: 'אירוע חתונה של אח או אחות',
        key: 1,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(EventType, {
        userId: user.id,
        name: 'בר מצווה אח',
        description: 'אירוע בר מצווה של אח',
        key: 2,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(EventType, {
        userId: user.id,
        name: 'חתונת דוד או דודה',
        description: 'אירוע חתונה של דוד או דודה',
        key: 3,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
    ];

    return await manager.save(eventTypes);
  }

  private async createLevelTypes(manager: EntityManager, user: User): Promise<LevelType[]> {
    const levelTypes = [
      manager.create(LevelType, {
        userId: user.id,
        name: 'דרגה א',
        key: 1,
        description: 'רמה בסיסית',
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(LevelType, {
        userId: user.id,
        name: 'דרגה ב',
        key: 2,
        description: 'רמה בינונית',
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(LevelType, {
        userId: user.id,
        name: 'דרגה ג',
        key: 3,
        description: 'רמה מתקדמת',
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
    ];

    return await manager.save(levelTypes);
  }

  private async createClasses(manager: EntityManager, user: User): Promise<Class[]> {
    const classes = [
      manager.create(Class, {
        userId: user.id,
        name: 'י"א 1',
        gradeLevel: 'יא',
        key: 1,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(Class, {
        userId: user.id,
        name: 'י"א 2',
        gradeLevel: 'יא',
        key: 2,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(Class, {
        userId: user.id,
        name: 'י"ב 1',
        gradeLevel: 'יב',
        key: 3,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(Class, {
        userId: user.id,
        name: "ט' 3",
        gradeLevel: 'ט',
        key: 4,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
      manager.create(Class, {
        userId: user.id,
        name: "י' 2",
        gradeLevel: 'י',
        key: 5,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      }),
    ];

    return await manager.save(classes);
  }

  private async createTeachers(manager: EntityManager, managerUser: User): Promise<Teacher[]> {
    // Create teacher users first (no password hashing as it's done automatically)
    const teacherUserData = [
      { name: 'רבקה כהן', email: 'rivka@example.com', password: 'teacher1' },
      { name: 'שרה לוי', email: 'sarah@example.com', password: 'teacher2' },
      {
        name: 'אסתר גולדברג',
        email: 'esther@example.com',
        password: 'teacher3',
      },
      {
        name: 'מרים אברהמי',
        email: 'miriam@example.com',
        password: 'teacher4',
      },
      { name: 'חנה פרידמן', email: 'chana@example.com', password: 'teacher5' },
    ];

    const teacherUsers = [];
    for (const data of teacherUserData) {
      const user = manager.create(User, {
        name: data.name,
        email: data.email,
        password: data.password,
        active: 1,
        effective_id: managerUser.id,
        permissions: { teacher: true },
        isPaid: true,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      });
      teacherUsers.push(await manager.save(user));
    }

    // Now create teachers
    const teacherData = [
      { firstName: 'רבקה', lastName: 'כהן', tz: '123456789' },
      { firstName: 'שרה', lastName: 'לוי', tz: '234567890' },
      { firstName: 'אסתר', lastName: 'גולדברג', tz: '345678901' },
      { firstName: 'מרים', lastName: 'אברהמי', tz: '456789012' },
      { firstName: 'חנה', lastName: 'פרידמן', tz: '567890123' },
    ];

    const teachers = [];
    for (let i = 0; i < teacherData.length; i++) {
      const data = teacherData[i];
      const teacher = manager.create(Teacher, {
        userId: managerUser.id,
        ownUserId: teacherUsers[i].id,
        name: `${data.firstName} ${data.lastName}`,
        tz: data.tz,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      });
      teachers.push(await manager.save(teacher));
    }

    return teachers;
  }

  private async createStudents(manager: EntityManager, user: User, classes: Class[]): Promise<Student[]> {
    const studentData = [
      { name: 'רחל אדלר', tz: '111222333', classId: 0 },
      { name: 'חיה גרינבלט', tz: '222333444', classId: 1 },
      { name: 'נועה הירש', tz: '333444555', classId: 2 },
      { name: 'שושנה כץ', tz: '444555666', classId: 3 },
      { name: 'לאה שטרן', tz: '555666777', classId: 4 },
    ];

    const students = [];
    for (const data of studentData) {
      const student = manager.create(Student, {
        userId: user.id,
        name: data.name,
        tz: data.tz,
        address: 'כתובת לדוגמה',
        motherName: 'שם האם',
        motherContact: '050-1111111',
        fatherName: 'שם האב',
        fatherContact: '050-2222222',
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      });
      students.push(await manager.save(student));
    }

    return students;
  }

  private async createGifts(manager: EntityManager, user: User): Promise<Gift[]> {
    const giftData = [
      { name: 'ספר לימוד', key: 1, description: 'ספר לימוד לתלמידות' },
      { name: 'תיק לימודים', key: 2, description: 'תיק לבית ספר' },
      { name: 'כרטיס מתנה', key: 3, description: 'כרטיס מתנה לחנות ספרים' },
      { name: 'ערכת לימוד', key: 4, description: 'ערכת לימוד מלאה' },
      { name: 'מחברת מיוחדת', key: 5, description: 'מחברת איכותית' },
    ];

    const gifts = [];
    for (const data of giftData) {
      const gift = manager.create(Gift, {
        userId: user.id,
        name: data.name,
        key: data.key,
        description: data.description,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      });
      gifts.push(await manager.save(gift));
    }

    return gifts;
  }

  private async createEvents(
    manager: EntityManager,
    user: User,
    eventTypes: EventType[],
    teachers: Teacher[],
    students: Student[],
    levelTypes: LevelType[],
  ): Promise<Event[]> {
    const eventData = [
      {
        name: 'חתונת אחות של רחל אדלר',
        description: 'אירוע משפחתי חשוב',
        eventDate: new Date('2025-06-15'),
        completed: false,
        eventTypeIndex: 0,
        teacherIndex: 0,
        studentIndex: 0,
        levelTypeIndex: 0,
      },
      {
        name: 'בר מצווה של אח של חיה גרינבלט',
        description: 'אירוע משפחתי',
        eventDate: new Date('2025-06-20'),
        completed: false,
        eventTypeIndex: 1,
        teacherIndex: 1,
        studentIndex: 1,
        levelTypeIndex: 1,
      },
      {
        name: 'חתונת דודה של נועה הירש',
        description: 'אירוע משפחתי',
        eventDate: new Date('2025-07-10'),
        completed: false,
        eventTypeIndex: 2,
        teacherIndex: 2,
        studentIndex: 2,
        levelTypeIndex: 2,
      },
      {
        name: 'בר מצווה של אח של שושנה כץ',
        description: 'אירוע משפחתי',
        eventDate: new Date('2025-07-15'),
        completed: false,
        eventTypeIndex: 1,
        teacherIndex: 3,
        studentIndex: 3,
        levelTypeIndex: 0,
      },
      {
        name: 'חתונת אח של לאה שטרן',
        description: 'אירוע משפחתי',
        eventDate: new Date('2025-08-01'),
        completed: false,
        eventTypeIndex: 0,
        teacherIndex: 4,
        studentIndex: 4,
        levelTypeIndex: 1,
      },
    ];

    const events = [];
    for (const data of eventData) {
      const event = manager.create(Event, {
        userId: user.id,
        name: data.name,
        description: data.description,
        eventDate: data.eventDate,
        completed: data.completed,
        eventTypeReferenceId: eventTypes[data.eventTypeIndex].id,
        teacherReferenceId: teachers[data.teacherIndex].id,
        studentReferenceId: students[data.studentIndex].id,
        levelTypeReferenceId: levelTypes[data.levelTypeIndex].id,
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      });
      events.push(await manager.save(event));
    }

    return events;
  }

  private async createEventNotes(manager: EntityManager, events: Event[]): Promise<void> {
    const noteData = [
      'התלמידה יוצאת מוקדם בשעה 12:00 ותחזור למחרת',
      'המשפחה מארגנת הסעה מיוחדת, איסוף מבית הספר בשעה 16:30',
      'האירוע מתקיים בירושלים, הורי התלמידה ידאגו להסעה',
      'התלמידה תיעדר מיום לימודים שלם, אישור מיוחד מהמנהלת',
      'שעת חזרה משוערת - 23:00, הורי התלמידה יאספו אותה מבית הספר',
    ];

    for (let i = 0; i < events.length; i++) {
      const note = manager.create(EventNote, {
        userId: events[i].userId,
        eventReferenceId: events[i].id,
        noteText: noteData[i],
        createdAt: this.TIMESTAMP,
        updatedAt: this.TIMESTAMP,
      });
      await manager.save(note);
    }
  }

  private async createEventGifts(manager: EntityManager, events: Event[], gifts: Gift[]): Promise<void> {
    for (const event of events) {
      const giftCount = Math.floor(Math.random() * 3) + 1; // Random number of gifts between 1 and 3
      const randomGifts = gifts.sort(() => 0.5 - Math.random()).slice(0, giftCount); // Randomly select gifts
      for (const gift of randomGifts) {
        const eventGift = manager.create(EventGift, {
          userId: event.userId,
          eventReferenceId: event.id,
          giftReferenceId: gift.id,
          createdAt: this.TIMESTAMP,
          updatedAt: this.TIMESTAMP,
        });
        await manager.save(eventGift);
      }
    }
  }
}
