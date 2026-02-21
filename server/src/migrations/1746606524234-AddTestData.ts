import { MigrationInterface, QueryRunner } from 'typeorm';

// Pre-computed bcrypt hashes (cost factor 10) for test passwords
// manager: 'password123', teachers: 'teacher1' through 'teacher5'
const HASHED_MANAGER_PASS = '$2b$10$1T6TnawO/oZXBzV9sDB3ze0sQAqpsIC7taUuvHTS9VO3DZ9bCXhde';
const HASHED_TEACHER_PASSES = [
  '$2b$10$e/P3SKXGAVySN5i4sG8JauPgl.ELwg.LewpRumSUbWHEVCG0rjdWu', // teacher1
  '$2b$10$XquSUs76T9xyn/LaQlkjZ.EQOfsXQcC1iwgIc/GSgkRPqOlf3P5zu', // teacher2
  '$2b$10$4Cyzj8PPte0B4oXyzfamAebMb7G76f3OhXudklQhjPYoTlQDwwIo6', // teacher3
  '$2b$10$xc0dXmbmbDM73svlLpiQS.ywBrJiBn63DtgEeEi34WfuM3TvCu3om', // teacher4
  '$2b$10$zumEygxL6h3LWXobi/XRoeFWmpD4u7oLPdgJTM3Ds90QpNb2uPAOe', // teacher5
];

