import { User } from 'src/db/entities/User.entity';
import { Event } from 'src/db/entities/Event.entity';
import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { DataToExcelReportGenerator, IDataToExcelReportGenerator } from '@shared/utils/report/data-to-excel.generator';
import { IHeader } from '@shared/utils/exporter/types';
import { getISODateFormatter } from '@shared/utils/formatting/formatter.util';
import { getHeaderFormatters, getHeaderNames } from '@shared/utils/exporter/exporter.util';
import { In } from 'typeorm';

export interface EventExportParams {
  userId: number;
  ids: string; // comma-separated event IDs
}

export interface EventExportData extends IDataToExcelReportGenerator {
  fileTitle: string;
  user: User;
  events: Event[];
}

const getReportData: IGetReportDataFunction = async (params: EventExportParams, dataSource): Promise<EventExportData> => {
  const eventIds = params.ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

  const [user, events] = await Promise.all([
    dataSource.getRepository(User).findOneBy({ id: params.userId }),
    dataSource.getRepository(Event).find({
      where: eventIds.length === 1 ? { id: eventIds[0] } : { id: In(eventIds) },
      relations: {
        eventType: true,
        teacher: true,
        student: {
          familyStatus: true,
          family: true,
        },
        studentClass: true,
        levelType: true,
        notes: true,
        eventGifts: true,
      },
      order: {
        student: {
          familyReferenceId: 'ASC'
        }
      }
    }),
  ]);

  const headers: IHeader[] = [
    { value: 'id', label: 'מזהה', readOnly: true },
    { value: 'teacher.tz', label: 'תז מורה' },
    { value: 'teacher.name', label: 'שם מורה', readOnly: true },
    { value: 'student.tz', label: 'תז תלמיד' },
    { value: 'student.name', label: 'שם תלמידה', readOnly: true },
    { value: getISODateFormatter('eventDate'), label: 'תאריך אירוע' },
    { value: 'eventHebrewDate', label: 'תאריך עברי', readOnly: true },
    { value: 'eventType.key', label: 'מפתח סוג אירוע' },
    { value: 'eventType.name', label: 'סוג אירוע', readOnly: true },
    { value: 'studentClass.name', label: 'שם כיתה', readOnly: true },
    { value: 'student.address', label: 'כתובת', readOnly: true },
    { value: 'student.motherName', label: 'שם האם', readOnly: true },
    { value: 'student.motherContact', label: 'טלפון האם', readOnly: true },
    { value: 'student.fatherName', label: 'שם האב', readOnly: true },
    { value: 'student.fatherContact', label: 'טלפון האב', readOnly: true },
    { value: 'student.motherPreviousName', label: 'שם משפחה קודם של האם', readOnly: true },
    { value: 'student.familyStatus.name', label: 'מצב משפחתי', readOnly: true },
    { value: 'student.family.numberOfDaughters', label: 'מספר בנות במשפחה', readOnly: true },
    { value: (row: any) => row.notes?.map((note: any) => note.noteText).join('\r\n') || '', label: 'הערות', readOnly: true },
    { value: (_) => '', label: 'הערה חדשה' },
  ];

  const headerRow = getHeaderNames(headers);

  const formatters = getHeaderFormatters(headers);
  const formattedData = events.map(event => formatters.map(func => func(event)));

  return {
    fileTitle: 'ייצוא אירועים',
    headerRow,
    formattedData,
    sheetName: 'אירועים',
    user,
    events,
  };
};

const getReportName = (data: EventExportData) => `${data.fileTitle} - ${data.events.length} אירועים`;

const generator = new DataToExcelReportGenerator(getReportName, getReportData);

export default generator;
