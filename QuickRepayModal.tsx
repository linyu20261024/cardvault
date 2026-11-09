import React, { useState } from 'react';
import { X, Check, DollarSign, Calendar } from 'lucide-react';
import { CardRecord } from '../types/card';
import { formatMoney } from '../utils/bankData';

interface QuickRepayModalProps {
  card: CardRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: CardRecord) => void;
}

export const QuickRepayModal: React.FC<QuickRepayModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !card) return null;

  const [repayAmount, setRepayAmount] = useState(String(card.currentBillAmount || '0'));
  const [isFullPayment, setIsFullPayment] = useState(true);
  const [repayDate, setRepayDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = Number(repayAmount) || 0;
    
    let newBillAmount = card.currentBillAmount;
    let newIsBillPaid = card.isBillPaid;

    if (isFullPayment || paid >= card.currentBillAmount) {
      newBillAmount = 0;
      newIsBillPaid = true;
    } else {
      newBillAmount = Math.max(0, card.currentBillAmount - paid);
      newIsBillPaid = newBillAmount === 0;
    }

    const updated: CardRecord = {
      ...card,
      currentBillAmount: newBillAmount,
      isBillPaid: newIsBillPaid,
      lastPaidDate: repayDate,
      lastPaidAmount: paid,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              登记账单还款 · {card.bankName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-neutral-500">
              <span>本期应还款总额</span>
              <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                {formatMoney(card.currentBillAmount)}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              每月账单日: {card.statementDay}号 · 还款日: 每月{card.dueDay}号
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              本次还款金额 (元)
            </label>
            <input
              type="number"
              step="0.01"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-base font-bold text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fullPayCheck"
              checked={isFullPayment}
              onChange={(e) => {
                setIsFullPayment(e.target.checked);
                if (e.target.checked) setRepayAmount(String(card.currentBillAmount));
              }}
              className="rounded text-neutral-900"
            />
            <label htmlFor="fullPayCheck" className="text-neutral-700 dark:text-neutral-300 font-medium select-none">
              标记为全额还清（将应还账单归零）
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              还款日期
            </label>
            <input
              type="date"
              value={repayDate}
              onChange={(e) => setRepayDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
            >
              确认还款
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
