import React from 'react';
import { Copy, PlusCircle, Check, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { CardRecord } from '../types/card';
import { BANK_CONFIGS, formatCardNumber, formatMoney } from '../utils/bankData';
import { calculateBillStatus, calculateAnnualFeeStatus } from '../utils/cardCalculations';

interface CardTableViewProps {
  cards: CardRecord[];
  privacyMode: boolean;
  onOpenDetails: (card: CardRecord) => void;
  onQuickSwipe: (card: CardRecord) => void;
  onQuickRepay: (card: CardRecord) => void;
  onDeleteCard: (cardId: string) => void;
}

export const CardTableView: React.FC<CardTableViewProps> = ({
  cards,
  privacyMode,
  onOpenDetails,
  onQuickSwipe,
  onQuickRepay,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
      <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300 border-collapse">
        <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800 select-none">
          <tr>
            <th className="py-3 px-4">卡片与银行</th>
            <th className="py-3 px-3">类型</th>
            <th className="py-3 px-3">卡号</th>
            <th className="py-3 px-3 text-right">额度 / 余额</th>
            <th className="py-3 px-3 text-right">本期应还</th>
            <th className="py-3 px-3">账单 / 还款日</th>
            <th className="py-3 px-3 text-center">今日免息</th>
            <th className="py-3 px-3">年费刷免进度</th>
            <th className="py-3 px-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/80">
          {cards.map((card) => {
            const bankCfg = BANK_CONFIGS[card.bankName] || BANK_CONFIGS['其他银行'];
            const bill = calculateBillStatus(card);
            const fee = calculateAnnualFeeStatus(card.annualFee);
            const maskedNum = formatCardNumber(card.cardNumber, privacyMode);

            return (
              <tr 
                key={card.id} 
                className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                onClick={() => onOpenDetails(card)}
              >
                {/* 1. 卡片与银行 */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: bankCfg.logoColor }}
                    >
                      {bankCfg.shortName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span>{card.bankName}</span>
                        <span className="text-[10px] text-neutral-400">·</span>
                        <span>{card.cardName}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <span>{card.organization}</span>
                        {card.type === 'credit' && (
                          <span className={`text-[10px] px-1 py-0.2 rounded font-medium ${
                            card.isSharedLimit !== false 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            {card.isSharedLimit !== false ? '同行共享' : '独立额度'}
                          </span>
                        )}
                        {!privacyMode && card.cardholder && card.cardholder !== '本人' && (
                          <span>· {card.cardholder}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. 类型 */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                    card.type === 'credit'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {card.type === 'credit' ? '信用卡' : '储蓄卡'}
                  </span>
                </td>

                {/* 3. 卡号 */}
                <td className="py-3 px-3 whitespace-nowrap font-mono">
                  <div className="flex items-center gap-1.5">
                    <span>{maskedNum}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(card.cardNumber);
                      }}
                      title="复制完整卡号"
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-opacity"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                {/* 4. 额度 / 余额 */}
                <td className="py-3 px-3 text-right font-mono font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                  {card.type === 'credit' ? (
                    <div>
                      <div>{privacyMode ? '¥ ****' : formatMoney(card.creditLimit)}</div>
                      <div className="text-[10px] text-neutral-400">总信用额度</div>
                    </div>
                  ) : (
                    <div>
                      <div>{privacyMode ? '¥ ****' : formatMoney(card.balance)}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">可用余额</div>
                    </div>
                  )}
                </td>

                {/* 5. 本期应还 */}
                <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                  {card.type === 'credit' ? (
                    <div>
                      <div className={`font-semibold ${card.isBillPaid ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-white'}`}>
                        {privacyMode ? '¥ ****' : formatMoney(card.currentBillAmount)}
                      </div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] border ${bill.statusBadgeClass}`}>
                        {bill.statusText}
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>

                {/* 6. 账单 / 还款日 */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {card.type === 'credit' ? (
                    <div className="text-[11px]">
                      <div>账单日: 每月 <span className="font-mono font-semibold">{card.statementDay}</span> 号</div>
                      <div className="text-neutral-500">还款日: 每月 <span className="font-mono font-semibold">{card.dueDay}</span> 号</div>
                    </div>
                  ) : (
                    <span className="text-neutral-400">实时到账</span>
                  )}
                </td>

                {/* 7. 今日免息 */}
                <td className="py-3 px-3 text-center whitespace-nowrap font-mono">
                  {card.type === 'credit' ? (
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                      bill.todayGracePeriodDays >= 45 
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {bill.todayGracePeriodDays} 天
                    </span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>

                {/* 8. 年费刷免进度 */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {card.type === 'credit' ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${fee.statusBadgeClass}`}>
                          {fee.statusText}
                        </span>
                      </div>
                      {card.annualFee.feeType === 'swipeCount' && (
                        <div className="w-24 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${fee.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${fee.progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">终身免年费</span>
                  )}
                </td>

                {/* 9. 操作 */}
                <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {card.type === 'credit' && card.annualFee.feeType === 'swipeCount' && (
                      <button
                        onClick={() => onQuickSwipe(card)}
                        title="+1 记刷免"
                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    )}
                    {card.type === 'credit' && (
                      <button
                        onClick={() => onQuickRepay(card)}
                        title="记还款"
                        className="px-2 py-1 text-[11px] rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        记还款
                      </button>
                    )}
                    <button
                      onClick={() => onOpenDetails(card)}
                      title="查看详情"
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
