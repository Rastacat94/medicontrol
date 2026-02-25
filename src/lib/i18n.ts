'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Language, 
  defaultLanguage, 
  getStoredLanguage, 
  setStoredLanguage,
  translations 
} from './translations';

// Hook para usar traducciones en componentes
export function useTranslation() {
  // Initialize with stored language directly (sync operation)
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return getStoredLanguage();
    }
    return defaultLanguage;
  });
  const [isLoaded, setIsLoaded] = useState(typeof window !== 'undefined');

  // Función de traducción
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback a español
        value = translations.es;
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = (value as Record<string, unknown>)[k2];
          } else {
            return key;
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);

  // Cambiar idioma
  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
    setStoredLanguage(newLang);
    
    // Actualizar atributo lang del HTML
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  }, []);

  return {
    t,
    language,
    changeLanguage,
    isLoaded,
    languages: ['es', 'en'] as Language[],
  };
}

// Utilidad para obtener traducción sin hook (para uso en lugares fuera de React)
export function getTranslation(key: string, lang: Language = defaultLanguage): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Exportar tipos y constantes
export { languages, defaultLanguage } from './translations';
export type { Language } from './translations';
