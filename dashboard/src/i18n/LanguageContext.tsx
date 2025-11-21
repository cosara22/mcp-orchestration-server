import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        // Load from localStorage or default to 'en'
        const saved = localStorage.getItem('dashboard-language');
        return (saved === 'ja' || saved === 'en') ? saved : 'en';
    });

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('dashboard-language', lang);
    };

    const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
        let text = translations[language][key] || translations.en[key] || key;

        // Replace {{param}} with actual values
        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(`{{${param}}}`, String(params[param]));
            });
        }

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
