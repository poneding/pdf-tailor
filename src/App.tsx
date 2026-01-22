import { useState } from 'react';
import { MergePanel, SplitPanel, ThemeSelector, LanguageSelector } from './components';
import { Scissors, Combine, FileText } from 'lucide-react';
import { useTranslation } from './i18n';

type TabType = 'split' | 'merge';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('split');
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('app.title')}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700 transition-colors duration-200">
          <div className="flex border-b dark:border-gray-700">
            <button
              onClick={() => setActiveTab('split')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'split'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Scissors className="w-5 h-5" />
                {t('tabs.split')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('merge')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'merge'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Combine className="w-5 h-5" />
                {t('tabs.merge')}
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'split' ? <SplitPanel /> : <MergePanel />}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t('app.tagline')}</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
