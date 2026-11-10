import React, { useState, useEffect } from 'react';
import { X, CreditCard, Sparkles, Building, Calendar, DollarSign, Shield, Info } from 'lucide-react';
import { CardRecord, CardType, CardOrganization, CardTier, AnnualFeeType } from '../types/card';
import { 
  POPULAR_BANKS, BANK_CONFIGS, THEME_GRADIENTS, 
  detectCardOrganization, formatCardNumber 
} from '../utils/bankData';
import { parseAnnualFeePolicy } from '../utils/storage';
import { computeDueDateForStatement } from '../utils/cardCalculations';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CardRecord) => void;
  initialCard?: CardRecord | null;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCard,
}) => {
  const isEditing = Boolean(initialCard);

  const [type, setType] = useState<CardType>('credit');
  const [bankName, setBankName] = useState('招商银行');
  const [customBank, setCustomBank] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('29');
  const [cvv, setCvv] = useState('');
  const [organization, setOrganization] = useState<CardOrganization>('UnionPay');
  const [cardTier, setCardTier] = useState<CardTier>('platinum');
  const [cardColorTheme, setCardColorTheme] = useState('black-gold');
  
  // Financial
  const [creditLimit, setCreditLimit] = useState('50000');
  const [balance, setBalance] = useState('50000');
  const [currentBillAmount, setCurrentBillAmount] = useState('0');
  const [isBillPaid, setIsBillPaid] = useState(true);
  const [isSharedLimit, setIsSharedLimit] = useState(true);
  
  // Dates
  const [statementDay, setStatementDay] = useState(5);
  const [dueDayType, setDueDayType] = useState<'fixedDay' | 'daysAfterStatement'>('daysAfterStatement');
  const [dueDay, setDueDay] = useState(25);
  const [dueDaysOffset, setDueDaysOffset] = useState(20);

  // Annual fee
  const [feeType, setFeeType] = useState<AnnualFeeType>('swipeCount');
  const [targetSwipeCount, setTargetSwipeCount] = useState(6);
  const [currentSwipeCount, setCurrentSwipeCount] = useState(0);
  const [targetSpendAmount, setTargetSpendAmount] = useState(10000);
  const [currentSpendAmount, setCurrentSpendAmount] = useState(0);
  const [fixedChargeAmount, setFixedChargeAmount] = useState(480);
  const [targetPoints, setTargetPoints] = useState(10000);
  const [feeDueDate, setFeeDueDate] = useState('');
  const [feeNotes, setFeeNotes] = useState('');

  // General
  const [phoneBank, setPhoneBank] = useState('');
  const [notes, setNotes] = useState('');

  // Load initial data if editing
  useEffect(() => {
    if (initialCard) {
      setType(initialCard.type);
      setBankName(initialCard.bankName);
      setCardName(initialCard.cardName);
      setCardNumber(initialCard.cardNumber);
      setCardholder(initialCard.cardholder || '');
      setExpiryMonth(initialCard.expiryMonth || '12');
      setExpiryYear(initialCard.expiryYear || '29');
      setCvv(initialCard.cvv || '');
      setOrganization(initialCard.organization);
      setCardTier(initialCard.cardTier);
      setCardColorTheme(initialCard.cardColorTheme || 'black-gold');
      setCreditLimit(String(initialCard.creditLimit || '0'));
      setIsSharedLimit(initialCard.isSharedLimit !== false);
      setBalance(String(initialCard.balance || '0'));
      setCurrentBillAmount(String(initialCard.currentBillAmount || '0'));
      setIsBillPaid(Boolean(initialCard.isBillPaid));
      setStatementDay(initialCard.statementDay || 5);
      setDueDayType(initialCard.dueDayType || 'fixedDay');
      setDueDay(initialCard.dueDay || 25);
      setDueDaysOffset(initialCard.dueDaysOffset || 20);

      const fee = initialCard.annualFee;
      if (fee) {
        setFeeType(fee.feeType || 'swipeCount');
        setTargetSwipeCount(fee.targetSwipeCount || 6);
        setCurrentSwipeCount(fee.currentSwipeCount || 0);
        setTargetSpendAmount(fee.targetSpendAmount || 0);
        setCurrentSpendAmount(fee.currentSpendAmount || 0);
        setFixedChargeAmount(fee.fixedChargeAmount || 0);
        setTargetPoints(fee.targetPoints || 0);
        setFeeDueDate(fee.feeDueDate || '');
        setFeeNotes(fee.notes || '');
      }

      setPhoneBank(initialCard.phoneBank || '');
      setNotes(initialCard.notes || '');
    } else {
      // Default reset
      setType('credit');
      setBankName('招商银行');
      setCardName('');
      setCardNumber('');
      setCardholder(''); // 保护个人隐私，默认留空
      setIsSharedLimit(true); // 默认同行共享
      setExpiryMonth('12');
      setExpiryYear('29');
      setCvv('');
      setOrganization('UnionPay');
      setCardTier('platinum');
      setCardColorTheme('black-gold');
      setCreditLimit('50000');
      setBalance('50000');
      setCurrentBillAmount('0');
      setIsBillPaid(true);
      setStatementDay(5);
      setDueDayType('daysAfterStatement');
      setDueDay(25);
      setDueDaysOffset(20);
      setFeeType('swipeCount');
      setTargetSwipeCount(6);
      setCurrentSwipeCount(0);
      setPhoneBank(BANK_CONFIGS['招商银行'].phone);
      setNotes('');
    }
  }, [initialCard, isOpen]);

  // When bank changes, auto populate customer phone and default repayment rule
  const handleBankChange = (bName: string) => {
    setBankName(bName);
    const cfg = BANK_CONFIGS[bName];
    if (cfg) {
      if (cfg.phone) setPhoneBank(cfg.phone);
      if (cfg.defaultDueOffset) {
        setDueDayType('daysAfterStatement');
        setDueDaysOffset(cfg.defaultDueOffset);
      }
    }
  };

  // When card number changes, auto detect organization
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\s+/g, '');
    setCardNumber(raw);
    if (raw.length >= 2) {
      setOrganization(detectCardOrganization(raw));
    }
  };

  const handleApplyNaturalLanguagePolicy = (text: string) => {
    if (!text.trim()) return;
    const res = parseAnnualFeePolicy(text);
    setFeeType(res.feeType);
    if (res.targetSwipeCount) setTargetSwipeCount(res.targetSwipeCount);
    if (res.targetSpendAmount) setTargetSpendAmount(res.targetSpendAmount);
    if (res.fixedChargeAmount) setFixedChargeAmount(res.fixedChargeAmount);
    if (res.targetPoints) setTargetPoints(res.targetPoints);
    setFeeNotes(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBank = bankName === '其他银行' && customBank.trim() ? customBank.trim() : bankName;

    const newCard: CardRecord = {
      id: initialCard?.id || `card_${Date.now()}`,
      type,
      bankName: finalBank,
      cardName: cardName.trim() || (type === 'credit' ? '白金信用卡' : '储蓄借记卡'),
      cardNumber: cardNumber.trim(),
      cardholder: cardholder.trim() || '', // 保护隐私，选填
      isSharedLimit: type === 'credit' ? isSharedLimit : false,
      expiryMonth,
      expiryYear,
      cvv: cvv.trim(),
      organization,
      cardTier,
      currency: 'CNY',
      creditLimit: type === 'credit' ? Number(creditLimit) || 0 : 0,
      balance: type === 'debit' ? Number(balance) || 0 : (Number(creditLimit) - Number(currentBillAmount)),
      statementDay: Number(statementDay) || 1,
      dueDay: Number(dueDay) || 20,
      dueDayType,
      dueDaysOffset: Number(dueDaysOffset) || 20,
      currentBillAmount: type === 'credit' ? Number(currentBillAmount) || 0 : 0,
      isBillPaid: type === 'credit' ? isBillPaid : true,
      annualFee: {
        feeType: type === 'debit' ? 'lifetimeFree' : feeType,
        targetSwipeCount: Number(targetSwipeCount) || 0,
        currentSwipeCount: Number(currentSwipeCount) || 0,
        targetSpendAmount: Number(targetSpendAmount) || 0,
        currentSpendAmount: Number(currentSpendAmount) || 0,
        fixedChargeAmount: Number(fixedChargeAmount) || 0,
        targetPoints: Number(targetPoints) || 0,
        feeDueDate: feeDueDate || '',
        notes: feeNotes,
      },
      swipeTransactions: initialCard?.swipeTransactions || [],
      phoneBank,
      notes,
      cardColorTheme,
      createdAt: initialCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newCard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isEditing ? '编辑卡片信息' : '添加新的银行卡'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* 1. 卡片类型选择 (Segmented Tab) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              卡片类型
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  type === 'credit'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                💳 信用卡 (支持还款日与年费提醒)
              </button>
              <button
                type="button"
                onClick={() => setType('debit')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  type === 'debit'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                🏦 储蓄卡 / 借记卡 (支持余额管理)
              </button>
            </div>
          </div>

          {/* 2. 发卡银行与卡片名称 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                发卡银行
              </label>
              <select
                value={bankName}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              >
                {POPULAR_BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {bankName === '其他银行' && (
                <input
                  type="text"
                  placeholder="输入自定义银行全称"
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                卡片全称 / 别名
              </label>
              <input
                type="text"
                placeholder="例如：经典白金卡、多利卡、工资卡"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* 3. 卡号、组织与等级 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                银行卡号 (16-19位)
              </label>
              <span className="text-[11px] text-neutral-400">
                检测到: {organization}
              </span>
            </div>
            <input
              type="text"
              placeholder="6225 8888 1234 5678"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-sm tracking-wider text-neutral-900 dark:text-white"
            />
          </div>

          {/* 4. 持卡人、有效期、CVV、等级 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>持卡人</span>
                <span className="text-[9px] text-neutral-400 font-normal">选填/可留空</span>
              </label>
              <input
                type="text"
                placeholder="留空或填“本人”"
                value={cardholder}
                onChange={(e) => setCardholder(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white uppercase text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                有效期 (月/年)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  maxLength={2}
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  className="w-12 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-center text-neutral-900 dark:text-white"
                />
                <span className="text-neutral-400">/</span>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="YY"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  className="w-12 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-center text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                安全码 (CVV)
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                卡片卡阶
              </label>
              <select
                value={cardTier}
                onChange={(e) => setCardTier(e.target.value as CardTier)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              >
                <option value="standard">普卡 (Standard)</option>
                <option value="gold">金卡 (Gold)</option>
                <option value="platinum">白金卡 (Platinum)</option>
                <option value="diamond">钻石卡 (Diamond)</option>
                <option value="black">黑金/御玺 (Black)</option>
              </select>
            </div>
          </div>

          {/* 5. 卡片视觉质感渐变 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              卡面渐变材质风格
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {THEME_GRADIENTS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setCardColorTheme(theme.id)}
                  className={`h-9 rounded-lg bg-gradient-to-br ${theme.class} border text-[10px] font-medium flex items-center justify-center transition-all ${
                    cardColorTheme === theme.id ? 'ring-2 ring-neutral-900 dark:ring-white scale-105' : 'opacity-70'
                  }`}
                >
                  {theme.name.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          {/* 6. 信用卡核心财务参数 (账单日、还款日、额度、本期应还) */}
          {type === 'credit' ? (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>账单周期与还款日设定</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      总信用额度 (元)
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={isSharedLimit}
                        onChange={(e) => setIsSharedLimit(e.target.checked)}
                        className="rounded text-neutral-900"
                      />
                      <span>同行共享额度</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                  />
                  <div className="text-[10px] text-neutral-400">
                    {isSharedLimit 
                      ? '💡 同银行多卡共享同一额度池，统计时将自动去重合并真实总授信。' 
                      : '⚡ 独立专属额度：不与同银行其他卡共享，单独累加总授信。'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    本期应还账单金额 (元)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBillAmount}
                    onChange={(e) => {
                      setCurrentBillAmount(e.target.value);
                      if (Number(e.target.value) <= 0) setIsBillPaid(true);
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    每月账单日
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-500">每月</span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={statementDay}
                      onChange={(e) => setStatementDay(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-center text-neutral-900 dark:text-white"
                    />
                    <span className="text-neutral-500">号</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    还款日规则
                  </label>
                  <select
                    value={dueDayType}
                    onChange={(e) => setDueDayType(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  >
                    <option value="daysAfterStatement">账单日后N天 (招行/工行/广发常见)</option>
                    <option value="fixedDay">每月固定几号 (建行/中行常见)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    {dueDayType === 'daysAfterStatement' ? '账单日后天数' : '固定还款日'}
                  </label>
                  <div className="flex items-center gap-1">
                    {dueDayType === 'daysAfterStatement' ? (
                      <>
                        <input
                          type="number"
                          min={1}
                          max={35}
                          value={dueDaysOffset}
                          onChange={(e) => setDueDaysOffset(Number(e.target.value))}
                          className="w-20 px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-center text-neutral-900 dark:text-white"
                        />
                        <span className="text-neutral-500">天</span>
                      </>
                    ) : (
                      <>
                        <span className="text-neutral-500">每月</span>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={dueDay}
                          onChange={(e) => setDueDay(Number(e.target.value))}
                          className="w-16 px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-center text-neutral-900 dark:text-white"
                        />
                        <span className="text-neutral-500">号</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 实时推算还款日与跨月预览 */}
              {(() => {
                const previewStmtDate = new Date();
                previewStmtDate.setDate(statementDay || 1);
                const previewDue = computeDueDateForStatement(previewStmtDate, {
                  statementDay: statementDay || 1,
                  dueDayType,
                  dueDaysOffset: dueDaysOffset || 20,
                  dueDay: dueDay || 25,
                });

                return (
                  <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                      <span className="font-semibold text-neutral-900 dark:text-white">📅 还款日推算预览:</span>
                      <span>每月{statementDay}号出账 ➔ <strong>{previewDue.displayStr}</strong></span>
                    </div>
                    {previewDue.isCrossMonth ? (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px] border border-indigo-500/30">
                        ⚡ 跨月还款
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]">
                        当月还款
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* 是否已还清勾选 */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isBillPaidCheck"
                  checked={isBillPaid}
                  onChange={(e) => setIsBillPaid(e.target.checked)}
                  className="rounded text-neutral-900"
                />
                <label htmlFor="isBillPaidCheck" className="text-neutral-700 dark:text-neutral-300 select-none">
                  本期账单已全额还清
                </label>
              </div>

            </div>
          ) : (
            /* 储蓄卡余额参数 */
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>储蓄卡资金与余额</span>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  当前账户活期余额 (元)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* 7. 信用卡年费达标政策 (重要支持点) */}
          {type === 'credit' && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>年费减免政策与追踪设定</span>
                </div>
                <span className="text-[10px] text-neutral-400">支持快捷套用或在下方自由配置</span>
              </div>

              {/* 常用年费规则快捷芯片 */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-neutral-500">快捷套用:</span>
                {[
                  '刷满6次免年费',
                  '每年消费满2万元免',
                  '10000积分兑换',
                  '刚性年费3600元',
                  '终身免年费',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleApplyNaturalLanguagePolicy(chip)}
                    className="px-2 py-0.5 rounded bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 text-[10px] transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    年费规则类型
                  </label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as AnnualFeeType)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  >
                    <option value="swipeCount">刷满指定次数免次年 (最常见)</option>
                    <option value="spendAmount">刷满指定金额免次年</option>
                    <option value="fixedCharge">刚性扣收 (不可减免)</option>
                    <option value="points">永久积分抵扣年费</option>
                    <option value="lifetimeFree">终身免年费</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    年费核算日 / 核卡到期日
                  </label>
                  <input
                    type="date"
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 细分指标 */}
              {feeType === 'swipeCount' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      年度目标刷卡次数
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={targetSwipeCount}
                      onChange={(e) => setTargetSwipeCount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      本周期已刷次数
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={currentSwipeCount}
                      onChange={(e) => setCurrentSwipeCount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {feeType === 'spendAmount' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      年度目标消费额 (元)
                    </label>
                    <input
                      type="number"
                      value={targetSpendAmount}
                      onChange={(e) => setTargetSpendAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      已消费金额 (元)
                    </label>
                    <input
                      type="number"
                      value={currentSpendAmount}
                      onChange={(e) => setCurrentSpendAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {feeType === 'fixedCharge' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    刚性年费金额 (元/年)
                  </label>
                  <input
                    type="number"
                    value={fixedChargeAmount}
                    onChange={(e) => setFixedChargeAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                  />
                </div>
              )}

              {feeType === 'points' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    抵扣所需积分数
                  </label>
                  <input
                    type="number"
                    value={targetPoints}
                    onChange={(e) => setTargetPoints(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  年费减免备注说明
                </label>
                <input
                  type="text"
                  placeholder="例如：首年免年费，次年刷6次免，绑定支付宝微信快捷支付计入"
                  value={feeNotes}
                  onChange={(e) => setFeeNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

            </div>
          )}

          {/* 8. 客服热线与自定义备注 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                银行客服电话
              </label>
              <input
                type="text"
                placeholder="例如 95555"
                value={phoneBank}
                onChange={(e) => setPhoneBank(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-neutral-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                私密备忘与优惠特权说明
              </label>
              <input
                type="text"
                placeholder="例如：周三5折美食、机场贵宾厅6次、海淘返现卡"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg shadow-sm transition-all"
            >
              {isEditing ? '保存修改' : '确认添加卡片'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
