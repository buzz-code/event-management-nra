import { YemotCallHandler, YemotCallProcessor, id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

export const yemotHandler: YemotCallHandler = (logger) => async (call) => {
  logger.log(`Handling call from ${call.phone}`);

  // Example flow from the yemot-router2 example
  await call.read([{ type: 'text', data: 'היי, תקיש 10' }], 'tap', {
    max_digits: 2,
    min_digits: 2,
    digits_allowed: ['10']
  });

  const name = await call.read([{ type: 'text', data: 'שלום, אנא הקש את שמך המלא' }], 'tap', {
    typing_playback_mode: 'HebrewKeyboard'
  });
  logger.log(`User entered name: ${name}`);

  id_list_message(call, 'שלום ' + name);
  const addressFilePath = await call.read([{ type: 'text', data: 'אנא הקלט את הרחוב בו אתה גר' }], 'record');
  logger.log(`Address file path: ${addressFilePath}`);

  return id_list_message_with_hangup(call, 'תגובתך התקבלה בהצלחה');
};


export const yemotProcessor: YemotCallProcessor = async (call, logger) => {
  logger.log(`Processing call ${call.callId} from ${call.phone}`);
  // Here you can add any additional processing logic you need
  // For example, saving the call data to a database or sending a notification
  // await saveCallDataToDatabase(call);
  // await sendNotification(call);
};
