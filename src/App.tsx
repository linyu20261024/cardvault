/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, LayoutGrid, List, Plus, CreditCard, 
  ArrowUpDown, X, Sparkles, AlertCircle, ShieldCheck
} from 'lucide-react';
import { CardRecord, ViewTab, FilterType } from './types/card';
import { 
  getStoredCards, saveStoredCards, getStoredSettings, 
  saveStoredSettings, SAMPLE_CARDS 
} from './utils/storage';
import { calculateBillStatus, calculateAnnualFeeStatus } from './utils/cardCalculations';
import { POPULAR_BANKS } from './utils/bankData';

// Components
import { Header } from './components/Header';
import { SmartAlertBanner } from './components/SmartAlertBanner';
import { CardVisual } from './components/CardVisual';
import { CardTableView } from './components/CardTableView';
import { AnnualFeeTracker } from './components/AnnualFeeTracker';
import { BillCalendarView } from './components/BillCalendarView';
import { StatsOverview } from './components/StatsOverview';
import { CardModal } from './components/CardModal';
import { CardDetailModal } from './components/CardDetailModal';
import { CardScanModal } from './components/CardScanModal';
import { QuickSwipeModal } from './components/QuickSwipeModal';
import { QuickRepayModal } from './components/QuickRepayModal';
import { DataManagementModal } from './components/DataManagementModal';
import { PinLockModal } from './components/PinLockModal';

