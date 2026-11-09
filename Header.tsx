import { CreditCard, Shield, Eye, EyeOff, Lock, Unlock, Download, Plus, Sun, Moon, Camera } from 'lucide-react';
import { ViewTab } from '../types/card';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  onOpenNewCard: () => void;
  onOpenCardScan: () => void;
  onOpenDataModal: () => void;
  hasPin: boolean;
  onLockApp: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  totalCardsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  privacyMode,
  onTogglePrivacy,
  onOpenNewCard,
  onOpenCardScan,
  onOpenDataModal,
  hasPin,
  onLockApp,
  isDark,
  onToggleTheme,
  totalCardsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
                  CardVault
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  卡管家
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean unboxed tabs) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs font-medium">
            <button
              onClick={() => onSelectTab('cards')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'cards'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              全部卡片 ({totalCardsCount})
            </button>
            <button
              onClick={() => onSelectTab('calendar')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'calendar'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              账单还款日历
            </button>
            <button
              onClick={() => onSelectTab('annual_fee')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'annual_fee'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              年费刷免追踪
            </button>
            <button
              onClick={() => onSelectTab('stats')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'stats'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              额度与资产概览
            </button>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Privacy toggle */}
            <button
              onClick={onTogglePrivacy}
              title={privacyMode ? '隐私模式开启（隐藏卡号与金额）' : '隐私模式关闭'}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                privacyMode
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              aria-label="Toggle Privacy Mode"
            >
              {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden xl:inline">{privacyMode ? '隐私保护中' : '明文显示'}</span>
            </button>

            {/* Lock / PIN button */}
            <button
              onClick={onLockApp}
              title={hasPin ? '一键锁定应用' : '设置安全访问PIN码'}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Lock App"
            >
              {hasPin ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </button>

            {/* Import / Export Backup */}
            <button
              onClick={onOpenDataModal}
              title="本地数据导入与备份导出中心"
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
              aria-label="Import and Export Data"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xl:inline text-xs">导入/导出</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={isDark ? '切换到浅色模式' : '切换到深色模式'}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle Dark/Light Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Photo OCR Scan Button */}
            <button
              onClick={onOpenCardScan}
              title="拍摄或上传银行卡正面照片自动提取信息并确认导入"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:text-neutral-950 dark:hover:bg-amber-400 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>拍卡提取</span>
            </button>

            {/* Manual New Card Button */}
            <button
              onClick={onOpenNewCard}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>手动添加</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-neutral-200 dark:border-neutral-800 text-xs font-medium">
          <button
            onClick={() => onSelectTab('cards')}
            className={`py-1 px-2.5 rounded-md transition-colors ${
              currentTab === 'cards'
                ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                : 'text-neutral-500'
            }`}
          >
            卡片 ({totalCardsCount})
          </button>
          <button
            onClick={() => onSelectTab('calendar')}
            className={`py-1 px-2.5 rounded-md transition-colors ${
              currentTab === 'calendar'
                ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                : 'text-neutral-500'
            }`}
          >
            还款日历
          </button>
          <button
            onClick={() => onSelectTab('annual_fee')}
            className={`py-1 px-2.5 rounded-md transition-colors ${
              currentTab === 'annual_fee'
                ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                : 'text-neutral-500'
            }`}
          >
            年费刷免
          </button>
          <button
            onClick={() => onSelectTab('stats')}
            className={`py-1 px-2.5 rounded-md transition-colors ${
              currentTab === 'stats'
                ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                : 'text-neutral-500'
            }`}
          >
            资产统计
          </button>
        </div>

      </div>
    </header>
  );
};
