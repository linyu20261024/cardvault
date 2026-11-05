import React from 'react';
import { Sparkles, AlertTriangle, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { CardRecord } from '../types/card';
import { calculateBillStatus, calculateAnnualFeeStatus } from '../utils/cardCalculations';
import { formatMoney } from '../utils/bankData';

interface SmartAlertBannerProps {
  cards: CardRecord[];
  privacyMode: boolean;
  onNavigateToCalendar: () => void;
  onNavigateToAnnualFee: () => void;
  onSelectCard: (card: CardRecord) => void;
}

export const SmartAlertBanner: React.FC<SmartAlertBannerProps> = ({
  cards,
  privacyMode,
  onNavigateToCalendar,
  onNavigateToAnnualFee,
  onSelectCard,
}) => {
  const creditCards = cards.filter(c => c.type === 'credit');

  if (creditCards.length === 0) {
    return null;
  }

  // 计算每张卡的还款和免息期
  const billStatuses = creditCards.map(c => ({
    card: c,
    bill: calculateBillStatus(c),
    fee: calculateAnnualFeeStatus(c.annualFee),
  }));

  // 1. 寻找今天刷卡免息期最长的信用卡
  const sortedByGracePeriod = [...billStatuses].sort(
    (a, b) => b.bill.todayGracePeriodDays - a.bill.todayGracePeriodDays
  );
  const bestCard = sortedByGracePeriod[0];

  // 2. 统计待还账单
  const unpaidBills = billStatuses.filter(item => !item.card.isBillPaid && item.card.currentBillAmount > 0);
  const totalUnpaidAmount = unpaidBills.reduce((acc, cur) => acc + cur.card.currentBillAmount, 0);
  
  // 3. 统计急需还款（<= 5天或逾期）
  const urgentBills = unpaidBills.filter(item => item.bill.daysUntilDue <= 5);

  // 4. 统计年费临期且未达标（<= 30天且未达标）
  const urgentAnnualFees = billStatuses.filter(item => item.fee.isUrgent);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      
      {/* 1. 今日最佳刷卡推荐 (Longest Grace Period) */}
      <div 
        onClick={() => bestCard && onSelectCard(bestCard.card)}
        className="group relative cursor-pointer overflow-hidden p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 hover:border-amber-500/50 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              今日最佳刷卡推荐
            </span>
          </div>
          <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-300">
            享 {bestCard.bill.todayGracePeriodDays} 天免息
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">
              {bestCard.card.bankName} · {bestCard.card.cardName}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              刚过账单日 ({bestCard.card.statementDay}号) · 下期还款 {bestCard.bill.dueDateStr}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 2. 信用卡账单还款日提醒 */}
      <div 
        onClick={onNavigateToCalendar}
        className={`group relative cursor-pointer overflow-hidden p-4 rounded-xl transition-all shadow-xs ${
          urgentBills.length > 0
            ? 'bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/50'
            : 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`p-1 rounded ${
              urgentBills.length > 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}>
              {urgentBills.length > 0 ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            </span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
              账单还款提醒
            </span>
          </div>
          <span className={`text-xs font-mono font-semibold ${
            urgentBills.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-500'
          }`}>
            {unpaidBills.length} 笔待还
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
              {privacyMode ? '¥ ****.**' : formatMoney(totalUnpaidAmount)}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              {urgentBills.length > 0 
                ? `⚠️ 有 ${urgentBills.length} 笔账单即将到期或已逾期` 
                : '近期无紧急到期账单，资金从容'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 3. 信用卡年费达标提醒 */}
      <div 
        onClick={onNavigateToAnnualFee}
        className={`group relative cursor-pointer overflow-hidden p-4 rounded-xl transition-all shadow-xs ${
          urgentAnnualFees.length > 0
            ? 'bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/50'
            : 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`p-1 rounded ${
              urgentAnnualFees.length > 0 ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}>
              <CreditCard className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
              年费达标预警
            </span>
          </div>
          <span className={`text-xs font-mono font-semibold ${
            urgentAnnualFees.length > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-500'
          }`}>
            {urgentAnnualFees.length > 0 ? `${urgentAnnualFees.length} 张需关注` : '状态正常'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              {urgentAnnualFees.length > 0 ? '30天内到期待达标' : '暂无临期年费风险'}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              {urgentAnnualFees.length > 0 
                ? `如 ${urgentAnnualFees[0].card.cardName} 还需继续刷免` 
                : '所有需刷免卡片进度正常或已达标'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

    </div>
  );
};