export default function App() {
  const [cards, setCards] = useState<CardRecord[]>(() => getStoredCards());
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  // Navigation
  const [currentTab, setCurrentTab] = useState<ViewTab>('cards');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'grace_period' | 'due_date' | 'limit_desc' | 'bill_desc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardRecord | null>(null);

  const [selectedDetailCard, setSelectedDetailCard] = useState<CardRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [swipeModalCard, setSwipeModalCard] = useState<CardRecord | null>(null);
  const [isSwipeModalOpen, setIsSwipeModalOpen] = useState(false);

  const [repayModalCard, setRepayModalCard] = useState<CardRecord | null>(null);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Handle card persistence
  const updateCards = (newCards: CardRecord[]) => {
    setCards(newCards);
    saveStoredCards(newCards);
  };

  const handleSaveCard = (card: CardRecord) => {
    const index = cards.findIndex(c => c.id === card.id);
    let updated: CardRecord[];
    if (index >= 0) {
      updated = [...cards];
      updated[index] = card;
    } else {
      updated = [card, ...cards];
    }
    updateCards(updated);
    if (selectedDetailCard?.id === card.id) {
      setSelectedDetailCard(card);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = cards.filter(c => c.id !== cardId);
    updateCards(updated);
  };

  // Toggle privacy mode
  const handleTogglePrivacy = () => {
    const newSettings = saveStoredSettings({ privacyMode: !settings.privacyMode });
    setSettings(newSettings);
  };

  // Toggle theme
  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const newSettings = saveStoredSettings({ theme: newTheme });
    setSettings(newSettings);
  };

  // Lock App
  const handleLockApp = () => {
    if (!settings.pinCode) {
      setIsPinModalOpen(true);
    } else {
      const newSettings = saveStoredSettings({ isLocked: true });
      setSettings(newSettings);
    }
  };

  // Set PIN
  const handleSetPin = (newPin: string | undefined) => {
    const newSettings = saveStoredSettings({ pinCode: newPin, isLocked: false });
    setSettings(newSettings);
  };

  const handleUnlock = () => {
    const newSettings = saveStoredSettings({ isLocked: false });
    setSettings(newSettings);
  };

  // Best card to swipe today (longest grace period)
  const bestCardToSwipeId = useMemo(() => {
    const creditCards = cards.filter(c => c.type === 'credit');
    if (creditCards.length === 0) return null;
    const scored = creditCards.map(c => ({
      id: c.id,
      days: calculateBillStatus(c).todayGracePeriodDays
    }));
    scored.sort((a, b) => b.days - a.days);
    return scored[0]?.id || null;
  }, [cards]);

  // Search & Filtering logic
  const filteredCards = useMemo(() => {
    let result = [...cards];

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c => {
        const matchBank = c.bankName.toLowerCase().includes(q);
        const matchName = c.cardName.toLowerCase().includes(q);
        const matchNum = c.cardNumber.toLowerCase().includes(q);
        const matchHolder = (c.cardholder || '').toLowerCase().includes(q);
        const matchOrg = (c.organization || '').toLowerCase().includes(q);
        const matchNotes = (c.notes || '').toLowerCase().includes(q);
        return matchBank || matchName || matchNum || matchHolder || matchOrg || matchNotes;
      });
    }

    // 2. Type / Status Filter
    if (filterType === 'credit') {
      result = result.filter(c => c.type === 'credit');
    } else if (filterType === 'debit') {
      result = result.filter(c => c.type === 'debit');
    } else if (filterType === 'unpaid') {
      result = result.filter(c => c.type === 'credit' && !c.isBillPaid && c.currentBillAmount > 0);
    } else if (filterType === 'annual_pending') {
      result = result.filter(c => {
        if (c.type !== 'credit') return false;
        const status = calculateAnnualFeeStatus(c.annualFee);
        return status.status === 'in_progress' || status.status === 'urgent' || status.status === 'warning';
      });
    } else if (filterType === 'due_soon') {
      result = result.filter(c => {
        if (c.type !== 'credit') return false;
        const bill = calculateBillStatus(c);
        return !c.isBillPaid && (bill.status === 'due_soon' || bill.status === 'due_today' || bill.status === 'overdue');
      });
    }

    // 3. Bank Filter
    if (selectedBank !== 'all') {
      result = result.filter(c => c.bankName === selectedBank);
    }

    // 4. Sorting
    if (sortBy === 'grace_period') {
      result.sort((a, b) => {
        const da = a.type === 'credit' ? calculateBillStatus(a).todayGracePeriodDays : 0;
        const db = b.type === 'credit' ? calculateBillStatus(b).todayGracePeriodDays : 0;
        return db - da;
      });
    } else if (sortBy === 'due_date') {
      result.sort((a, b) => {
        const da = a.type === 'credit' ? calculateBillStatus(a).daysUntilDue : 999;
        const db = b.type === 'credit' ? calculateBillStatus(b).daysUntilDue : 999;
        return da - db;
      });
    } else if (sortBy === 'limit_desc') {
      result.sort((a, b) => (b.creditLimit || b.balance || 0) - (a.creditLimit || a.balance || 0));
    } else if (sortBy === 'bill_desc') {
      result.sort((a, b) => (b.currentBillAmount || 0) - (a.currentBillAmount || 0));
    }

    return result;
  }, [cards, searchQuery, filterType, selectedBank, sortBy]);

  // Open detail modal helper
  const handleOpenDetails = (card: CardRecord) => {
    setSelectedDetailCard(card);
    setIsDetailModalOpen(true);
  };

  // Open quick swipe modal helper
  const handleQuickSwipe = (card: CardRecord) => {
    setSwipeModalCard(card);
    setIsSwipeModalOpen(true);
  };

  // Open quick repay modal helper
  const handleQuickRepay = (card: CardRecord) => {
    setRepayModalCard(card);
    setIsRepayModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors pb-16">
      
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        privacyMode={settings.privacyMode}
        onTogglePrivacy={handleTogglePrivacy}
        onOpenNewCard={() => {
          setEditingCard(null);
          setIsCardModalOpen(true);
        }}
        onOpenCardScan={() => setIsScanModalOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        hasPin={Boolean(settings.pinCode)}
        onLockApp={handleLockApp}
        isDark={settings.theme === 'dark'}
        onToggleTheme={handleToggleTheme}
        totalCardsCount={cards.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Smart Alert Banner across tabs */}
        <SmartAlertBanner
          cards={cards}
          privacyMode={settings.privacyMode}
          onNavigateToCalendar={() => setCurrentTab('calendar')}
          onNavigateToAnnualFee={() => setCurrentTab('annual_fee')}
          onSelectCard={handleOpenDetails}
        />

        {/* ================= VIEW 1: CARDS SEARCH & VAULT ================= */}
        {currentTab === 'cards' && (
          <div className="space-y-5">
            
            {/* Search, Filters & View Toggle Bar */}
            <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
              
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative w-full md:flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="输入银行名称、卡片别名、卡号后4位或持卡人姓名搜索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Bank Select & Sort Dropdowns */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 focus:outline-hidden whitespace-nowrap shrink-0"
                  >
                    <option value="all">所有发卡银行</option>
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 focus:outline-hidden whitespace-nowrap shrink-0"
                  >
                    <option value="default">默认排列</option>
                    <option value="grace_period">按今日免息期 (长到短)</option>
                    <option value="due_date">按还款截止 (近到远)</option>
                    <option value="limit_desc">按额度/余额 (高到低)</option>
                    <option value="bill_desc">按本期账单 (多到少)</option>
                  </select>

                  {/* Grid / Table View toggle */}
                  <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      title="3D拟真卡包视图"
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      title="高密度表格视图"
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'table'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Segmented Filter Bar (functional buttons) */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs font-medium">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterType === 'all'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  全部卡片 ({cards.length})
                </button>
                <button
                  onClick={() => setFilterType('credit')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterType === 'credit'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  信用卡 ({cards.filter(c => c.type === 'credit').length})
                </button>
                <button
                  onClick={() => setFilterType('debit')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterType === 'debit'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  储蓄卡 ({cards.filter(c => c.type === 'debit').length})
                </button>
                <button
                  onClick={() => setFilterType('unpaid')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterType === 'unpaid'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  待还账单
                </button>
                <button
                  onClick={() => setFilterType('due_soon')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterType === 'due_soon'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  5天内到期 / 逾期
                </button>
                <button
                  onClick={() => setFilterType('annual_pending')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterType === 'annual_pending'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  年费待达标
                </button>
              </div>

            </div>

            {/* Results Count & Empty State */}
            {filteredCards.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <CreditCard className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                  未匹配到相关银行卡
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  没有找到符合当前搜索条件 “{searchQuery}” 或筛选维度的卡片信息。
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setSelectedBank('all');
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    重置所有筛选条件
                  </button>
                  <button
                    onClick={() => setIsScanModalOpen(true)}
                    className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 text-neutral-950 text-xs font-semibold shadow-xs transition-colors"
                  >
                    📷 拍照提取卡片
                  </button>
                  <button
                    onClick={() => {
                      setEditingCard(null);
                      setIsCardModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    + 手动录入
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* 3D Physical Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCards.map((card) => (
                  <CardVisual
                    key={card.id}
                    card={card}
                    privacyMode={settings.privacyMode}
                    onOpenDetails={handleOpenDetails}
                    onQuickSwipe={handleQuickSwipe}
                    onQuickRepay={handleQuickRepay}
                    isBestToSwipe={card.id === bestCardToSwipeId}
                  />
                ))}
              </div>
            ) : (
              /* High Density Table View */
              <CardTableView
                cards={filteredCards}
                privacyMode={settings.privacyMode}
                onOpenDetails={handleOpenDetails}
                onQuickSwipe={handleQuickSwipe}
                onQuickRepay={handleQuickRepay}
                onDeleteCard={handleDeleteCard}
              />
            )}

          </div>
        )}

        {/* ================= VIEW 2: BILL CALENDAR & REPAYMENT TIMELINE ================= */}
        {currentTab === 'calendar' && (
          <BillCalendarView
            cards={cards}
            privacyMode={settings.privacyMode}
            onQuickRepay={handleQuickRepay}
            onOpenDetails={handleOpenDetails}
          />
        )}

        {/* ================= VIEW 3: ANNUAL FEE TRACKER ================= */}
        {currentTab === 'annual_fee' && (
          <AnnualFeeTracker
            cards={cards}
            onQuickSwipe={handleQuickSwipe}
            onOpenDetails={handleOpenDetails}
          />
        )}

        {/* ================= VIEW 4: STATS OVERVIEW ================= */}
        {currentTab === 'stats' && (
          <StatsOverview
            cards={cards}
            privacyMode={settings.privacyMode}
          />
        )}

      </main>

      {/* ================= MODAL DIALOGS ================= */}

      {/* 1. Add / Edit Card Modal */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        initialCard={editingCard}
      />

      {/* 2. Card Detail Modal with Flip Card & Logs */}
      <CardDetailModal
        card={selectedDetailCard}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailCard(null);
        }}
        privacyMode={settings.privacyMode}
        onEditCard={(card) => {
          setEditingCard(card);
          setIsCardModalOpen(true);
        }}
        onDeleteCard={handleDeleteCard}
        onQuickSwipe={handleQuickSwipe}
        onQuickRepay={handleQuickRepay}
      />

      {/* 3. Quick Swipe Log Modal (+1 for annual fee waiver) */}
      <QuickSwipeModal
        card={swipeModalCard}
        isOpen={isSwipeModalOpen}
        onClose={() => {
          setIsSwipeModalOpen(false);
          setSwipeModalCard(null);
        }}
        onSave={handleSaveCard}
      />

      {/* 4. Quick Repayment Modal */}
      <QuickRepayModal
        card={repayModalCard}
        isOpen={isRepayModalOpen}
        onClose={() => {
          setIsRepayModalOpen(false);
          setRepayModalCard(null);
        }}
        onSave={handleSaveCard}
      />

      {/* 5. Card Photo OCR Scan Modal (Confirm before import) */}
      <CardScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onConfirmImport={handleSaveCard}
      />

      {/* 6. Data Management & Backup Modal (JSON, CSV, Template) */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        cards={cards}
        onDataChanged={updateCards}
        onOpenCardScan={() => {
          setIsDataModalOpen(false);
          setIsScanModalOpen(true);
        }}
      />

      {/* 6. PIN Screen Lock & Setup Modal */}
      <PinLockModal
        isOpen={isPinModalOpen}
        isScreenLocked={settings.isLocked}
        currentPin={settings.pinCode}
        onClose={() => setIsPinModalOpen(false)}
        onSetPin={handleSetPin}
        onUnlock={handleUnlock}
      />

    </div>
  );
}
