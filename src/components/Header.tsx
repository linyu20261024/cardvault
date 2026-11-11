import React, { useState } from 'react';
import { 
  CreditCard, Shield, Eye, EyeOff, Lock, Unlock, Download, 
  Plus, Sun, Moon, Camera, Calendar, ShieldCheck, PieChart, 
  MoreVertical, X, Check
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ================= TOP APP BAR ================= */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-8 h-14 sm:h-16">
            
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 shadow-sm">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
                  CardVault
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  卡管家
                </span>
              </div>
            </div>

            {/* Zone 2: Desktop Navigation Links (single-line, clean unboxed tabs) */}
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

            {/* Zone 3: Desktop Utilities & Actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
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

            {/* Mobile Header Right Slot (Compact, touch-friendly, no overflow) */}
            <div className="flex md:hidden items-center gap-1.5 shrink-0">
              {/* Photo OCR Scan Button */}
              <button
                onClick={onOpenCardScan}
                title="拍卡提取"
                className="h-9 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-xs active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>拍卡</span>
              </button>

              {/* Manual Add Card */}
              <button
                onClick={onOpenNewCard}
                title="手动添加卡片"
                className="h-9 px-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>添加</span>
              </button>

              {/* Mobile Tools Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                title="实用工具与设置"
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors active:scale-95 ${
                  mobileMenuOpen
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                aria-label="Mobile Tools Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Tools Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-xl transition-all">
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Privacy Mode Toggle */}
              <button
                onClick={() => {
                  onTogglePrivacy();
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
                  privacyMode
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {privacyMode ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
                <div className="text-left">
                  <div className="font-bold">{privacyMode ? '隐私保护已开' : '明文显示模式'}</div>
                  <div className="text-[10px] text-neutral-400">隐藏卡号与金额</div>
                </div>
              </button>

              {/* PIN Screen Lock */}
              <button
                onClick={() => {
                  onLockApp();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 font-medium transition-colors"
              >
                {hasPin ? <Lock className="w-4 h-4 text-emerald-500" /> : <Shield className="w-4 h-4" />}
                <div className="text-left">
                  <div className="font-bold">{hasPin ? '立即锁屏' : '设置访问锁'}</div>
                  <div className="text-[10px] text-neutral-400">{hasPin ? 'PIN已启用' : '防他人查看'}</div>
                </div>
              </button>

              {/* Data Import / Export */}
              <button
                onClick={() => {
                  onOpenDataModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-bold">数据导入与备份</div>
                  <div className="text-[10px] text-neutral-400">Excel / JSON</div>
                </div>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 font-medium transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <div className="text-left">
                  <div className="font-bold">{isDark ? '切换浅色模式' : '切换深色模式'}</div>
                  <div className="text-[10px] text-neutral-400">界面明暗风格</div>
                </div>
              </button>

            </div>
          </div>
        )}
      </header>

      {/* ================= FIXED MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 md:hidden transition-colors"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-4 items-center h-14">
          
          {/* Tab 1: Cards */}
          <button
            onClick={() => onSelectTab('cards')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'cards'
                ? 'text-neutral-900 dark:text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <div className="relative">
              <CreditCard className="w-5 h-5" />
              {totalCardsCount > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1 min-w-[14px] h-3.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-mono font-bold flex items-center justify-center leading-none">
                  {totalCardsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">卡片</span>
          </button>

          {/* Tab 2: Calendar */}
          <button
            onClick={() => onSelectTab('calendar')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'calendar'
                ? 'text-neutral-900 dark:text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">还款日历</span>
          </button>

          {/* Tab 3: Annual Fee */}
          <button
            onClick={() => onSelectTab('annual_fee')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'annual_fee'
                ? 'text-neutral-900 dark:text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">年费刷免</span>
          </button>

          {/* Tab 4: Stats */}
          <button
            onClick={() => onSelectTab('stats')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'stats'
                ? 'text-neutral-900 dark:text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <PieChart className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">资产概览</span>
          </button>

        </div>
      </nav>
    </>
  );
};
