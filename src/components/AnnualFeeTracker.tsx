import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Clock, PlusCircle, CheckCircle2, 
  HelpCircle, CreditCard, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { CardRecord, AnnualFeeType } from '../types/card';
import { calculateAnnualFeeStatus } from '../utils/cardCalculations';
import { BANK_CONFIGS, formatMoney, getCardTierLabel } from '../utils/bankData';

interface AnnualFeeTrackerProps {
  cards: CardRecord[];
  onQuickSwipe: (card: CardRecord) => void;
  onOpenDetails: (card: CardRecord) => void;
}

export const AnnualFeeTracker: React.FC<AnnualFeeTrackerProps> = ({
  cards,
  onQuickSwipe,
  onOpenDetails,
}) => {
  const [feeFilter, setFeeFilter] = useState<'all' | AnnualFeeType>('all');
  const creditCards = cards.filter(c => c.type === 'credit');

  const cardStats = creditCards.map(c => ({
    card: c,
    status: calculateAnnualFeeStatus(c.annualFee),
  }));

  const waivedCount = cardStats.filter(c => c.status.status === 'waived' || c.status.status === 'lifetime_free').length;
  const inProgressCount = cardStats.filter(c => c.status.status === 'in_progress' || c.status.status === 'warning').length;
  const urgentCount = cardStats.filter(c => c.status.isUrgent).length;
  const fixedChargeCount = cardStats.filter(c => c.card.annualFee.feeType === 'fixedCharge').length;

  const filtered = cardStats.filter(item => {
    if (feeFilter === 'all') return true;
    return item.card.annualFee.feeType === feeFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Overview & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>信用卡年费达标追踪</span>
            <span className="text-xs px-2 py-0.5 rounded font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              共 {creditCards.length} 张信用卡
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            自动跟踪各卡核卡纪念日、刷卡次数与消费金额，防止因遗忘扣收大额年费。
          </p>
        </div>

        {/* Quick summary stat pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
            已达标: {waivedCount}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
            进行中: {inProgressCount}
          </div>
          {urgentCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold animate-pulse">
              ⚠️ 临期预警: {urgentCount}
            </div>
          )}
        </div>
      </div>

      {/* 2. Filter buttons (single-line controls) */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setFeeFilter('all')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            feeFilter === 'all'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          全部规则
        </button>
        <button
          onClick={() => setFeeFilter('swipeCount')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            feeFilter === 'swipeCount'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          刷满N次免
        </button>
        <button
          onClick={() => setFeeFilter('spendAmount')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            feeFilter === 'spendAmount'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          消费金额免
        </button>
        <button
          onClick={() => setFeeFilter('fixedCharge')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            feeFilter === 'fixedCharge'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          刚性扣收 ({fixedChargeCount})
        </button>
        <button
          onClick={() => setFeeFilter('points')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            feeFilter === 'points'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          积分兑换
        </button>
        <button
          onClick={() => setFeeFilter('lifetimeFree')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            feeFilter === 'lifetimeFree'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          终身免年费
        </button>
      </div>

      {/* 3. Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(({ card, status }) => {
          const bankCfg = BANK_CONFIGS[card.bankName] || BANK_CONFIGS['其他银行'];
          const policy = card.annualFee;

          return (
            <div 
              key={card.id}
              className={`p-5 rounded-xl border bg-white dark:bg-neutral-900 transition-all shadow-xs ${
                status.isUrgent
                  ? 'border-rose-500/40 bg-rose-500/[0.02]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                    style={{ backgroundColor: bankCfg.logoColor }}
                  >
                    {bankCfg.shortName.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>{card.bankName}</span>
                      <span className="text-neutral-400">·</span>
                      <span>{card.cardName}</span>
                    </div>
                    <div className="text-xs text-neutral-500 font-mono">
                      尾号 {card.cardNumber.slice(-4)} · {getCardTierLabel(card.cardTier)}
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${status.statusBadgeClass}`}>
                  {status.statusText}
                </span>
              </div>

              {/* Progress Display */}
              <div className="my-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                
                {policy.feeType === 'swipeCount' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                        刷卡免年费目标: {policy.currentSwipeCount} / {policy.targetSwipeCount} 次
                      </span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {status.progressPercent}%
                      </span>
                    </div>
                    {/* Visual Segmented Progress Bar */}
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          status.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${status.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {policy.feeType === 'spendAmount' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                        消费金额进度: ¥{policy.currentSpendAmount} / ¥{policy.targetSpendAmount}
                      </span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {status.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          status.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${status.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {policy.feeType === 'fixedCharge' && (
                  <div className="text-xs text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">刚性年费: </span>
                    <span>每年固定收取 ¥{policy.fixedChargeAmount} 元，无法通过刷卡减免。</span>
                  </div>
                )}

                {policy.feeType === 'points' && (
                  <div className="text-xs text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">积分抵扣: </span>
                    <span>需在扣费周期内准备 {policy.targetPoints} 积分兑换年费。</span>
                  </div>
                )}

                {policy.feeType === 'lifetimeFree' && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>该卡永久免年费，无需满足刷卡频次或消费指标。</span>
                  </div>
                )}

                {/* Advice / Reminder text */}
                <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-200/50 dark:border-neutral-700/50 pt-2">
                  {status.advice}
                </div>
              </div>

              {/* Due Date & Action Bar */}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <div>
                  {policy.feeDueDate ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>年费核算日:</span>
                      <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                        {policy.feeDueDate}
                      </span>
                      {status.daysRemaining !== 999 && (
                        <span className={`font-mono text-[11px] ${
                          status.daysRemaining <= 30 ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                        }`}>
                          (剩 {status.daysRemaining} 天)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>未设置核算日期</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {policy.feeType === 'swipeCount' && (
                    <button
                      onClick={() => onQuickSwipe(card)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>记一笔刷卡</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenDetails(card)}
                    className="px-2.5 py-1 text-xs font-medium rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                  >
                    规则设置
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
