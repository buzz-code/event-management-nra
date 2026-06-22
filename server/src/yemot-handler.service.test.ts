import { YemotScenarioBuilder, YemotScenarioRunner, useFakeDateOnly } from '@shared/utils/yemot/testing';
import { YemotHandlerService } from './yemot-handler.service';

describe('YemotHandlerService — event-management-nra', () => {
  const runner = new YemotScenarioRunner(YemotHandlerService as any);

  beforeEach(() => useFakeDateOnly());
  afterEach(() => jest.useRealTimers());

  const baseUser = {
    id: 1,
    phoneNumber: '099999999',
    name: 'Test User',
    effective_id: null,
  };

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
  ];

  const baseStudent = { id: 100, userId: 1, tz: '123456789', name: 'Test Student' };

  // ---- Maintenance ----

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

  // ---- Student lookup ----

  it('invalid TZ — error message then retry with valid TZ', async () => {
    const scenario = new YemotScenarioBuilder('Invalid TZ retry')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('Text', baseTexts)
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

  // ---- Main menu: song option ----

  it('song menu option (4) — hangup with song message', async () => {
    const scenario = new YemotScenarioBuilder('Song option')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
      .userResponds('4')
      .systemHangsUp('Song playing')
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  // ---- Fulfillment: no event found ----

  it('fulfillment (2) — no event found, hangup', async () => {
    const scenario = new YemotScenarioBuilder('Fulfillment no event')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
      .userResponds('2')
      .systemSends('Fulfillment for Test Student')
      .systemSends('No event found')
      .systemHangsUp('Goodbye')
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  // ---- Fulfillment: happy path with 8 questions ----

  it('fulfillment (2) — happy path, answer 8 questions, save and hangup', async () => {
    const pastEvent = {
      id: 1,
      userId: 1,
      studentReferenceId: 100,
      eventTypeReferenceId: 1,
      eventDate: new Date('2020-01-01'),
      name: 'Test Student - Birthday',
      year: 5780,
      fulfillmentQuestion1: 0,
    };

    const scenario = new YemotScenarioBuilder('Fulfillment happy path')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('EventType', [{ id: 1, userId: 1, key: 1, name: 'Birthday' }])
      .seed('Event', [pastEvent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
      .userResponds('2')
      .systemSends('Fulfillment for Test Student')
      .systemAsks('Question 1')
      .userResponds('1')
      .systemAsks('Question 2')
      .userResponds('2')
      .systemAsks('Question 3')
      .userResponds('3')
      .systemAsks('Question 4')
      .userResponds('1')
      .systemAsks('Question 5')
      .userResponds('2')
      .systemAsks('Question 6')
      .userResponds('3')
      .systemAsks('Question 7')
      .userResponds('1')
      .systemAsks('Question 8')
      .userResponds('2')
      .systemSends('Data saved')
      .systemHangsUp('Goodbye')
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  // ---- Fulfillment: invalid level then retry ----

  it('fulfillment (2) — invalid level 5, error then retry with valid level', async () => {
    const pastEvent = {
      id: 1,
      userId: 1,
      studentReferenceId: 100,
      eventTypeReferenceId: 1,
      eventDate: new Date('2020-01-01'),
      name: 'Test Student - Birthday',
      year: 5780,
      fulfillmentQuestion1: 0,
    };

    const scenario = new YemotScenarioBuilder('Fulfillment invalid level')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('EventType', [{ id: 1, userId: 1, key: 1, name: 'Birthday' }])
      .seed('Event', [pastEvent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
      .userResponds('2')
      .systemSends('Fulfillment for Test Student')
      .systemAsks('Question 1')
      .userResponds('5')
      .systemSends('Invalid level')
      .systemAsks('Question 1')
      .userResponds('1')
      .systemAsks('Question 2')
      .userResponds('2')
      .systemAsks('Question 3')
      .userResponds('3')
      .systemAsks('Question 4')
      .userResponds('1')
      .systemAsks('Question 5')
      .userResponds('2')
      .systemAsks('Question 6')
      .userResponds('3')
      .systemAsks('Question 7')
      .userResponds('1')
      .systemAsks('Question 8')
      .userResponds('2')
      .systemSends('Data saved')
      .systemHangsUp('Goodbye')
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  // ---- Lottery: no event found ----

  it('lottery (3) — no event found, hangup', async () => {
    const scenario = new YemotScenarioBuilder('Lottery no event')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
      .userResponds('3')
      .systemSends('Lottery for Test Student')
      .systemSends('No event for lottery')
      .systemHangsUp('Goodbye')
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  // ---- Lottery: happy path with track selection ----

  it('lottery (3) — happy path, select track 2, confirm, save and hangup', async () => {
    const pastEvent = {
      id: 1,
      userId: 1,
      studentReferenceId: 100,
      eventTypeReferenceId: 1,
      eventDate: new Date('2020-01-01'),
      name: 'Test Student - Birthday',
      year: 5780,
      lotteryTrack: 0,
    };

    const scenario = new YemotScenarioBuilder('Lottery happy path')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('EventType', [{ id: 1, userId: 1, key: 1, name: 'Birthday' }])
      .seed('Event', [pastEvent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
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

  // ---- Lottery: invalid track then retry ----

  it('lottery (3) — invalid track 9, error then retry with valid track', async () => {
    const pastEvent = {
      id: 1,
      userId: 1,
      studentReferenceId: 100,
      eventTypeReferenceId: 1,
      eventDate: new Date('2020-01-01'),
      name: 'Test Student - Birthday',
      year: 5780,
      lotteryTrack: 0,
    };

    const scenario = new YemotScenarioBuilder('Lottery invalid track')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('EventType', [{ id: 1, userId: 1, key: 1, name: 'Birthday' }])
      .seed('Event', [pastEvent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
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

  // ---- Lottery: track not confirmed, retry ----

  it('lottery (3) — track not confirmed, re-select and confirm', async () => {
    const pastEvent = {
      id: 1,
      userId: 1,
      studentReferenceId: 100,
      eventTypeReferenceId: 1,
      eventDate: new Date('2020-01-01'),
      name: 'Test Student - Birthday',
      year: 5780,
      lotteryTrack: 0,
    };

    const scenario = new YemotScenarioBuilder('Lottery not confirmed')
      .seed('User', [baseUser])
      .seed('Student', [baseStudent])
      .seed('EventType', [{ id: 1, userId: 1, key: 1, name: 'Birthday' }])
      .seed('Event', [pastEvent])
      .seed('Text', baseTexts)
      .systemAsks('Enter student ID')
      .userResponds('123456789')
      .systemSends('Welcome Test Student')
      .systemAsks('Press 1 to report, 2 for fulfillment, 3 for lottery, 4 for song')
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

  // ---- Stub tests for uncovered branches ----

  it.skip('class celebrations listener (999999) — full flow with events found', () => { });
  it.skip('secret tatnikit code (4451114) — tatnikit flow, report for class', () => { });
  it.skip('tatnikit menu option 1 — report for self, continue to main menu', () => { });
  it.skip('tatnikit menu option 2 — report class celebrations', () => { });
  it.skip('create event (1) — happy path, select type, date, gifts, save', () => { });
  it.skip('main menu invalid selection — no action, call ends without hangup', () => { });
  it.skip('student found via ApiEnterID — skip TZ prompt', () => { });
  it.skip('ApiEnterID digits not matching — fall through to TZ prompt', () => { });
  it.skip('ApiEnterID without trailing digits — fall through to TZ prompt', () => { });
  it.skip('event type — invalid menu selection, hangup with INVALID_INPUT', () => { });
  it.skip('event type — not confirmed, re-select and confirm', () => { });
  it.skip('gift selection — invalid menu selection, hangup with INVALID_INPUT', () => { });
  it.skip('gifts — select additional gift after first selection', () => { });
  it.skip('gifts — select 5 gifts, loop exits at max', () => { });
  it.skip('gifts — not confirmed, restart selection', () => { });
  it.skip('event date — day > 30, retry with valid day', () => { });
  it.skip('event date — invalid month selection, hangup with INVALID_INPUT', () => { });
  it.skip('event date — not confirmed, re-enter and confirm', () => { });
  it.skip('event date — more than 100 days ago, uses next year', () => { });
  it.skip('create event — merge student report into existing tatnikit-only event', () => { });
  it.skip('create event — no matching tatnikit event, create new', () => { });
  it.skip('celebrations — invalid grade < 9, retry with valid grade', () => { });
  it.skip('celebrations — invalid grade > 14, retry with valid grade', () => { });
  it.skip('celebrations — invalid class number, retry with valid class', () => { });
  it.skip('celebrations — invalid month, retry with valid month', () => { });
  it.skip('celebrations — no celebrations found for class and month, hangup', () => { });
  it.skip('secret tatnikit — TZ not found, retry with valid TZ', () => { });
  it.skip('secret tatnikit — no class found, hangup with GOODBYE', () => { });
  it.skip('tatnikit class reporting — student not found, continue to next', () => { });
  it.skip('tatnikit class reporting — student not in class, continue to next', () => { });
  it.skip('tatnikit class reporting — event already exists, message and continue', () => { });
  it.skip('tatnikit class reporting — create new tatnikit-only event', () => { });
  it.skip('tatnikit class reporting — no more students, hangup with GOODBYE', () => { });
  it.skip('autoAssignTeacher — event already has teacher, skip assignment', () => { });
  it.skip('autoAssignTeacher — no rule matched, skip assignment', () => { });
  it.skip('autoAssignTeacher — error during assignment, log and continue', () => { });
});