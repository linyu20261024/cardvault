import React, { useState } from 'react';
import { 
  Copy, Check, RotateCw, Phone, ShieldCheck, 
  PlusCircle, CreditCard as CardIcon, Eye, EyeOff, MoreHorizontal
} from 'lucide-react';
import { CardRecord } from '../types/card';
import { BANK_CONFIGS, THEME_GRADIENTS, formatCardNumber, formatMoney } from '../utils/bankData';
import { calculateBillStatus, calculateAnnualFeeStatus } from '../utils/cardCalculations';

interface CardVisualProps {
  card: CardRecord;
  privacyMode: boolean;
  onOpenDetails: (card: CardRecord) => void;
  onQuickSwipe: (card: CardRecord) => void;
  onQuickRepay: (card: CardRecord) => void;
  isBestToSwipe?: boolean;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  card,
  privacyMode,
  onOpenDetails,
  onQuickSwipe,
  onQuickRepay,
  isBestToSwipe = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealCvv, setRevealCvv] = useState(false);

  const bankCfg = BANK_CONFIGS[card.bankName] || BANK_CONFIGS['其他银行'];
  const theme = THEME_GRADIENTS.find(t => t.id === card.cardColorTheme) || THEME_GRADIENTS[0];
  
  const billInfo = calculateBillStatus(card);
  const feeInfo = calculateAnnualFeeStatus(card.annualFee);

  const handleCopyNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(card.cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedNumber = formatCardNumber(card.cardNumber, privacyMode);

  return (
    <div className="flex flex-col group">
      
      {/* 3D Flip Card Container */}
      <div 
        className="relative w-full aspect-[1.586/1] perspective-1000 select-none cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-lg group-hover:shadow-xl rounded-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          
          {/* ===================== FRONT SIDE ===================== */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between backface-hidden bg-gradient-to-br ${theme.class} border ${theme.border} text-white overflow-hidden`}
          >
            {/* Background subtle holographic sheen / texture */}
            <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Bank Info, Best to Swipe Tag & Flip Affordance */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner"
                  style={{ backgroundColor: bankCfg.logoColor, color: '#fff' }}
                >
                  {bankCfg.shortName.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight leading-tight flex items-center gap-1.5">
                    <span>{card.bankName}</span>
                    {isBestToSwipe && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-400 text-neutral-900 shadow-xs">
                        今日首选免息
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/70 font-medium">
                    {card.cardName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] tracking-wider uppercase font-semibold text-white/60 px-1.5 py-0.5 rounded border border-white/10 bg-white/5">
                  {card.type === 'credit' ? `${card.cardTier} · 信用卡` : '储蓄借记卡'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                  title="翻转查看背面"
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Row: EMV Chip & Contactless Symbol */}
            <div className="relative z-10 flex items-center gap-4 my-auto">
              {/* Metallic Chip */}
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-400/80 shadow-inner relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 border border-amber-600/30 rounded-xs m-1" />
                <div className="w-full h-[1px] bg-amber-700/40" />
                <div className="h-full w-[1px] bg-amber-700/40 absolute" />
              </div>

              {/* Contactless wave icon */}
              <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 16.5a5 5 0 0 1 0-9" strokeLinecap="round" />
                <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
                <path d="M15.5 21.5a12 12 0 0 0 0-19" strokeLinecap="round" />
              </svg>
            </div>

            {/* Card Number */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-mono text-base sm:text-lg tracking-[0.18em] font-medium text-white/95 drop-shadow-sm">
                {formattedNumber}
              </span>
              <button
                onClick={handleCopyNumber}
                title="复制卡号"
                className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom Row: Cardholder, Expiry, Scheme Badge */}
            <div className="relative z-10 flex items-end justify-between pt-1">
              <div>
                <div className="text-[9px] text-white/50 uppercase tracking-widest font-semibold">Cardholder</div>
                <div className="text-xs font-mono font-medium tracking-wide text-white/90 truncate max-w-[140px]">
                  {card.cardholder || 'VALUED CUSTOMER'}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/50 uppercase tracking-widest font-semibold">Expires</div>
                <div className="text-xs font-mono font-medium text-white/90">
                  {card.expiryMonth}/{card.expiryYear}
                </div>
              </div>

              {/* Card Organization Logo text */}
              <div className="flex flex-col items-end">
                <span className="text-sm font-extrabold tracking-tight italic drop-shadow-sm text-white/95">
                  {card.organization}
                </span>
              </div>
            </div>

          </div>

          {/* ===================== BACK SIDE ===================== */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br ${theme.class} border ${theme.border} text-white overflow-hidden`}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-10 bg-neutral-950 mt-4 shadow-inner" />

            <div className="px-5 py-2 flex flex-col gap-2">
              {/* Signature & CVV Panel */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 h-7 bg-white/90 rounded text-neutral-800 text-[10px] font-mono flex items-center px-2 select-none italic font-serif opacity-90">
                  Authorized Signature
                </div>
                
                {/* CVV Box */}
                <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded border border-white/20">
                  <span className="text-[10px] text-white/60">CVV:</span>
                  <span className="font-mono font-bold text-xs text-amber-300">
                    {revealCvv ? (card.cvv || '---') : (card.cvv ? '•••' : '---')}
                  </span>
                  {card.cvv && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setRevealCvv(!revealCvv); }}
                      className="text-white/60 hover:text-white ml-0.5"
                    >
                      {revealCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Service & Bank Info */}
              <div className="flex items-center justify-between text-xs text-white/80 mt-1">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-white/60" />
                  <span>客服热线:</span>
                  <span className="font-mono font-semibold">{card.phoneBank || bankCfg.phone || '955xx'}</span>
                </div>
                <div className="text-[10px] text-white/60">
                  纯本地存储 · 离线安全
                </div>
              </div>

              {/* Notes excerpt if any */}
              {card.notes && (
                <div className="text-[11px] text-white/70 line-clamp-1 bg-black/20 rounded p-1">
                  {card.notes}
                </div>
              )}
            </div>

            {/* Bottom Flip back reminder */}
            <div className="px-5 pb-3 flex items-center justify-between text-[10px] text-white/50">
              <span>点击任意处翻转回正面</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                className="text-white/80 hover:text-white flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>正面</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ===================== STATUS & QUICK ACTION FOOTER ===================== */}
      <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col gap-2">
        
        {/* Metric indicators */}
        <div className="flex items-center justify-between text-xs">
          {card.type === 'credit' ? (
            <>
              {/* Repayment status */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${billInfo.statusBadgeClass}`}>
                  {billInfo.statusText}
                </span>
                <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                  {privacyMode ? '¥ ****' : formatMoney(card.currentBillAmount)}
                </span>
              </div>

              {/* Annual fee mini indicator */}
              <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>年费:</span>
                <span className={`px-1.5 py-0.2 rounded border text-[10px] ${feeInfo.statusBadgeClass}`}>
                  {feeInfo.statusText}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">储蓄卡余额:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {privacyMode ? '¥ ****.**' : formatMoney(card.balance)}
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                免年费与管理费
              </span>
            </>
          )}
        </div>

        {/* Quick action toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
          <div className="flex items-center gap-1">
            {card.type === 'credit' && card.annualFee.feeType === 'swipeCount' && (
              <button
                onClick={() => onQuickSwipe(card)}
                className="px-2 py-1 text-[11px] font-medium rounded bg-neutral-200/70 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-1"
                title="记一笔消费以累积免年费刷卡次数"
              >
                <PlusCircle className="w-3 h-3 text-amber-500" />
                <span>+1 记刷免</span>
              </button>
            )}

            {card.type === 'credit' && (
              <button
                onClick={() => onQuickRepay(card)}
                className="px-2 py-1 text-[11px] font-medium rounded bg-neutral-200/70 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors"
                title="登记账单还款"
              >
                <span>记还款</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onOpenDetails(card)}
            className="px-2 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 rounded transition-colors flex items-center gap-1"
          >
            <span>管理详情</span>
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
