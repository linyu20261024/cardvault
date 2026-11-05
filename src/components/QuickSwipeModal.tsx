import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CardRecord, SwipeTransaction } from '../types/card';

interface QuickSwipeModalProps {
  card: CardRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: CardRecord) => void;
}

export const QuickSwipeModal: React.FC<QuickSwipeModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !card) return null;

  const [amount, setAmount] = useState('10.00');
  const [merchant, setMerchant] = useState('日常小额消费');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const target = card.annualFee.targetSwipeCount || 6;
  const current = card.annualFee.currentSwipeCount || 0;
  const willBeWaived = (current + 1) >= target;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: SwipeTransaction = {
      id: `tx_${Date.now()}`,
      date,
      amount: Number(amount) || 0,
      merchant: merchant.trim() || '消费',
      note: note.trim(),
    };

    const updatedCard: CardRecord = {
      ...card,
      annualFee: {
        ...card.annualFee,
        currentSwipeCount: current + 1,
        currentSpendAmount: (card.annualFee.currentSpendAmount || 0) + (Number(amount) || 0),
      },
      swipeTransactions: [newTx, ...(card.swipeTransactions || [])],
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedCard);
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
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              记录刷卡 · 冲抵年费 ({card.bankName})
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
          
          {/* Progress Banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                本卡刷免进度: {current} / {target} 次
              </span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                刷完本次变更为: {current + 1} / {target} 次
              </span>
            </div>
            {willBeWaived ? (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🎉 记录此笔后，本卡次年年费即刻达成全免！</span>
              </div>
            ) : (
              <div className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-0.5">
                还需刷 {target - (current + 1)} 笔即可达成减免。
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              消费金额 (元)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-sm font-bold text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                商户或场景
              </label>
              <input
                type="text"
                placeholder="例如：微信支付、便利店、滴滴"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                消费日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              备注说明 (可选)
            </label>
            <input
              type="text"
              placeholder="例如：凑单、买早餐"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold shadow-xs"
            >
              确认登记 (+1刷卡)
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
