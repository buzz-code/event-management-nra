import { getI18nProvider } from '../i18nProvider';

// Mock ra-i18n-polyglot
jest.mock('ra-i18n-polyglot', () => {
  return jest.fn().mockImplementation((getTranslations, defaultLocale) => {
    let currentLocale = defaultLocale;

    // Simple deep merge implementation for the mock
    const mockMerge = (target, source) => {
      const output = { ...target };
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object') {
          output[key] = mockMerge(output[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    };

    const baseTranslations = {
      en: {
        ra: {
          action: {
            save: 'Save',
            clear_array_input: 'Clear List',
          },
          auth: {
            organization_name: 'Organization Name',
          },
        },
      },
      he: {
        ra: {
          action: {
            save: 'שמור',
            clear_array_input: 'נקה רשימה',
          },
          auth: {
            organization_name: 'שם המוסד',
          },
        },
        resources: {
          general: {
            fields: {
              id: 'מזהה',
              name: 'שם',
              createdAt: 'תאריך יצירה',
              updatedAt: 'תאריך עדכון',
            },
          },
        },
      },
    };

    return {
      translate: (key, options = {}) => {
        // Get and merge translations
        let messages = baseTranslations[currentLocale];
        const customMessages = getTranslations(currentLocale);
        if (customMessages) {
          messages = mockMerge(messages, customMessages);
        }

        if (!messages) return key;

        // Split the key and traverse the translations object
        const parts = key.split('.');
        let result = messages;

        for (const part of parts) {
          result = result?.[part];
          if (result === undefined) {
            return key;
          }
        }

        return result;
      },
      changeLocale: locale => {
        currentLocale = locale;
        return Promise.resolve();
      },
      getLocale: () => currentLocale,
    };
  });
});

describe('i18nProvider', () => {
  describe('dummy provider', () => {
    const dummyProvider = getI18nProvider({}, true);

    it('always returns the key as translation', () => {
      expect(dummyProvider.translate('ra.action.any_key')).toBe('ra.action.any_key');
    });

    it('has a noop locale change', async () => {
      await expect(dummyProvider.changeLocale('en')).resolves.toBeUndefined();
      expect(dummyProvider.getLocale()).toBe('en');
    });
  });

  describe('regular provider', () => {
    let i18nProvider;

    beforeEach(() => {
      i18nProvider = getI18nProvider({
        ra: {
          custom: {
            test: 'בדיקה',
          },
        },
      });
    });

    it('uses Hebrew as default locale', () => {
      expect(i18nProvider.getLocale()).toBe('he');
    });

    it('translates messages in Hebrew', () => {
      expect(i18nProvider.translate('ra.action.save')).toBe('שמור');
      expect(i18nProvider.translate('ra.auth.organization_name')).toBe('שם המוסד');
    });

    it('handles missing translations by returning the key', () => {
      expect(i18nProvider.translate('ra.action.nonexistent')).toBe('ra.action.nonexistent');
    });

    it('translates general resource fields in Hebrew', () => {
      expect(i18nProvider.translate('resources.general.fields.id')).toBe('מזהה');
      expect(i18nProvider.translate('resources.general.fields.name')).toBe('שם');
    });

    describe('when locale is changed to English', () => {
      beforeEach(async () => {
        await i18nProvider.changeLocale('en');
      });

      it('returns English translations', () => {
        expect(i18nProvider.getLocale()).toBe('en');
        expect(i18nProvider.translate('ra.action.save')).toBe('Save');
        expect(i18nProvider.translate('ra.auth.organization_name')).toBe('Organization Name');
      });
    });
  });

  describe('with custom translations', () => {
    let i18nProvider;

    beforeEach(() => {
      i18nProvider = getI18nProvider({
        ra: {
          custom: {
            key: 'ערך מותאם',
          },
        },
      });
      // Ensure Hebrew locale
      i18nProvider.changeLocale('he');
    });

    it('merges custom translations with base translations', () => {
      expect(i18nProvider.translate('ra.action.save')).toBe('שמור');
      expect(i18nProvider.translate('ra.custom.key')).toBe('ערך מותאם');
    });
  });
});