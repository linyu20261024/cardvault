import React, { useState } from 'react';
import { 
  X, Edit3, Trash2, Copy, Check, Phone, ShieldCheck, 
  Calendar, DollarSign, Clock, PlusCircle, CreditCard, ExternalLink, Sparkles
} from 'lucide-react';
import { CardRecord, CardTier } from '../types/card';
import { CardVisual } from './CardVisual';
import { 
  BANK_CONFIGS, formatMoney, formatCardNumber, 
  CARD_TIER_OPTIONS, getCardTierLabel, detectCardTierByBin 
} from '../utils/bankData';
import { calculateBillStatus, calculateAnnualFeeStatus } from '../utils/cardCalculations';

interface CardDetailModalProps {
  card: CardRecord | null;
  isOpen: boolean;
  onClose: () => void;
  privacyMode: boolean;
  onEditCard: (card: CardRecord) => void;
  onDeleteCard: (cardId: string) => void;
  onQuickSwipe: (card: CardRecord) => void;
  onQuickRepay: (card: CardRecord) => void;
  onUpdateCardTier?: (card: CardRecord, tier: CardTier) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  privacyMode,
  onEditCard,
  onDeleteCard,
  onQuickSwipe,
  onQuickRepay,
  onUpdateCardTier,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCvv, setCopiedCvv] = useState(false);
  const [copiedExpiry, setCopiedExpiry] = useState(false);
  const [revealCvv, setRevealCvv] = useState(false);
  const [revealNumber, setRevealNumber] = useState(!privacyMode);
  const [binMatchHint, setBinMatchHint] = useState<string | null>(null);

  if (!isOpen || !card) return null;

  const bankCfg = BANK_CONFIGS[card.bankName] || BANK_CONFIGS['其他银行'];
  const bill = calculateBillStatus(card);
  const fee = calculateAnnualFeeStatus(card.annualFee);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(card.cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCvv = () => {
    if (!card.cvv) return;
    navigator.clipboard.writeText(card.cvv);
    setCopiedCvv(true);
    setTimeout(() => setCopiedCvv(false), 2000);
  };

  const handleCopyExpiry = () => {
    const exp = `${card.expiryMonth}/${card.expiryYear}`;
    navigator.clipboard.writeText(exp);
    setCopiedExpiry(true);
    setTimeout(() => setCopiedExpiry(false), 2000);
  };

  const handleDelete = () => {
    if (confirm(`确定要从本地删除卡片【${card.bankName} · ${card.cardName}】吗？删除后不可撤回。`)) {
      onDeleteCard(card.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 shrink-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white truncate max-w-[240px] sm:max-w-md">
              {card.bankName} · {card.cardName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto text-xs">
          
          {/* 3D Visual Card Display */}
          <div className="max-w-md mx-auto">
            <CardVisual 
              card={card}
              privacyMode={privacyMode}
              onOpenDetails={() => {}}
              onQuickSwipe={() => onQuickSwipe(card)}
              onQuickRepay={() => onQuickRepay(card)}
              onUpdateCardTier={onUpdateCardTier}
              isBestToSwipe={bill.isBestCardToSwipeToday}
            />
          </div>

          {/* 卡片等级配置 & 卡BIN匹配 */}
          {onUpdateCardTier && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">卡片等级:</span>
                <div className="flex flex-wrap items-center gap-1">
                  {CARD_TIER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onUpdateCardTier(card, opt.value);
                        setBinMatchHint(`已设置为${opt.label}`);
                        setTimeout(() => setBinMatchHint(null), 2500);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        card.cardTier === opt.value
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                          : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {binMatchHint && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {binMatchHint}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const res = detectCardTierByBin(card.cardNumber, card.cardName);
                    onUpdateCardTier(card, res.tier);
                    setBinMatchHint(res.matchedDesc);
                    setTimeout(() => setBinMatchHint(null), 3500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-200/70 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 text-[11px] font-medium transition-colors whitespace-nowrap"
                >
                  按卡BIN识别 ({getCardTierLabel(card.cardTier)})
                </button>
              </div>
            </div>
          )}

          {/* 💳 Dedicated Card Security Credentials & CVV Section */}
          <div className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10 dark:from-amber-500/10 dark:to-amber-500/5 rounded-2xl border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="text-xs sm:text-sm">卡片凭证与安全码 (CVV/CVC)</span>
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                纯本地离线加密
              </span>
            </div>

            {/* 1. Full Card Number */}
            <div className="p-2.5 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] text-neutral-400">完整卡号 (16-19位)</div>
                <div className="font-mono font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm tracking-wider truncate">
                  {revealNumber ? card.cardNumber : formatCardNumber(card.cardNumber, true)}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setRevealNumber(!revealNumber)}
                  className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 transition-colors text-[11px] font-medium"
                >
                  {revealNumber ? '隐藏' : '显示'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white text-white font-medium transition-colors text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? '已复制' : '复制卡号'}</span>
                </button>
              </div>
            </div>

            {/* 2. CVV and Expiry Date Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
              
              {/* CVV Box with prominent reveal button */}
              <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-sans text-neutral-400 flex items-center gap-1">
                    <span>安全码 (CVV/CVC)</span>
                  </div>
                  <div className="text-base font-extrabold tracking-widest mt-0.5">
                    {card.cvv ? (
                      revealCvv ? (
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {card.cvv}
                        </span>
                      ) : (
                        <span className="text-neutral-500 tracking-wider">••••</span>
                      )
                    ) : (
                      <span className="text-neutral-400 text-xs font-normal font-sans">未录入</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {card.cvv ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setRevealCvv(!revealCvv)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                          revealCvv
                            ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300'
                            : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                        }`}
                      >
                        <span>{revealCvv ? '点击隐藏' : '点击取消隐藏'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyCvv}
                        title="复制 CVV 安全码"
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        {copiedCvv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditCard(card);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 text-xs font-medium"
                    >
                      + 录入CVV
                    </button>
                  )}
                </div>
              </div>

              {/* Expiry Date Box */}
              <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-sans text-neutral-400">有效期 (月/年)</div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                    {card.expiryMonth && card.expiryYear ? `${card.expiryMonth}/${card.expiryYear}` : '未设置'}
                  </div>
                </div>

                {card.expiryMonth && card.expiryYear && (
                  <button
                    type="button"
                    onClick={handleCopyExpiry}
                    className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 transition-colors text-[11px] font-sans flex items-center gap-1"
                  >
                    {copiedExpiry ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedExpiry ? '已复制' : '复制'}</span>
                  </button>
                )}
              </div>

            </div>

            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
              💡 隐私安全说明：安全码与卡号纯本地保存在浏览器缓存中，不会被传输至外部服务器，离线断网状态下仍可查验。
            </div>
          </div>

          {/* Detailed Financial & Reminders for Credit Cards */}
          {card.type === 'credit' && (
            <div className="space-y-4">
              
              {/* 1. 账单与还款信息 */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span>账单与还款状态</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${bill.statusBadgeClass}`}>
                    {bill.statusText}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                  <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="text-[10px] text-neutral-400 flex items-center justify-between">
                      <span>总信用额度</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-sans font-medium">
                        {card.isSharedLimit !== false ? '同行共享' : '独立额度'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                      {privacyMode ? '¥ ****' : formatMoney(card.creditLimit)}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="text-[10px] text-neutral-400">本期应还</div>
                    <div className={`text-sm font-bold mt-0.5 ${card.isBillPaid ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-white'}`}>
                      {privacyMode ? '¥ ****' : formatMoney(card.currentBillAmount)}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="text-[10px] text-neutral-400">账单日</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                      每月{card.statementDay}号
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="text-[10px] text-neutral-400 flex items-center justify-between">
                      <span>还款截止日</span>
                      {bill.isCrossMonth && (
                        <span className="text-[9px] px-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                          跨月
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {bill.dueDateStr}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate" title={bill.ruleDescription}>
                      {bill.dueDateDisplay}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-500">
                    今日刷卡享 <strong className="text-neutral-900 dark:text-white font-mono">{bill.todayGracePeriodDays} 天</strong> 免息期
                  </span>
                  <button
                    onClick={() => onQuickRepay(card)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                  >
                    {card.isBillPaid ? '修改还款记录' : '一键记还款'}
                  </button>
                </div>
              </div>

              {/* 2. 年费减免政策追踪 */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>年费减免政策追踪</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${fee.statusBadgeClass}`}>
                    {fee.statusText}
                  </span>
                </div>

                <div className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {fee.advice}
                </div>

                {card.annualFee.notes && (
                  <div className="text-[11px] text-neutral-400 bg-white/60 dark:bg-neutral-900/60 p-2 rounded border border-neutral-200/40 dark:border-neutral-700/40">
                    <strong>规则备注: </strong>{card.annualFee.notes}
                  </div>
                )}

                {/* 刷卡记录列表 */}
                {card.annualFee.feeType === 'swipeCount' && (
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        刷卡达标明细记录 ({card.swipeTransactions?.length || 0} 笔)
                      </span>
                      <button
                        onClick={() => onQuickSwipe(card)}
                        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ 记一笔消费</span>
                      </button>
                    </div>

                    {card.swipeTransactions && card.swipeTransactions.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {card.swipeTransactions.map((tx) => (
                          <div 
                            key={tx.id} 
                            className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between font-mono text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400">{tx.date}</span>
                              <span className="font-sans font-medium text-neutral-800 dark:text-neutral-200">{tx.merchant || '日常消费'}</span>
                            </div>
                            <div className="font-semibold text-neutral-900 dark:text-white">
                              ¥{tx.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-neutral-400 text-[11px]">
                        暂无单笔刷卡明细，点击右上角快速记一笔
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* Debit card balance info */}
          {card.type === 'debit' && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="text-neutral-500">储蓄借记卡可用活期余额</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {privacyMode ? '¥ ****.**' : formatMoney(card.balance)}
              </div>
              <div className="text-[11px] text-neutral-400">
                此卡免收账户小额管理费和年费，可作为还款主绑定卡。
              </div>
            </div>
          )}

          {/* Notes and Bank contact */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">客服热线</span>
              <a 
                href={`tel:${card.phoneBank || bankCfg.phone}`}
                className="font-mono font-bold text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>{card.phoneBank || bankCfg.phone || '955xx'}</span>
              </a>
            </div>

            {card.notes && (
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">私密备忘: </span>
                <span className="text-neutral-600 dark:text-neutral-400">{card.notes}</span>
              </div>
            )}
          </div>

        </div>

        {/* Sticky Actions Footer: Edit & Delete */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-50/90 dark:bg-neutral-850/90 backdrop-blur-xs">
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>删除此卡</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEditCard(card);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>编辑卡片信息</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
