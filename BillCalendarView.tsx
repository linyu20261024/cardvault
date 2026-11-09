import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, AlertCircle, CheckCircle2, Clock, 
  Sparkles, ArrowRight, Check, DollarSign, ChevronRight
} from 'lucide-react';
import { CardRecord } from '../types/card';
import { calculateBillStatus } from '../utils/cardCalculations';
import { BANK_CONFIGS, formatMoney } from '../utils/bankData';

interface BillCalendarViewProps {
  cards: CardRecord[];
  privacyMode: boolean;
  onQuickRepay: (card: CardRecord) => void;
  onOpenDetails: (card: CardRecord) => void;
}

export const BillCalendarView: React.FC<BillCalendarViewProps> = ({
  cards,
  privacyMode,
  onQuickRepay,
  onOpenDetails,
}) => {
  const creditCards = cards.filter(c => c.type === 'credit');

  const cardBills = creditCards.map(c => ({
    card: c,
    bill: calculateBillStatus(c),
  }));

  // 按还款日倒计时升序排列（逾期最先，接着今日，接着最近到期）
  const sortedByDue = [...cardBills].sort((a, b) => {
    // 待还款排在前面，已还清排在后面
    if (a.card.isBillPaid !== b.card.isBillPaid) {
      return a.card.isBillPaid ? 1 : -1;
    }
    return a.bill.daysUntilDue - b.bill.daysUntilDue;
  });

  // 按今日免息期天数降序排列 (消费推荐)
  const sortedByGracePeriod = [...cardBills].sort(
    (a, b) => b.bill.todayGracePeriodDays - a.bill.todayGracePeriodDays
  );

  const unpaidCount = cardBills.filter(i => !i.card.isBillPaid && i.card.currentBillAmount > 0).length;
  const totalUnpaidAmount = cardBills
    .filter(i => !i.card.isBillPaid)
    .reduce((sum, cur) => sum + cur.card.currentBillAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Summary banner */}
      <div className="p-5 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/60 font-semibold flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>智能账单日历 & 还款计划</span>
          </div>
          <h2 className="text-xl font-bold mt-1">
            本期待还总额: {privacyMode ? '¥ ****.**' : formatMoney(totalUnpaidAmount)}
          </h2>
          <p className="text-xs text-white/70 mt-1">
            共 {creditCards.length} 张信用卡，当前有 <span className="text-amber-400 font-semibold">{unpaidCount} 笔</span> 账单待还。
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
            <div className="text-white/60">下个账单日</div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              {sortedByDue[0]?.bill.statementDateStr || '-'}
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
            <div className="text-white/60">最近还款日</div>
            <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
              {sortedByDue[0]?.bill.dueDateStr || '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= LEFT 2 COLUMNS: 待还款与账单时间轴 ================= */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>还款时间线</span>
              <span className="text-xs font-normal text-neutral-500">按到期日排序</span>
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              今天: {new Date().getMonth() + 1}月{new Date().getDate()}日
            </span>
          </div>

          <div className="space-y-3">
            {sortedByDue.map(({ card, bill }) => {
              const bankCfg = BANK_CONFIGS[card.bankName] || BANK_CONFIGS['其他银行'];
              
              return (
                <div 
                  key={card.id}
                  className={`p-4 rounded-xl border transition-all ${
                    card.isBillPaid
                      ? 'bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/70 dark:border-neutral-800 opacity-75'
                      : bill.status === 'overdue' || bill.status === 'due_today'
                      ? 'bg-rose-500/[0.04] border-rose-500/40 shadow-xs'
                      : bill.status === 'due_soon'
                      ? 'bg-orange-500/[0.04] border-orange-500/40 shadow-xs'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* Bank & Card info */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: bankCfg.logoColor }}
                      >
                        {bankCfg.shortName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                          <span>{card.bankName}</span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span>{card.cardName}</span>
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">尾号 {card.cardNumber.slice(-4)}</span>
                          <span>·</span>
                          <span>账单日 每月{card.statementDay}号</span>
                          <span>·</span>
                          <span>还款日 每月{card.dueDay}号</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Due Countdown */}
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${bill.statusBadgeClass}`}>
                        {bill.statusText}
                      </span>
                      <div className="text-xs text-neutral-500 mt-1 font-mono">
                        截止: {bill.dueDateStr}
                      </div>
                    </div>

                  </div>

                  {/* Amount & Actions row */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs text-neutral-500">本期应还:</span>
                      <span className={`text-base font-bold ${
                        card.isBillPaid ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-white'
                      }`}>
                        {privacyMode ? '¥ ****.**' : formatMoney(card.currentBillAmount)}
                      </span>
                      {card.isBillPaid && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" /> 已付清
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onQuickRepay(card)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          card.isBillPaid
                            ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        }`}
                      >
                        {card.isBillPaid ? '修改还款记录' : '一键记还款'}
                      </button>

                      <button
                        onClick={() => onOpenDetails(card)}
                        className="px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        详情
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT 1 COLUMN: 今日消费免息期推荐榜 ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>今日刷卡免息期榜</span>
            </h3>
            <span className="text-xs text-neutral-400">最长56天免息</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            💡 <strong>理财省钱小贴士:</strong> 在信用卡账单日的次日消费，可以享受将近两个月的全额免息期，资金可放在货币基金赚取收益！
          </div>

          <div className="space-y-2.5">
            {sortedByGracePeriod.map(({ card, bill }, index) => {
              const bankCfg = BANK_CONFIGS[card.bankName] || BANK_CONFIGS['其他银行'];
              const isFirst = index === 0;

              return (
                <div 
                  key={card.id}
                  onClick={() => onOpenDetails(card)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-amber-500/40 ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                        isFirst ? 'bg-amber-500 text-neutral-900' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-1">
                          <span>{card.bankName}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="truncate max-w-[110px]">{card.cardName}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          账单日 {card.statementDay}号 · 还款日 {card.dueDay}号
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono text-base font-bold ${
                        isFirst ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {bill.todayGracePeriodDays} <span className="text-xs font-normal">天</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {isFirst ? '今日消费首选' : '免息期'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
