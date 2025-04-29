enum EnumJoinTypes {
    teachers = 'teacher',
    students = 'student',
    klasses = 'klass',
    lessons = 'lesson',
    klassTypes = 'klass_type'
}

const joinTableNames = {
    [EnumJoinTypes.teachers]: 'teachers',
    [EnumJoinTypes.students]: 'students',
    [EnumJoinTypes.klasses]: 'klasses',
    [EnumJoinTypes.lessons]: 'lessons',
    [EnumJoinTypes.klassTypes]: 'klass_types'
}

const joinReference = {
    [EnumJoinTypes.teachers]: 'teacherReferenceId',
    [EnumJoinTypes.students]: 'studentReferenceId',
    [EnumJoinTypes.klasses]: 'klassReferenceId',
    [EnumJoinTypes.lessons]: 'lessonReferenceId',
    [EnumJoinTypes.klassTypes]: 'klassTypeReferenceId'
}

function getUpdateTableSql(tableName: string, joinType: EnumJoinTypes) {
    const joinTableName = joinTableNames[joinType];
    const joinTableAlias = `${joinType}s`;
    const joinTableReferenceId = joinReference[joinType];
    const joinTableFields = [
        `${joinTableAlias}.user_id = ${tableName}.user_id`,
    ];

    if (joinType !== EnumJoinTypes.klassTypes && joinType !== EnumJoinTypes.teachers && joinType !== EnumJoinTypes.students) {
        joinTableFields.push(`${joinTableAlias}.year = ${tableName}.year`);
    }
    if (joinType === EnumJoinTypes.teachers) {
        joinTableFields.push(`${joinTableAlias}.tz = ${tableName}.teacher_id`);
    } else if (joinType === EnumJoinTypes.students) {
        joinTableFields.push(`${joinTableAlias}.tz = ${tableName}.student_tz`);
    } else {
        joinTableFields.push(`${joinTableAlias}.key = ${tableName}.${joinType}_id`);
    }

    return `
        update ${tableName}
            join ${joinTableName} ${joinTableAlias} on (
                ${joinTableFields.join(' AND ')}
            )
        set ${joinTableReferenceId} = ${joinTableAlias}.id
        where ${joinTableReferenceId} is null
    `;
}

function getSql() {
    return [
        getUpdateTableSql('student_klasses', EnumJoinTypes.students),
        getUpdateTableSql('student_klasses', EnumJoinTypes.klasses),
        getUpdateTableSql('lessons', EnumJoinTypes.teachers),
        getUpdateTableSql('known_absences', EnumJoinTypes.students),
        getUpdateTableSql('klass_types', EnumJoinTypes.teachers),
        getUpdateTableSql('klasses', EnumJoinTypes.klassTypes),
        getUpdateTableSql('klasses', EnumJoinTypes.teachers),
        getUpdateTableSql('grades', EnumJoinTypes.students),
        getUpdateTableSql('grades', EnumJoinTypes.teachers),
        getUpdateTableSql('grades', EnumJoinTypes.klasses),
        getUpdateTableSql('grades', EnumJoinTypes.lessons),
        getUpdateTableSql('att_reports', EnumJoinTypes.students),
        getUpdateTableSql('att_reports', EnumJoinTypes.teachers),
        getUpdateTableSql('att_reports', EnumJoinTypes.klasses),
        getUpdateTableSql('att_reports', EnumJoinTypes.lessons),
    ].join('\r\n;\r\n');
}

// script result:
/*

        update student_klasses
            join students students on (
                students.user_id = student_klasses.user_id AND students.tz = student_klasses.student_tz
            )
        set studentReferenceId = students.id
        where studentReferenceId is null
    
;

        update student_klasses
            join klasses klasss on (
                klasss.user_id = student_klasses.user_id AND klasss.year = student_klasses.year AND klasss.key = student_klasses.klass_id
            )
        set klassReferenceId = klasss.id
        where klassReferenceId is null
    
;

        update lessons
            join teachers teachers on (
                teachers.user_id = lessons.user_id AND teachers.tz = lessons.teacher_id
            )
        set teacherReferenceId = teachers.id
        where teacherReferenceId is null
    
;

        update known_absences
            join students students on (
                students.user_id = known_absences.user_id AND students.tz = known_absences.student_tz
            )
        set studentReferenceId = students.id
        where studentReferenceId is null
    
;

        update klass_types
            join teachers teachers on (
                teachers.user_id = klass_types.user_id AND teachers.tz = klass_types.teacher_id
            )
        set teacherReferenceId = teachers.id
        where teacherReferenceId is null
    
;

        update klasses
            join klass_types klass_types on (
                klass_types.user_id = klasses.user_id AND klass_types.key = klasses.klass_type_id
            )
        set klassTypeReferenceId = klass_types.id
        where klassTypeReferenceId is null
    
;

        update klasses
            join teachers teachers on (
                teachers.user_id = klasses.user_id AND teachers.tz = klasses.teacher_id
            )
        set teacherReferenceId = teachers.id
        where teacherReferenceId is null
    
;

        update grades
            join students students on (
                students.user_id = grades.user_id AND students.tz = grades.student_tz
            )
        set studentReferenceId = students.id
        where studentReferenceId is null
    
;

        update grades
            join teachers teachers on (
                teachers.user_id = grades.user_id AND teachers.tz = grades.teacher_id
            )
        set teacherReferenceId = teachers.id
        where teacherReferenceId is null
    
;

        update grades
            join klasses klasss on (
                klasss.user_id = grades.user_id AND klasss.year = grades.year AND klasss.key = grades.klass_id
            )
        set klassReferenceId = klasss.id
        where klassReferenceId is null
    
;

        update grades
            join lessons lessons on (
                lessons.user_id = grades.user_id AND lessons.year = grades.year AND lessons.key = grades.lesson_id
            )
        set lessonReferenceId = lessons.id
        where lessonReferenceId is null
    
;

        update att_reports
            join students students on (
                students.user_id = att_reports.user_id AND students.year = att_reports.year AND students.tz = att_reports.student_tz
            )
        set studentReferenceId = students.id
        where studentReferenceId is null
    
;

        update att_reports
            join teachers teachers on (
                teachers.user_id = att_reports.user_id AND teachers.tz = att_reports.teacher_id
            )
        set teacherReferenceId = teachers.id
        where teacherReferenceId is null
    
;

        update att_reports
            join klasses klasss on (
                klasss.user_id = att_reports.user_id AND klasss.year = att_reports.year AND klasss.key = att_reports.klass_id
            )
        set klassReferenceId = klasss.id
        where klassReferenceId is null
    
;

        update att_reports
            join lessons lessons on (
                lessons.user_id = att_reports.user_id AND lessons.year = att_reports.year AND lessons.key = att_reports.lesson_id
            )
        set lessonReferenceId = lessons.id
        where lessonReferenceId is null
    
*/