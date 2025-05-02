import { YemotCallHandler } from "@shared/utils/yemot/yemot-router";

export const yemotHandler: YemotCallHandler = (logger) => async (call) => {
  logger.log(`Handling call from ${call.phone}`);

  // Example flow from the yemot-router2 example
  try {
    await call.read([{ type: 'text', data: 'היי, תקיש 10' }], 'tap', {
      max_digits: 2,
      min_digits: 2,
      digits_allowed: ['10']
    });

    const name = await call.read(
      [{ type: 'text', data: 'שלום, אנא הקש את שמך המלא' }],
      'tap',
      { typing_playback_mode: 'HebrewKeyboard' }
    );
    logger.log(`User entered name: ${name}`);

    call.id_list_message([{ type: 'text', data: 'שלום ' + name }], { prependToNextAction: true });
    const addressFilePath = await call.read(
      [
        { type: 'text', data: 'אנא הקלט את הרחוב בו אתה גר' }
      ],
      'record',
      { removeInvalidChars: true }
    );
    logger.log(`Address file path: ${addressFilePath}`);

    call.id_list_message([{ type: 'text', data: 'תגובתך התקבלה בהצלחה' }], { prependToNextAction: true });
    return call.hangup();
  } catch (error) {
    logger.error(`Error in call handler: ${error.message}`);
    console.error(error);
    return call.id_list_message([{ type: 'text', data: 'אירעה שגיאה, אנא נסה שוב מאוחר יותר' }]);
  }
};
