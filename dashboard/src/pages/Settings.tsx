import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

const Settings: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();

    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">{t('settingsPage')}</h1>
                <p className="text-slate-400 text-sm">{t('settingsDesc')}</p>
            </div>

            {/* Language Settings Section */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-sm">
                <div className="flex items-center mb-6">
                    <Globe className="w-5 h-5 text-primary-500 mr-3" />
                    <div>
                        <h2 className="text-lg font-semibold text-white">{t('languageSettings')}</h2>
                        <p className="text-sm text-slate-400 mt-1">{t('languageSettingsDesc')}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('selectLanguage')}
                    </label>

                    {/* Language Options */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleLanguageChange('en')}
                            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${language === 'en'
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">🇺🇸</span>
                                <div className="text-left">
                                    <div className="font-medium text-white">{t('english')}</div>
                                    <div className="text-xs text-slate-400">English</div>
                                </div>
                            </div>
                            {language === 'en' && (
                                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => handleLanguageChange('ja')}
                            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${language === 'ja'
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">🇯🇵</span>
                                <div className="text-left">
                                    <div className="font-medium text-white">{t('japanese')}</div>
                                    <div className="text-xs text-slate-400">日本語</div>
                                </div>
                            </div>
                            {language === 'ja' && (
                                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Success Message Section */}
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {t('languageChangedSuccess')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
