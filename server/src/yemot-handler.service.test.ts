import { YemotScenarioBuilder, YemotScenarioRunner, useFakeDateOnly } from '@shared/utils/yemot/testing';
import { YemotHandlerService } from './yemot-handler.service';

describe('YemotHandlerService — event-management-nra', () => {
  const runner = new YemotScenarioRunner(YemotHandlerService as any);
  const celebrationsRunner = new YemotScenarioRunner(YemotHandlerService as any, '999999');
  const tatnikitRunner = new YemotScenarioRunner(YemotHandlerService as any, '4451114');

  beforeEach(() => useFakeDateOnly());
  afterEach(() => jest.useRealTimers());

  const baseUser = { id: 1, phoneNumber: '099999999', name: 'Test User', effective_id: null };
  const baseStudent = { id: 100, userId: 1, tz: '123456789', name: 'Test Student' };
  const eventType = [{ id: 1, userId: 1, key: 1, name: 'Birthday' }];
  const gift = [{ id: 1, userId: 1, key: 1, name: 'Book' }];

  const baseTexts = [
    { userId: 0, name: 'STUDENT.TZ_PROMPT', description: '', value: 'Enter student ID' },
    { userId: 0, name: 'STUDENT.NOT_FOUND', description: '', value: 'Student not found, try again' },
    { userId: 0, name: 'GENERAL.WELCOME', description: '', value: 'Welcome {name}' },
    { userId: 0, name: 'GENERAL.MAIN_MENU', description: '', value: 'Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song' },
    { userId: 0, name: 'GENERAL.INVALID_INPUT', description: '', value: 'Invalid input' },
    { userId: 0, name: 'GENERAL.GOODBYE', description: '', value: 'Goodbye' },
    { userId: 0, name: 'GENERAL.SONG_MESSAGE', description: '', value: 'Song playing' },
    { userId: 0, name: 'GENERAL.YES', description: '', value: 'Yes' },
    { userId: 0, name: 'GENERAL.NO', description: '', value: 'No' },
    { userId: 0, name: 'EVENT.TYPE_SELECTION', description: '', value: 'Select event type' },
    { userId: 0, name: 'EVENT.CONFIRM_TYPE', description: '', value: 'Confirm {name}?' },
    { userId: 0, name: 'EVENT.GIFT_SELECTION', description: '', value: 'Select gift' },
    { userId: 0, name: 'EVENT.ADDITIONAL_GIFT_SELECTION', description: '', value: 'Select another gift' },
    { userId: 0, name: 'EVENT.SELECT_ANOTHER_GIFT', description: '', value: 'Another gift?' },
    { userId: 0, name: 'EVENT.CONFIRM_GIFTS', description: '', value: 'Confirm gifts: {gifts} ({count})?' },
    { userId: 0, name: 'EVENT.SAVE_SUCCESS', description: '', value: 'Event saved' },
    { userId: 0, name: 'EVENT.GIFTS_ADDED', description: '', value: 'Gifts added: {count}' },
    { userId: 0, name: 'DATE.DAY_SELECTION', description: '', value: 'Enter day' },
    { userId: 0, name: 'DATE.MONTH_SELECTION', description: '', value: 'Select month' },
    { userId: 0, name: 'DATE.CONFIRM_DATE', description: '', value: 'Confirm date: {date}?' },
    { userId: 0, name: 'FULFILLMENT.START_MESSAGE', description: '', value: 'Fulfillment for {name}' },
    { userId: 0, name: 'FULFILLMENT.NO_EVENT_FOUND', description: '', value: 'No event found' },
    { userId: 0, name: 'FULFILLMENT.GOODBYE', description: '', value: 'Goodbye' },
    { userId: 0, name: 'FULFILLMENT.DATA_SAVED', description: '', value: 'Data saved' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_1', description: '', value: 'Question 1' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_2', description: '', value: 'Question 2' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_3', description: '', value: 'Question 3' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_4', description: '', value: 'Question 4' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_5', description: '', value: 'Question 5' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_6', description: '', value: 'Question 6' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_7', description: '', value: 'Question 7' },
    { userId: 0, name: 'FULFILLMENT.QUESTION_8', description: '', value: 'Question 8' },
    { userId: 0, name: 'FULFILLMENT.INVALID_LEVEL', description: '', value: 'Invalid level' },
    { userId: 0, name: 'LOTTERY.WELCOME', description: '', value: 'Lottery for {name}' },
    { userId: 0, name: 'LOTTERY.NO_EVENT_FOUND', description: '', value: 'No event for lottery' },
    { userId: 0, name: 'LOTTERY.GOODBYE', description: '', value: 'Goodbye' },
    { userId: 0, name: 'LOTTERY.TRACK_SELECTION', description: '', value: 'Select track 1-3' },
    { userId: 0, name: 'LOTTERY.CONFIRM_TRACK', description: '', value: 'Confirm track {track}?' },
    { userId: 0, name: 'LOTTERY.INVALID_TRACK', description: '', value: 'Invalid track' },
    { userId: 0, name: 'LOTTERY.ENTRY_SUCCESS', description: '', value: 'Track {track} saved' },
    { userId: 0, name: 'TATNIKIT.WELCOME', description: '', value: 'Welcome tatnikit {name}' },
    { userId: 0, name: 'TATNIKIT.MENU', description: '', value: 'Press 1 for self, 2 for class' },
    { userId: 0, name: 'TATNIKIT.ENTER_YOUR_TZ', description: '', value: 'Enter your TZ' },
    { userId: 0, name: 'TATNIKIT.NO_CLASS_FOUND', description: '', value: 'No class found' },
    { userId: 0, name: 'TATNIKIT.ENTER_STUDENT_TZ', description: '', value: 'Enter student TZ' },
    { userId: 0, name: 'TATNIKIT.STUDENT_NOT_IN_CLASS', description: '', value: 'Student not in class' },
    { userId: 0, name: 'TATNIKIT.STUDENT_SELECTED', description: '', value: 'Student: {name}' },
    { userId: 0, name: 'TATNIKIT.ENTER_MONTH', description: '', value: 'Select month' },
    { userId: 0, name: 'TATNIKIT.EVENT_ALREADY_EXISTS', description: '', value: 'Event exists: {name} {eventType} {date}' },
    { userId: 0, name: 'TATNIKIT.EVENT_SAVED', description: '', value: 'Event saved' },
    { userId: 0, name: 'TATNIKIT.ANOTHER_STUDENT', description: '', value: 'Another student?' },
    { userId: 0, name: 'TATNIKIT.GOODBYE', description: '', value: 'Goodbye' },
    { userId: 0, name: 'CELEBRATIONS.WELCOME', description: '', value: 'Celebrations welcome' },
    { userId: 0, name: 'CELEBRATIONS.GRADE_PROMPT', description: '', value: 'Enter grade' },
    { userId: 0, name: 'CELEBRATIONS.INVALID_GRADE', description: '', value: 'Invalid grade' },
    { userId: 0, name: 'CELEBRATIONS.CLASS_PROMPT', description: '', value: 'Enter class number' },
    { userId: 0, name: 'CELEBRATIONS.INVALID_CLASS', description: '', value: 'Invalid class' },
    { userId: 0, name: 'CELEBRATIONS.NO_CELEBRATIONS_FOUND', description: '', value: 'No celebrations for {className} {month}' },
    { userId: 0, name: 'CELEBRATIONS.GOODBYE', description: '', value: 'Goodbye' },
    { userId: 0, name: 'CELEBRATIONS.READING_START', description: '', value: 'Reading {count} celebrations for {className} {month}' },
    { userId: 0, name: 'CELEBRATIONS.STUDENT_NAME', description: '', value: 'Student: {name}' },
    { userId: 0, name: 'CELEBRATIONS.EVENT_DETAIL', description: '', value: '{eventType} on {date}' },
    { userId: 0, name: 'CELEBRATIONS.READING_COMPLETE', description: '', value: 'Reading complete' },
  ];

  // ---- Shared data ----

  const baseEvent = {
    id: 1, userId: 1, studentReferenceId: 100, eventTypeReferenceId: 1,
    eventDate: new Date('2020-01-01'), name: 'Test Student - Birthday', year: 5780,
  };

  const tatnikitStudent = { ...baseStudent, id: 105, tz: '888888888', name: 'Tatnikit Reporter' };
  const tatnikitClass = { id: 50, userId: 1, key: 5, name: 'ט4', gradeLevel: 'ט' };
  const tatnikitReportStudent = { id: 106, userId: 1, tz: '999999999', name: 'Valid Student' };

  // ---- Step-sequence helpers ----

  /** Student lookup → welcome → main menu */
  function studentToMenu(b: YemotScenarioBuilder, tz = '123456789'): YemotScenarioBuilder {
    return b
      .systemAsks('Enter student ID')
      .userResponds(tz)
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song');
  }

  /** Create event: select type → date → single gift → save */
  function createEventFlow(b: YemotScenarioBuilder): YemotScenarioBuilder {
    return b
      .userResponds('1')
      .systemAsks('Select event type')
      .userResponds('1')
      .systemAsksConfirmation('Confirm Birthday?')
      .userConfirms(true)
      .systemAsks('Enter day')
      .userResponds('15')
      .systemAsks('Select month')
      .userResponds('1')
      .systemAsksConfirmation(/Confirm date/i)
      .userConfirms(true)
      .systemAsks('Select gift')
      .userResponds('1')
      .systemAsksConfirmation('Another gift?')
      .userConfirms(false)
      .systemAsksConfirmation(/Confirm gifts/i)
      .userConfirms(true)
      .systemSends('Event saved')
      .systemHangsUp(/Gifts added/i);
  }

  /** Tatnikit class reporting prefix: student ID → tatnikit welcome → menu → class option */
  function tatnikitClassPrefix(b: YemotScenarioBuilder): YemotScenarioBuilder {
    return b
      .systemAsks('Enter student ID')
      .userResponds('888888888')
      .systemSends('Welcome tatnikit Tatnikit Reporter')
      .systemAsks('Press 1 for self, 2 for class')
      .userResponds('2');
  }

  /** Tatnikit class reporting: enter student TZ → select type → month → save → no more → goodbye */
  function tatnikitClassReport(b: YemotScenarioBuilder, studentTz: string, studentName: string): YemotScenarioBuilder {
    return b
      .systemAsks('Enter student TZ')
      .userResponds(studentTz)
      .systemSends(`Student: ${studentName}`)
      .systemAsks('Select event type')
      .userResponds('1')
      .systemAsksConfirmation('Confirm Birthday?')
      .userConfirms(true)
      .systemAsks('Select month')
      .userResponds('1')
      .systemSends('Event saved')
      .systemAsksConfirmation('Another student?')
      .userConfirms(false)
      .systemHangsUp('Goodbye');
  }

  /** Answer 8 fulfillment questions with valid levels */
  function answerFulfillmentQuestions(b: YemotScenarioBuilder): YemotScenarioBuilder {
    return b
      .systemAsks('Question 1').userResponds('1')
      .systemAsks('Question 2').userResponds('2')
      .systemAsks('Question 3').userResponds('3')
      .systemAsks('Question 4').userResponds('1')
      .systemAsks('Question 5').userResponds('2')
      .systemAsks('Question 6').userResponds('3')
      .systemAsks('Question 7').userResponds('1')
      .systemAsks('Question 8').userResponds('2');
  }

  // ---- Tests ----

  describe('Maintenance', () => {
    it('maintenance message — immediate hangup', async () => {
      const scenario = new YemotScenarioBuilder('Maintenance message')
        .seed('User', [{ ...baseUser, additionalData: { maintainanceMessage: 'System under maintenance' } }])
        .seed('Text', baseTexts)
        .systemHangsUp('System under maintenance')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('Student lookup', () => {
    it('invalid TZ — error message then retry with valid TZ', async () => {
      const scenario = new YemotScenarioBuilder('Invalid TZ retry')
        .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
        .systemAsks('Enter student ID')
        .userResponds('999')
        .systemSends('Student not found, try again')
        .systemAsks('Enter student ID')
        .userResponds('123456789')
        .systemSends('Welcome Test Student')
        .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
        .userResponds('4')
        .systemHangsUp('Song playing')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
    });
  });

  describe('Main menu', () => {
    it('song menu option (4) — hangup with song message', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Song option')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
      )
        .userResponds('4')
        .systemHangsUp('Song playing')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid selection — no action, call ends without hangup', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Main menu invalid')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
      )
        .userResponds('9')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(false);
    });
  });

  describe('Fulfillment (menu option 2)', () => {
    it('no event found, hangup', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Fulfillment no event')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
      )
        .userResponds('2')
        .systemSends('Fulfillment for Test Student')
        .systemSends('No event found')
        .systemHangsUp('Goodbye')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('happy path, answer 8 questions, save and hangup', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Fulfillment happy path')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
          .seed('Event', [{ ...baseEvent, fulfillmentQuestion1: 0 }])
      )
        .userResponds('2')
        .systemSends('Fulfillment for Test Student');

      const result = await runner.run(
        answerFulfillmentQuestions(scenario)
          .systemSends('Data saved')
          .systemHangsUp('Goodbye')
          .build()
      );
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid level 5, error then retry with valid level', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Fulfillment invalid level')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
          .seed('Event', [{ ...baseEvent, fulfillmentQuestion1: 0 }])
      )
        .userResponds('2')
        .systemSends('Fulfillment for Test Student')
        .systemAsks('Question 1')
        .userResponds('5')
        .systemSends('Invalid level');

      const result = await runner.run(
        answerFulfillmentQuestions(scenario)
          .systemSends('Data saved')
          .systemHangsUp('Goodbye')
          .build()
      );
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('Lottery (menu option 3)', () => {
    it('no event found, hangup', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Lottery no event')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
      )
        .userResponds('3')
        .systemSends('Lottery for Test Student')
        .systemSends('No event for lottery')
        .systemHangsUp('Goodbye')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('happy path, select track 2, confirm, save and hangup', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Lottery happy path')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
          .seed('Event', [{ ...baseEvent, lotteryTrack: 0 }])
      )
        .userResponds('3')
        .systemSends('Lottery for Test Student')
        .systemAsks('Select track 1-3')
        .userResponds('2')
        .systemAsksConfirmation('Confirm track 2?')
        .userConfirms(true)
        .systemSends('Track 2 saved')
        .systemHangsUp('Goodbye')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid track 9, error then retry with valid track', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Lottery invalid track')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
          .seed('Event', [{ ...baseEvent, lotteryTrack: 0 }])
      )
        .userResponds('3')
        .systemSends('Lottery for Test Student')
        .systemAsks('Select track 1-3')
        .userResponds('9')
        .systemSends('Invalid track')
        .systemAsks('Select track 1-3')
        .userResponds('1')
        .systemAsksConfirmation('Confirm track 1?')
        .userConfirms(true)
        .systemSends('Track 1 saved')
        .systemHangsUp('Goodbye')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('track not confirmed, re-select and confirm', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Lottery not confirmed')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
          .seed('Event', [{ ...baseEvent, lotteryTrack: 0 }])
      )
        .userResponds('3')
        .systemSends('Lottery for Test Student')
        .systemAsks('Select track 1-3')
        .userResponds('3')
        .systemAsksConfirmation('Confirm track 3?')
        .userConfirms(false)
        .systemAsks('Select track 1-3')
        .userResponds('1')
        .systemAsksConfirmation('Confirm track 1?')
        .userConfirms(true)
        .systemSends('Track 1 saved')
        .systemHangsUp('Goodbye')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('Celebrations listener (999999)', () => {
    const classEntity = { id: 10, userId: 1, key: 1, name: 'ט1', gradeLevel: 'ט' };

    it('full flow with events found', async () => {
      const scenario = new YemotScenarioBuilder('Class celebrations listener')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
        .seed('Class', [classEntity])
        .seed('Student', [{ id: 101, userId: 1, tz: '111111111', name: 'Class Student' }])
        .seed('StudentClass', [{ id: 1, userId: 1, studentReferenceId: 101, classReferenceId: 10, year: 5786 }])
        .seed('Event', [{ id: 5, userId: 1, studentReferenceId: 101, eventTypeReferenceId: 1, eventDate: new Date('2020-01-01'), name: 'Class Student - Birthday', year: 5780, eventHebrewMonth: 'תשרי' }])
        .systemSends('Celebrations welcome')
        .systemAsks('Enter grade')
        .userResponds('9')
        .systemAsks('Enter class number')
        .userResponds('1')
        .systemAsks('Select month')
        .userResponds('1')
        .systemSends(/Reading.*celebrations/i)
        .systemSends(/Student:.*Class Student/i)
        .systemSends(/Birthday/i)
        .systemSends('Reading complete')
        .systemHangsUp('Goodbye')
        .build();

      const result = await celebrationsRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid grade < 9, retry with valid grade', async () => {
      const scenario = new YemotScenarioBuilder('Celebrations invalid grade low')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('Class', [classEntity])
        .systemSends('Celebrations welcome')
        .systemAsks('Enter grade')
        .userResponds('5')
        .systemSends('Invalid grade')
        .systemAsks('Enter grade')
        .userResponds('9')
        .systemAsks('Enter class number')
        .userResponds('1')
        .systemAsks('Select month')
        .userResponds('1')
        .systemHangsUp(/No celebrations/i)
        .build();

      const result = await celebrationsRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid grade > 14, retry with valid grade', async () => {
      const scenario = new YemotScenarioBuilder('Celebrations invalid grade high')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('Class', [classEntity])
        .systemSends('Celebrations welcome')
        .systemAsks('Enter grade')
        .userResponds('20')
        .systemSends('Invalid grade')
        .systemAsks('Enter grade')
        .userResponds('9')
        .systemAsks('Enter class number')
        .userResponds('1')
        .systemAsks('Select month')
        .userResponds('1')
        .systemHangsUp(/No celebrations/i)
        .build();

      const result = await celebrationsRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid class number, retry with valid class', async () => {
      const scenario = new YemotScenarioBuilder('Celebrations invalid class')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('Class', [classEntity])
        .systemSends('Celebrations welcome')
        .systemAsks('Enter grade')
        .userResponds('9')
        .systemAsks('Enter class number')
        .userResponds('99')
        .systemSends('Invalid class')
        .systemAsks('Enter class number')
        .userResponds('1')
        .systemAsks('Select month')
        .userResponds('1')
        .systemHangsUp(/No celebrations/i)
        .build();

      const result = await celebrationsRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid month, retry with valid month', async () => {
      const scenario = new YemotScenarioBuilder('Celebrations invalid month')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('Class', [classEntity])
        .systemSends('Celebrations welcome')
        .systemAsks('Enter grade')
        .userResponds('9')
        .systemAsks('Enter class number')
        .userResponds('1')
        .systemAsks('Select month')
        .userResponds('99')
        .systemSends('Invalid input')
        .systemAsks('Select month')
        .userResponds('1')
        .systemHangsUp(/No celebrations/i)
        .build();

      const result = await celebrationsRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('no celebrations found for class and month, hangup', async () => {
      const scenario = new YemotScenarioBuilder('Celebrations none found')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('Class', [classEntity])
        .systemSends('Celebrations welcome')
        .systemAsks('Enter grade')
        .userResponds('9')
        .systemAsks('Enter class number')
        .userResponds('1')
        .systemAsks('Select month')
        .userResponds('1')
        .systemHangsUp(/No celebrations/i)
        .build();

      const result = await celebrationsRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('Secret tatnikit (4451114)', () => {
    it('tatnikit flow, report for class', async () => {
      const scenario = new YemotScenarioBuilder('Secret tatnikit code')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
        .seed('Student', [
          { id: 200, userId: 1, tz: '222222222', name: 'Tatnikit Student' },
          { id: 201, userId: 1, tz: '333333333', name: 'Report Student' },
        ])
        .seed('Class', [{ id: 20, userId: 1, key: 2, name: 'י1', gradeLevel: 'י' }])
        .seed('StudentClass', [
          { id: 1, userId: 1, studentReferenceId: 200, classReferenceId: 20, year: 5786 },
          { id: 2, userId: 1, studentReferenceId: 201, classReferenceId: 20, year: 5786 },
        ])
        .systemAsks('Enter your TZ')
        .userResponds('222222222')
        .systemSends('Welcome tatnikit Tatnikit Student')
        .systemAsks('Enter student TZ')
        .userResponds('333333333')
        .systemSends('Student: Report Student')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Select month')
        .userResponds('1')
        .systemSends('Event saved')
        .systemAsksConfirmation('Another student?')
        .userConfirms(false)
        .systemHangsUp('Goodbye')
        .build();

      const result = await tatnikitRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('TZ not found, retry with valid TZ', async () => {
      const scenario = new YemotScenarioBuilder('Secret tatnikit TZ not found')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
        .seed('Student', [
          { id: 200, userId: 1, tz: '222222222', name: 'Tatnikit Student' },
          { id: 201, userId: 1, tz: '333333333', name: 'Report Student' },
        ])
        .seed('Class', [{ id: 20, userId: 1, key: 2, name: 'י1', gradeLevel: 'י' }])
        .seed('StudentClass', [
          { id: 1, userId: 1, studentReferenceId: 200, classReferenceId: 20, year: 5786 },
          { id: 2, userId: 1, studentReferenceId: 201, classReferenceId: 20, year: 5786 },
        ])
        .systemAsks('Enter your TZ')
        .userResponds('999')
        .systemSends('Student not found, try again')
        .systemAsks('Enter your TZ')
        .userResponds('222222222')
        .systemSends('Welcome tatnikit Tatnikit Student')
        .systemAsks('Enter student TZ')
        .userResponds('333333333')
        .systemSends('Student: Report Student')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Select month')
        .userResponds('1')
        .systemSends('Event saved')
        .systemAsksConfirmation('Another student?')
        .userConfirms(false)
        .systemHangsUp('Goodbye')
        .build();

      const result = await tatnikitRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('no class found, hangup with GOODBYE', async () => {
      const scenario = new YemotScenarioBuilder('Secret tatnikit no class')
        .seed('User', [baseUser]).seed('Text', baseTexts)
        .seed('Student', [{ id: 200, userId: 1, tz: '222222222', name: 'Tatnikit Student' }])
        .systemAsks('Enter your TZ')
        .userResponds('222222222')
        .systemSends('No class found')
        .systemHangsUp('Goodbye')
        .build();

      const result = await tatnikitRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('Tatnikit menu', () => {
    it('option 1 — report for self, continue to main menu', async () => {
      const scenario = new YemotScenarioBuilder('Tatnikit menu option 1')
        .seed('User', [baseUser]).seed('Text', baseTexts)
        .seed('Student', [{ ...baseStudent, id: 102, tz: '555555555', name: 'Tatnikit Self' }])
        .seed('Class', [{ id: 30, userId: 1, key: 3, name: 'ט2', gradeLevel: 'ט' }])
        .seed('Tatnikit', [{ id: 1, userId: 1, studentReferenceId: 102, classReferenceId: 30, year: 5786 }])
        .seed('StudentClass', [{ id: 1, userId: 1, studentReferenceId: 102, classReferenceId: 30, year: 5786 }])
        .systemAsks('Enter student ID')
        .userResponds('555555555')
        .systemSends('Welcome tatnikit Tatnikit Self')
        .systemAsks('Press 1 for self, 2 for class')
        .userResponds('1')
        .systemSends('Welcome Tatnikit Self')
        .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
        .userResponds('4')
        .systemHangsUp('Song playing')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('option 2 — report class celebrations', async () => {
      const scenario = new YemotScenarioBuilder('Tatnikit menu option 2')
        .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
        .seed('Student', [
          { ...baseStudent, id: 103, tz: '666666666', name: 'Tatnikit Class' },
          { id: 104, userId: 1, tz: '777777777', name: 'Report Student 2' },
        ])
        .seed('Class', [{ id: 40, userId: 1, key: 4, name: 'ט3', gradeLevel: 'ט' }])
        .seed('Tatnikit', [{ id: 1, userId: 1, studentReferenceId: 103, classReferenceId: 40, year: 5786 }])
        .seed('StudentClass', [
          { id: 1, userId: 1, studentReferenceId: 103, classReferenceId: 40, year: 5786 },
          { id: 2, userId: 1, studentReferenceId: 104, classReferenceId: 40, year: 5786 },
        ])
        .systemAsks('Enter student ID')
        .userResponds('666666666')
        .systemSends('Welcome tatnikit Tatnikit Class')
        .systemAsks('Press 1 for self, 2 for class')
        .userResponds('2')
        .systemAsks('Enter student TZ')
        .userResponds('777777777')
        .systemSends('Student: Report Student 2')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Select month')
        .userResponds('1')
        .systemSends('Event saved')
        .systemAsksConfirmation('Another student?')
        .userConfirms(false)
        .systemHangsUp('Goodbye')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('Tatnikit class reporting', () => {
    it('student not found, continue to next', async () => {
      const scenario = tatnikitClassPrefix(
        new YemotScenarioBuilder('Tatnikit student not found')
          .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
          .seed('Student', [tatnikitStudent, tatnikitReportStudent])
          .seed('Class', [tatnikitClass])
          .seed('Tatnikit', [{ id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 }])
          .seed('StudentClass', [
            { id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 },
            { id: 2, userId: 1, studentReferenceId: 106, classReferenceId: 50, year: 5786 },
          ])
      )
        .systemAsks('Enter student TZ')
        .userResponds('000')
        .systemSends('Student not found, try again');

      const result = await runner.run(
        tatnikitClassReport(scenario, '999999999', 'Valid Student').build()
      );
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('student not in class, continue to next', async () => {
      const notInClassStudent = { id: 107, userId: 1, tz: '111222333', name: 'Not In Class Student' };
      const scenario = tatnikitClassPrefix(
        new YemotScenarioBuilder('Tatnikit student not in class')
          .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
          .seed('Student', [tatnikitStudent, tatnikitReportStudent, notInClassStudent])
          .seed('Class', [tatnikitClass])
          .seed('Tatnikit', [{ id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 }])
          .seed('StudentClass', [
            { id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 },
            { id: 2, userId: 1, studentReferenceId: 106, classReferenceId: 50, year: 5786 },
          ])
      )
        .systemAsks('Enter student TZ')
        .userResponds('111222333')
        .systemSends('Student not in class');

      const result = await runner.run(
        tatnikitClassReport(scenario, '999999999', 'Valid Student').build()
      );
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('event already exists, message and continue', async () => {
      const existingEvent = {
        id: 60, userId: 1, studentReferenceId: 106, eventTypeReferenceId: 1,
        eventDate: new Date('2025-09-01'), name: 'Existing Student - Birthday',
        year: 5786, eventHebrewMonth: 'תשרי',
      };
      const scenario = tatnikitClassPrefix(
        new YemotScenarioBuilder('Tatnikit event exists')
          .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
          .seed('Student', [tatnikitStudent, { ...tatnikitReportStudent, name: 'Existing Student' }])
          .seed('Class', [tatnikitClass])
          .seed('Tatnikit', [{ id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 }])
          .seed('StudentClass', [
            { id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 },
            { id: 2, userId: 1, studentReferenceId: 106, classReferenceId: 50, year: 5786 },
          ])
          .seed('Event', [existingEvent])
      )
        .systemAsks('Enter student TZ')
        .userResponds('999999999')
        .systemSends('Student: Existing Student')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Select month')
        .userResponds('1')
        .systemSends(/Event exists/i)
        .systemAsksConfirmation('Another student?')
        .userConfirms(false)
        .systemHangsUp('Goodbye')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('create new tatnikit-only event', async () => {
      const scenario = tatnikitClassPrefix(
        new YemotScenarioBuilder('Tatnikit create event')
          .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
          .seed('Student', [tatnikitStudent, { ...tatnikitReportStudent, name: 'New Student' }])
          .seed('Class', [tatnikitClass])
          .seed('Tatnikit', [{ id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 }])
          .seed('StudentClass', [
            { id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 },
            { id: 2, userId: 1, studentReferenceId: 106, classReferenceId: 50, year: 5786 },
          ])
      );

      const result = await runner.run(
        tatnikitClassReport(scenario, '999999999', 'New Student').build()
      );
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('no more students, hangup with GOODBYE', async () => {
      const scenario = tatnikitClassPrefix(
        new YemotScenarioBuilder('Tatnikit no more students')
          .seed('User', [baseUser]).seed('Text', baseTexts).seed('EventType', eventType)
          .seed('Student', [tatnikitStudent, { ...tatnikitReportStudent, name: 'One Student' }])
          .seed('Class', [tatnikitClass])
          .seed('Tatnikit', [{ id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 }])
          .seed('StudentClass', [
            { id: 1, userId: 1, studentReferenceId: 105, classReferenceId: 50, year: 5786 },
            { id: 2, userId: 1, studentReferenceId: 106, classReferenceId: 50, year: 5786 },
          ])
      );

      const result = await runner.run(
        tatnikitClassReport(scenario, '999999999', 'One Student').build()
      );
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('Create event (menu option 1)', () => {
    it('happy path, select type, date, gifts, save', async () => {
      const scenario = createEventFlow(
        studentToMenu(
          new YemotScenarioBuilder('Create event happy path')
            .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
            .seed('EventType', eventType).seed('Gift', gift)
        )
      ).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('event type — invalid menu selection, hangup with INVALID_INPUT', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Event type invalid')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('9')
        .systemHangsUp('Invalid input')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('event type — not confirmed, re-select and confirm', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Event type not confirmed')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType).seed('Gift', gift)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(false)
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(false)
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(true)
        .systemSends('Event saved')
        .systemHangsUp(/Gifts added/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('gift selection — invalid menu selection, hangup with INVALID_INPUT', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Gift invalid')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType).seed('Gift', gift)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('9')
        .systemHangsUp('Invalid input')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('gifts — select additional gift after first selection', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Gifts additional')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
          .seed('Gift', [
            { id: 1, userId: 1, key: 1, name: 'Book' },
            { id: 2, userId: 1, key: 2, name: 'Pen' },
          ])
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(true)
        .systemAsks('Select another gift')
        .userResponds('2')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(false)
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(true)
        .systemSends('Event saved')
        .systemHangsUp(/Gifts added/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('gifts — select 5 gifts, loop exits at max', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Gifts max 5')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
          .seed('Gift', [
            { id: 1, userId: 1, key: 1, name: 'G1' },
            { id: 2, userId: 1, key: 2, name: 'G2' },
            { id: 3, userId: 1, key: 3, name: 'G3' },
            { id: 4, userId: 1, key: 4, name: 'G4' },
            { id: 5, userId: 1, key: 5, name: 'G5' },
          ])
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(true)
        .systemAsks('Select another gift')
        .userResponds('2')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(true)
        .systemAsks('Select another gift')
        .userResponds('3')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(true)
        .systemAsks('Select another gift')
        .userResponds('4')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(true)
        .systemAsks('Select another gift')
        .userResponds('5')
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(true)
        .systemSends('Event saved')
        .systemHangsUp(/Gifts added/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('gifts — not confirmed, restart selection', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Gifts not confirmed')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType).seed('Gift', gift)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(false)
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(false)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(false)
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(true)
        .systemSends('Event saved')
        .systemHangsUp(/Gifts added/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('event date — day > 30, retry with valid day', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Date day > 30')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType).seed('Gift', gift)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('35')
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(false)
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(true)
        .systemSends('Event saved')
        .systemHangsUp(/Gifts added/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('event date — invalid month selection, hangup with INVALID_INPUT', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Date invalid month')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('99')
        .systemHangsUp('Invalid input')
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('event date — not confirmed, re-enter and confirm', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Date not confirmed')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType).seed('Gift', gift)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('15')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(false)
        .systemAsks('Enter day')
        .userResponds('10')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(false)
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(true)
        .systemSends('Event saved')
        .systemHangsUp(/Gifts added/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('event date — more than 100 days ago, uses next year', async () => {
      const scenario = studentToMenu(
        new YemotScenarioBuilder('Date next year adjustment')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
          .seed('EventType', eventType).seed('Gift', gift)
      )
        .userResponds('1')
        .systemAsks('Select event type')
        .userResponds('1')
        .systemAsksConfirmation('Confirm Birthday?')
        .userConfirms(true)
        .systemAsks('Enter day')
        .userResponds('1')
        .systemAsks('Select month')
        .userResponds('1')
        .systemAsksConfirmation(/Confirm date/i)
        .userConfirms(true)
        .systemAsks('Select gift')
        .userResponds('1')
        .systemAsksConfirmation('Another gift?')
        .userConfirms(false)
        .systemAsksConfirmation(/Confirm gifts/i)
        .userConfirms(true)
        .systemSends('Event saved')
        .systemHangsUp(/Gifts added/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('merge student report into existing tatnikit-only event', async () => {
      const scenario = createEventFlow(
        studentToMenu(
          new YemotScenarioBuilder('Merge tatnikit event')
            .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
            .seed('EventType', eventType).seed('Gift', gift)
            .seed('Event', [{
              id: 50, userId: 1, studentReferenceId: 100, eventTypeReferenceId: 1,
              eventDate: new Date('2025-01-01'), name: 'Test Student - Birthday',
              year: 5786, reportOrigin: 'only_tatnikit', reportedByTatnikit: true,
            }])
        )
      ).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('no matching tatnikit event, create new', async () => {
      const scenario = createEventFlow(
        studentToMenu(
          new YemotScenarioBuilder('No matching tatnikit event')
            .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
            .seed('EventType', eventType).seed('Gift', gift)
        )
      ).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('ApiEnterID', () => {
    it('student found via ApiEnterID — skip TZ prompt', async () => {
      const customRunner = new YemotScenarioRunner(YemotHandlerService as any, '123456789');
      const scenario = new YemotScenarioBuilder('ApiEnterID student found')
        .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
        .systemSends('Welcome Test Student')
        .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
        .userResponds('4')
        .systemHangsUp('Song playing')
        .build();

      const result = await customRunner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('digits not matching — fall through to TZ prompt', async () => {
      const customRunner = new YemotScenarioRunner(YemotHandlerService as any, 'abc999');
      const scenario = studentToMenu(
        new YemotScenarioBuilder('ApiEnterID no match')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
      )
        .userResponds('4')
        .systemHangsUp('Song playing')
        .build();

      const result = await customRunner.run(scenario);
      expect(result.passed).toBe(true);
    });

    it('without trailing digits — fall through to TZ prompt', async () => {
      const customRunner = new YemotScenarioRunner(YemotHandlerService as any, 'abc');
      const scenario = studentToMenu(
        new YemotScenarioBuilder('ApiEnterID no digits')
          .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
      )
        .userResponds('4')
        .systemHangsUp('Song playing')
        .build();

      const result = await customRunner.run(scenario);
      expect(result.passed).toBe(true);
    });
  });

  describe('autoAssignTeacher', () => {
    it('event already has teacher, skip assignment', async () => {
      const scenario = createEventFlow(
        studentToMenu(
          new YemotScenarioBuilder('AutoAssign already has teacher')
            .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
            .seed('EventType', eventType).seed('Gift', gift)
            .seed('Teacher', [{ id: 5, userId: 1, name: 'Test Teacher', tz: '444444444' }])
            .seed('Event', [{
              id: 70, userId: 1, studentReferenceId: 100, eventTypeReferenceId: 1,
              eventDate: new Date('2025-01-01'), name: 'Test Student - Birthday',
              year: 5786, reportOrigin: 'only_tatnikit', reportedByTatnikit: true,
              teacherReferenceId: 5,
            }])
        )
      ).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('no rule matched, skip assignment', async () => {
      const scenario = createEventFlow(
        studentToMenu(
          new YemotScenarioBuilder('AutoAssign no rule matched')
            .seed('User', [baseUser]).seed('Student', [baseStudent]).seed('Text', baseTexts)
            .seed('EventType', eventType).seed('Gift', gift)
        )
      ).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('error during assignment, log and continue', async () => {
      const scenario = createEventFlow(
        studentToMenu(
          new YemotScenarioBuilder('AutoAssign error continues')
            .seed('User', [baseUser]).seed('Text', baseTexts)
            .seed('Student', [{ ...baseStudent, familyReferenceId: '1_father_mother' }])
            .seed('EventType', eventType).seed('Gift', gift)
        )
      ).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });
});