export class AddTestData1746606524234 implements MigrationInterface {
  private readonly TIMESTAMP = '2025-05-05 05:05:05';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create manager user
    await queryRunner.query(
      `INSERT INTO \`users\` (\`name\`, \`email\`, \`password\`, \`active\`, \`created_at\`, \`updated_at\`, \`permissions\`, \`isPaid\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['מנהל מערכת', 'event@wolf.org.il', HASHED_MANAGER_PASS, 1, this.TIMESTAMP, this.TIMESTAMP, '{"manager":true}', 1],
    );
    const [{ managerId }] = await queryRunner.query('SELECT LAST_INSERT_ID() as managerId');

    // 2. Create teacher users
    const teacherUserData = [
      { name: 'רבקה כהן', email: 'rivka@example.com', pass: HASHED_TEACHER_PASSES[0] },
      { name: 'שרה לוי', email: 'sarah@example.com', pass: HASHED_TEACHER_PASSES[1] },
      { name: 'אסתר גולדברג', email: 'esther@example.com', pass: HASHED_TEACHER_PASSES[2] },
      { name: 'מרים אברהמי', email: 'miriam@example.com', pass: HASHED_TEACHER_PASSES[3] },
      { name: 'חנה פרידמן', email: 'chana@example.com', pass: HASHED_TEACHER_PASSES[4] },
    ];
    const teacherUserIds: number[] = [];
    for (const data of teacherUserData) {
      await queryRunner.query(
        `INSERT INTO \`users\` (\`name\`, \`email\`, \`password\`, \`active\`, \`created_at\`, \`updated_at\`, \`effective_id\`, \`permissions\`, \`isPaid\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.name, data.email, data.pass, 1, this.TIMESTAMP, this.TIMESTAMP, managerId, '{"teacher":true}', 1],
      );
      const [{ uid }] = await queryRunner.query('SELECT LAST_INSERT_ID() as uid');
      teacherUserIds.push(uid);
    }

    // 3. Create event types (no year column at this migration point)
    const eventTypeData = [
      { name: 'חתונת אח או אחות', key: 1, description: 'אירוע חתונה של אח או אחות' },
      { name: 'בר מצווה אח', key: 2, description: 'אירוע בר מצווה של אח' },
      { name: 'חתונת דוד או דודה', key: 3, description: 'אירוע חתונה של דוד או דודה' },
    ];
    const eventTypeIds: number[] = [];
    for (const data of eventTypeData) {
      await queryRunner.query(
        `INSERT INTO \`event_types\` (\`user_id\`, \`name\`, \`key\`, \`description\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [managerId, data.name, data.key, data.description, this.TIMESTAMP, this.TIMESTAMP],
      );
      const [{ etid }] = await queryRunner.query('SELECT LAST_INSERT_ID() as etid');
      eventTypeIds.push(etid);
    }

    // 4. Create level types (no year column at this migration point)
    const levelTypeData = [
      { name: 'דרגה א', key: 1, description: 'רמה בסיסית' },
      { name: 'דרגה ב', key: 2, description: 'רמה בינונית' },
      { name: 'דרגה ג', key: 3, description: 'רמה מתקדמת' },
    ];
    const levelTypeIds: number[] = [];
    for (const data of levelTypeData) {
      await queryRunner.query(
        `INSERT INTO \`level_types\` (\`user_id\`, \`name\`, \`key\`, \`description\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [managerId, data.name, data.key, data.description, this.TIMESTAMP, this.TIMESTAMP],
      );
      const [{ ltid }] = await queryRunner.query('SELECT LAST_INSERT_ID() as ltid');
      levelTypeIds.push(ltid);
    }

    // 5. Create classes
    const classData = [
      { name: 'י"א 1', gradeLevel: 'יא', key: 1 },
      { name: 'י"א 2', gradeLevel: 'יא', key: 2 },
      { name: 'י"ב 1', gradeLevel: 'יב', key: 3 },
      { name: "ט' 3", gradeLevel: 'ט', key: 4 },
      { name: "י' 2", gradeLevel: 'י', key: 5 },
    ];
    for (const data of classData) {
      await queryRunner.query(
        `INSERT INTO \`classes\` (\`user_id\`, \`name\`, \`gradeLevel\`, \`key\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [managerId, data.name, data.gradeLevel, data.key, this.TIMESTAMP, this.TIMESTAMP],
      );
    }

    // 6. Create teachers
    const teacherData = [
      { name: 'רבקה כהן', tz: '123456789' },
      { name: 'שרה לוי', tz: '234567890' },
      { name: 'אסתר גולדברג', tz: '345678901' },
      { name: 'מרים אברהמי', tz: '456789012' },
      { name: 'חנה פרידמן', tz: '567890123' },
    ];
    const teacherIds: number[] = [];
    for (let i = 0; i < teacherData.length; i++) {
      const data = teacherData[i];
      await queryRunner.query(
        `INSERT INTO \`teachers\` (\`user_id\`, \`own_user_id\`, \`name\`, \`tz\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [managerId, teacherUserIds[i], data.name, data.tz, this.TIMESTAMP, this.TIMESTAMP],
      );
      const [{ tid }] = await queryRunner.query('SELECT LAST_INSERT_ID() as tid');
      teacherIds.push(tid);
    }

    // 7. Create students (schema at this point: id, user_id, tz, class_id, classReferenceId,
    //    firstName NOT NULL, lastName NOT NULL, name, address, motherName, motherContact,
    //    fatherName, fatherContact, createdAt, updatedAt)
    const studentData = [
      { firstName: 'רחל', lastName: 'אדלר', tz: '111222333' },
      { firstName: 'חיה', lastName: 'גרינבלט', tz: '222333444' },
      { firstName: 'נועה', lastName: 'הירש', tz: '333444555' },
      { firstName: 'שושנה', lastName: 'כץ', tz: '444555666' },
      { firstName: 'לאה', lastName: 'שטרן', tz: '555666777' },
    ];
    const studentIds: number[] = [];
    for (const data of studentData) {
      await queryRunner.query(
        `INSERT INTO \`students\` (\`user_id\`, \`tz\`, \`firstName\`, \`lastName\`, \`name\`, \`address\`,
          \`motherName\`, \`motherContact\`, \`fatherName\`, \`fatherContact\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          managerId, data.tz, data.firstName, data.lastName,
          `${data.firstName} ${data.lastName}`,
          'כתובת לדוגמה', 'שם האם', '050-1111111', 'שם האב', '050-2222222',
          this.TIMESTAMP, this.TIMESTAMP,
        ],
      );
      const [{ sid }] = await queryRunner.query('SELECT LAST_INSERT_ID() as sid');
      studentIds.push(sid);
    }

    // 8. Create gifts (no year column at this migration point)
    const giftData = [
      { name: 'ספר לימוד', key: 1, description: 'ספר לימוד לתלמידות' },
      { name: 'תיק לימודים', key: 2, description: 'תיק לבית ספר' },
      { name: 'כרטיס מתנה', key: 3, description: 'כרטיס מתנה לחנות ספרים' },
      { name: 'ערכת לימוד', key: 4, description: 'ערכת לימוד מלאה' },
      { name: 'מחברת מיוחדת', key: 5, description: 'מחברת איכותית' },
    ];
    const giftIds: number[] = [];
    for (const data of giftData) {
      await queryRunner.query(
        `INSERT INTO \`gifts\` (\`user_id\`, \`name\`, \`key\`, \`description\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [managerId, data.name, data.key, data.description, this.TIMESTAMP, this.TIMESTAMP],
      );
      const [{ gid }] = await queryRunner.query('SELECT LAST_INSERT_ID() as gid');
      giftIds.push(gid);
    }

    // 9. Create events (schema at this point: no year, no eventHebrewDate, etc.)
    const eventData = [
      { name: 'חתונת אחות של רחל אדלר', description: 'אירוע משפחתי חשוב', eventDate: '2025-06-15 00:00:00', etIdx: 0, tIdx: 0, sIdx: 0, ltIdx: 0 },
      { name: 'בר מצווה של אח של חיה גרינבלט', description: 'אירוע משפחתי', eventDate: '2025-06-20 00:00:00', etIdx: 1, tIdx: 1, sIdx: 1, ltIdx: 1 },
      { name: 'חתונת דודה של נועה הירש', description: 'אירוע משפחתי', eventDate: '2025-07-10 00:00:00', etIdx: 2, tIdx: 2, sIdx: 2, ltIdx: 2 },
      { name: 'בר מצווה של אח של שושנה כץ', description: 'אירוע משפחתי', eventDate: '2025-07-15 00:00:00', etIdx: 1, tIdx: 3, sIdx: 3, ltIdx: 0 },
      { name: 'חתונת אח של לאה שטרן', description: 'אירוע משפחתי', eventDate: '2025-08-01 00:00:00', etIdx: 0, tIdx: 4, sIdx: 4, ltIdx: 1 },
    ];
    const eventIds: number[] = [];
    for (const data of eventData) {
      await queryRunner.query(
        `INSERT INTO \`events\` (\`user_id\`, \`name\`, \`description\`, \`eventDate\`, \`completed\`,
          \`eventTypeReferenceId\`, \`teacherReferenceId\`, \`studentReferenceId\`, \`levelTypeReferenceId\`,
          \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          managerId, data.name, data.description, data.eventDate, 0,
          eventTypeIds[data.etIdx], teacherIds[data.tIdx], studentIds[data.sIdx], levelTypeIds[data.ltIdx],
          this.TIMESTAMP, this.TIMESTAMP,
        ],
      );
      const [{ eid }] = await queryRunner.query('SELECT LAST_INSERT_ID() as eid');
      eventIds.push(eid);
    }

    // 10. Create event notes
    const noteData = [
      'התלמידה יוצאת מוקדם בשעה 12:00 ותחזור למחרת',
      'המשפחה מארגנת הסעה מיוחדת, איסוף מבית הספר בשעה 16:30',
      'האירוע מתקיים בירושלים, הורי התלמידה ידאגו להסעה',
      'התלמידה תיעדר מיום לימודים שלם, אישור מיוחד מהמנהלת',
      'שעת חזרה משוערת - 23:00, הורי התלמידה יאספו אותה מבית הספר',
    ];
    for (let i = 0; i < eventIds.length; i++) {
      await queryRunner.query(
        `INSERT INTO \`event_notes\` (\`user_id\`, \`eventReferenceId\`, \`noteText\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?)`,
        [managerId, eventIds[i], noteData[i], this.TIMESTAMP, this.TIMESTAMP],
      );
    }

    // 11. Create event gifts (deterministic assignment)
    const eventGiftAssignments = [
      [0, 1],   // Event 0: gifts 0, 1
      [1, 2],   // Event 1: gifts 1, 2
      [2],      // Event 2: gift 2
      [3, 4],   // Event 3: gifts 3, 4
      [4, 0],   // Event 4: gifts 4, 0
    ];
    for (let i = 0; i < eventIds.length; i++) {
      for (const giftIdx of eventGiftAssignments[i]) {
        await queryRunner.query(
          `INSERT INTO \`event_gifts\` (\`user_id\`, \`eventReferenceId\`, \`giftReferenceId\`, \`createdAt\`, \`updatedAt\`)
           VALUES (?, ?, ?, ?, ?)`,
          [managerId, eventIds[i], giftIds[giftIdx], this.TIMESTAMP, this.TIMESTAMP],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ts = this.TIMESTAMP;
    await queryRunner.query(`DELETE FROM \`event_notes\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`event_gifts\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`events\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`gifts\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`students\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`teachers\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`classes\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`level_types\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`event_types\` WHERE \`createdAt\` = '${ts}'`);
    await queryRunner.query(`DELETE FROM \`users\` WHERE \`created_at\` = '${ts}'`);
  }
}
