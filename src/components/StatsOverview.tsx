import React from 'react';
import { 
  PieChart, Wallet, CreditCard, ArrowUpRight, ShieldCheck, 
  TrendingUp, AlertCircle, Building2, Share2, Info 
} from 'lucide-react';
import { CardRecord } from '../types/card';
import { formatMoney, BANK_CONFIGS } from '../utils/bankData';
import { calculateBankCreditSummaries } from '../utils/cardCalculations';

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

  // 计算智能银行共享额度汇总
  const creditOverview = calculateBankCreditSummaries(cards);
  const totalDebitSavings = debitCards.reduce((acc, c) => acc + (c.balance || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          额度与资产全景统计
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          支持国内银行信用卡「同行额度共享」智能去重合并，真实还原央行征信授信总额与负债率。
        </p>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Credit Limit (Real Deduplicated Effective Limit) */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
              <span>真实总授信</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] rounded font-medium">已合并共享</span>
            </span>
            <CreditCard className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {privacyMode ? '¥ ****' : formatMoney(creditOverview.effectiveTotalLimit)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>涵盖 {creditCards.length} 张信用卡</span>
            {creditOverview.deductedSharedLimit > 0 && (
              <span className="text-neutral-500 text-[10px]" title="多卡共享去重额度">
                去重共享 {privacyMode ? '¥ ****' : formatMoney(creditOverview.deductedSharedLimit)}
              </span>
            )}
          </div>
        </div>

        {/* Current Debt */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>本期信用卡负债</span>
            <AlertCircle className={`w-4 h-4 ${creditOverview.totalDebt > 0 ? 'text-amber-500' : 'text-neutral-400'}`} />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {privacyMode ? '¥ ****' : formatMoney(creditOverview.totalDebt)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            剩余可用额度 {privacyMode ? '¥ ****' : formatMoney(creditOverview.availableCredit)}
          </div>
        </div>

        {/* Real Credit Utilization Rate */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>真实授信使用率</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono ${
              creditOverview.utilizationRate > 70 
                ? 'text-rose-600 dark:text-rose-400' 
                : creditOverview.utilizationRate > 50 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {creditOverview.utilizationRate}%
            </span>
            <span className="text-[11px] text-neutral-500">
              {creditOverview.utilizationRate < 50 ? '负债优良 (<50%)' : '负债偏高'}
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${
                creditOverview.utilizationRate > 70 ? 'bg-rose-500' : creditOverview.utilizationRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, creditOverview.utilizationRate)}%` }}
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

      {/* 3. 额度共享提示横幅 */}
      <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-neutral-900 dark:text-white">为什么需要“同行共享额度”？</strong>
          在国内，同一银行名下的多张信用卡默认共享同一综合授信额度（例如您在招商银行拥有 3 张卡，额度均为 6 万元，在招行的实际可用总额度是 <strong>¥60,000</strong> 而非 18 万元）。系统已自动识别并合并同一银行的共享额度，名义单卡累加总额为 <strong>{privacyMode ? '¥ ****' : formatMoney(creditOverview.nominalTotalLimit)}</strong>，真实综合授信为 <strong>{privacyMode ? '¥ ****' : formatMoney(creditOverview.effectiveTotalLimit)}</strong>。
        </div>
      </div>

      {/* 4. Bank Credit Distribution with Shared Limit Details */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neutral-500" />
            <span>各银行授信额度与共享明细</span>
          </h3>
          <span className="text-[11px] text-neutral-400">
            共 {creditOverview.bankSummaries.length} 家授信发卡行
          </span>
        </div>

        <div className="space-y-4">
          {creditOverview.bankSummaries.map((summary) => {
            const cfg = BANK_CONFIGS[summary.bankName] || BANK_CONFIGS['其他银行'];
            const percentage = creditOverview.effectiveTotalLimit > 0 
              ? Math.round((summary.effectiveTotalLimit / creditOverview.effectiveTotalLimit) * 100) 
              : 0;

            const bankUtilization = summary.effectiveTotalLimit > 0
              ? Math.round((summary.currentDebt / summary.effectiveTotalLimit) * 100)
              : 0;

            return (
              <div key={`${summary.bankName}_${summary.cardholder}`} className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2.5">
                
                {/* Bank Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full inline-block shrink-0 shadow-xs" 
                      style={{ backgroundColor: cfg.logoColor }}
                    />
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">{summary.displayName || summary.bankName}</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-700/70 text-neutral-600 dark:text-neutral-300 text-[10px]">
                      {summary.cardCount} 张卡
                    </span>
                    {summary.sharedCardsCount > 1 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] flex items-center gap-1" title={`该行${summary.sharedCardsCount}张卡共享额度，已合并去重`}>
                        <Share2 className="w-3 h-3" />
                        <span>{summary.sharedCardsCount} 卡共享额度</span>
                        {summary.deductedSharedLimit > 0 && (
                          <span className="opacity-75 font-mono">
                            (去重 {privacyMode ? '¥ ****' : formatMoney(summary.deductedSharedLimit)})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      {privacyMode ? '¥ ****' : formatMoney(summary.effectiveTotalLimit)}
                      <span className="text-[11px] font-normal text-neutral-400 ml-1.5">({percentage}%)</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      本期已用: {privacyMode ? '¥ ****' : formatMoney(summary.currentDebt)} (已用 {bankUtilization}%)
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, bankUtilization)}%`,
                      backgroundColor: cfg.logoColor 
                    }}
                  />
                </div>

                {/* Cards List under this Bank */}
                <div className="pt-1.5 border-t border-neutral-200/60 dark:border-neutral-700/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                  {summary.cards.map(c => (
                    <div key={c.id} className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                          {c.cardName}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          *{c.cardNumber.slice(-4) || '****'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
                          {privacyMode ? '¥ ****' : formatMoney(c.creditLimit)}
                        </div>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                          c.isSharedLimit !== false
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {c.isSharedLimit !== false ? '共享' : '独立'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
