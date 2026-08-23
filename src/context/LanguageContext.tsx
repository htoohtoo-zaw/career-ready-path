/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en, TranslationType } from '../locales/en';
import { my } from '../locales/my';

export type Language = 'en' | 'my';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, variables?: Record<string, string | number>, defaultText?: string) => string;
  isBurmese: boolean;
}

const dictionaries: Record<Language, TranslationType> = {
  en,
  my,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('crp_language');
    if (saved === 'my' || saved === 'en') return saved;
    // Check browser preference if starting for the first time
    if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('my')) {
      return 'my';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('crp_language', language);
    document.documentElement.lang = language;
    if (language === 'my') {
      document.documentElement.classList.add('lang-my');
      document.body.classList.add('lang-my');
    } else {
      document.documentElement.classList.remove('lang-my');
      document.body.classList.remove('lang-my');
    }
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'my' : 'en'));
  };

  // Helper to resolve nested keys like "hero.title" or "nav.roadmaps"
  const t = (key: string, variables?: Record<string, string | number>, defaultText?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    const fallbackDict = dictionaries.en;

    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    };

    let translation = getNestedValue(dict, key);
    if (translation === undefined) {
      translation = getNestedValue(fallbackDict, key);
    }
    if (translation === undefined) {
      translation = defaultText || key;
    }

    if (typeof translation === 'string' && variables) {
      Object.keys(variables).forEach((varKey) => {
        const regex = new RegExp(`{{${varKey}}}`, 'g');
        translation = translation.replace(regex, String(variables[varKey]));
      });
    }

    return typeof translation === 'string' ? translation : String(translation || key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isBurmese: language === 'my',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
