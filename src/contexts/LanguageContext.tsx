import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/i18n/config';

interface LanguageContextType {
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(i18n.language === 'fa');

  const changeLanguage = async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    setIsRTL(lang === 'fa');
    
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    const currentLang = i18n.language as SupportedLanguage;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    setIsRTL(currentLang === 'fa');
  }, [i18n.language]);

  return (
    <LanguageContext.Provider value={{ 
      language: i18n.language as SupportedLanguage, 
      changeLanguage, 
      isRTL 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
