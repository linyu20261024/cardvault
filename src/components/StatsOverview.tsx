import React from 'react';
import { 
  PieChart, Wallet, CreditCard, ArrowUpRight, ShieldCheck, 
  TrendingUp, AlertCircle, Building2 
} from 'lucide-react';
import { CardRecord } from '../types/card';
import { formatMoney, BANK_CONFIGS } from '../utils/bankData';

interface StatsOverviewProps {
  cards: CardRecord[];
  privacyMode: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  cards,
  privacyMode,
}) => {
  const creditCards = cards.filter(c => c.type === 'credit');
  const debitCards = cards.filter(c => c.type === 'debit');

  const totalCreditLimit = creditCards.reduce((acc, c) => acc + (c.creditLimit || 0), 0);
  const totalCreditDebt = creditCards.reduce((acc, c) => acc + (c.currentBillAmount || 0), 0);
  const totalDebitSavings = debitCards.reduce((acc, c) => acc + (c.balance || 0), 0);
  const availableCredit = Math.max(0, totalCreditLimit - totalCreditDebt);

  const utilizationRate = totalCreditLimit > 0 
    ? Math.round((totalCreditDebt / totalCreditLimit) * 100) 
    : 0;

  // 按银行分组统计额度
  const bankLimits: Record<string, { totalLimit: number; debt: number; count: number; color: string }> = {};
  creditCards.forEach(c => {
    const bank = c.bankName;
    const cfg = BANK_CONFIGS[bank] || BANK_CONFIGS['其他银行'];
    if (!bankLimits[bank]) {
      bankLimits[bank] = { totalLimit: 0, debt: 0, count: 0, color: cfg.logoColor };
    }
    bankLimits[bank].totalLimit += c.creditLimit || 0;
    bankLimits[bank].debt += c.currentBillAmount || 0;
    bankLimits[bank].count += 1;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          额度与资产全景统计
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          纯本地实时计算您的信用卡总授信、负债率与储蓄卡流动性资产，辅助优化个人征信负债。
        </p>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Credit Limit */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>总授信额度</span>
            <CreditCard className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {privacyMode ? '¥ ****' : formatMoney(totalCreditLimit)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            涵盖 {creditCards.length} 张信用卡
          </div>
        </div>

        {/* Current Debt */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>本期信用卡负债</span>
            <AlertCircle className={`w-4 h-4 ${totalCreditDebt > 0 ? 'text-amber-500' : 'text-neutral-400'}`} />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {privacyMode ? '¥ ****' : formatMoney(totalCreditDebt)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            剩余可用额度 {privacyMode ? '¥ ****' : formatMoney(availableCredit)}
          </div>
        </div>

        {/* Credit Utilization */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>授信使用率</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono ${
              utilizationRate > 70 
                ? 'text-rose-600 dark:text-rose-400' 
                : utilizationRate > 50 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {utilizationRate}%
            </span>
            <span className="text-[11px] text-neutral-500">
              {utilizationRate < 50 ? '优良 (<50%)' : '偏高'}
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${
                utilizationRate > 70 ? 'bg-rose-500' : utilizationRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, utilizationRate)}%` }}
            />
          </div>
        </div>

        {/* Debit Card Savings */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>储蓄卡流动资金</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {privacyMode ? '¥ ****' : formatMoney(totalDebitSavings)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            涵盖 {debitCards.length} 张储蓄卡
          </div>
        </div>

      </div>

      {/* 3. Bank Credit Distribution */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-neutral-500" />
          <span>各银行授信额度分布</span>
        </h3>

        <div className="space-y-3">
          {Object.entries(bankLimits).map(([bank, data]) => {
            const percentage = totalCreditLimit > 0 
              ? Math.round((data.totalLimit / totalCreditLimit) * 100) 
              : 0;

            return (
              <div key={bank} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block" 
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="font-semibold text-neutral-900 dark:text-white">{bank}</span>
                    <span className="text-neutral-400">({data.count}张)</span>
                  </div>
                  <div className="font-mono text-neutral-800 dark:text-neutral-200">
                    {privacyMode ? '¥ ****' : formatMoney(data.totalLimit)} ({percentage}%)
                  </div>
                </div>

                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: data.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
