import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, Check, AlertCircle, X, 
  RotateCw, RefreshCw, CreditCard, ArrowRight, ShieldCheck, Eye
} from 'lucide-react';
import { CardRecord, CardType, CardOrganization, CardTier } from '../types/card';
import { POPULAR_BANKS, BANK_CONFIGS, detectCardOrganization } from '../utils/bankData';

interface CardScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (newCard: CardRecord) => void;
}

export const CardScanModal: React.FC<CardScanModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'verify'>('upload');

  // Extracted & Editable Fields for the "确认后导入" step
  const [bankName, setBankName] = useState('招商银行');
  const [cardName, setCardName] = useState('经典白金信用卡');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('29');
  const [cardType, setCardType] = useState<CardType>('credit');
  const [organization, setOrganization] = useState<CardOrganization>('UnionPay');
  const [cardTier, setCardTier] = useState<CardTier>('platinum');
  const [creditLimit, setCreditLimit] = useState('50000');
  const [statementDay, setStatementDay] = useState(5);
  const [dueDaysOffset, setDueDaysOffset] = useState(20);
  const [targetSwipeCount, setTargetSwipeCount] = useState(6);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 处理图片选择
  const handleImageFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('请选择有效的图片文件（JPG, PNG, WebP）');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // 支持粘贴剪贴板图片
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageFile(file);
        break;
      }
    }
  };

  // 模拟/测试样本照片（方便用户在电脑前没有实体卡时即时体验）
  const handleLoadDemoImage = (type: 'cmb' | 'icbc') => {
    setErrorMsg(null);
    if (type === 'cmb') {
      setBankName('招商银行');
      setCardName('经典白金信用卡');
      setCardNumber('6225881234567890');
      setCardholder('ZHANG SAN');
      setExpiryMonth('08');
      setExpiryYear('29');
      setCardType('credit');
      setOrganization('UnionPay');
      setCardTier('platinum');
      setCreditLimit('60000');
      setStatementDay(7);
      setDueDaysOffset(18);
      setTargetSwipeCount(6);
      setSelectedImage('https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80');
      setStep('verify');
    } else {
      setBankName('工商银行');
      setCardName('工银黑金信用卡');
      setCardNumber('6222029988776655');
      setCardholder('ZHANG SAN');
      setExpiryMonth('11');
      setExpiryYear('30');
      setCardType('credit');
      setOrganization('UnionPay');
      setCardTier('black');
      setCreditLimit('100000');
      setStatementDay(1);
      setDueDaysOffset(25);
      setTargetSwipeCount(5);
      setSelectedImage('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80');
      setStep('verify');
    }
  };

  // 触发 AI 视觉识别
  const handleStartOCR = async () => {
    if (!selectedImage) {
      setErrorMsg('请先拍摄或上传银行卡正面照片');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ocr-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: 'image/jpeg',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.bankName) setBankName(d.bankName);
        if (d.cardName) setCardName(d.cardName);
        if (d.cardNumber) setCardNumber(d.cardNumber.replace(/\s+/g, ''));
        if (d.cardholder) setCardholder(d.cardholder.toUpperCase());
        if (d.expiryMonth) setExpiryMonth(d.expiryMonth.padStart(2, '0'));
        if (d.expiryYear) setExpiryYear(d.expiryYear);
        if (d.cardType) setCardType(d.cardType === 'debit' ? 'debit' : 'credit');
        if (d.organization) setOrganization(d.organization as any);
        if (d.cardTier) setCardTier(d.cardTier as any);

        // 智能匹配银行默认客服与账单偏移
        const cfg = BANK_CONFIGS[d.bankName];
        if (cfg) {
          setDueDaysOffset(cfg.defaultDueOffset || 20);
        }

        setStep('verify');
      } else {
        // 如果后端返回非成功或静态环境无法直接识别，进入手动核验并提示
        setErrorMsg(json.error || '未识别到清晰卡片信息，已为您开启核对补录界面');
        setStep('verify');
      }
    } catch (err: any) {
      console.warn('OCR endpoint fetch failed (e.g. running on static hosting):', err);
      // 优雅降级：引导用户进入核验界面，并保留图片对照
      setErrorMsg('本地离线或静态托管模式下已载入照片，请对照图片快速核验或完善信息');
      setStep('verify');
    } finally {
      setIsScanning(false);
    }
  };

  // 确认导入
  const handleConfirm = () => {
    const finalNumber = cardNumber.replace(/\s+/g, '');
    if (!finalNumber) {
      setErrorMsg('请填写卡号');
      return;
    }

    const bankCfg = BANK_CONFIGS[bankName] || BANK_CONFIGS['其他银行'];

    const newCard: CardRecord = {
      id: `scanned_card_${Date.now()}`,
      type: cardType,
      bankName: bankName || '其他银行',
      cardName: cardName || (cardType === 'credit' ? '信用卡' : '储蓄卡'),
      cardNumber: finalNumber,
      cardholder: cardholder || '持卡人',
      expiryMonth: expiryMonth || '12',
      expiryYear: expiryYear || '29',
      cvv: '',
      organization: organization || detectCardOrganization(finalNumber),
      cardTier: cardTier || 'platinum',
      currency: 'CNY',
      creditLimit: cardType === 'credit' ? Number(creditLimit) || 0 : 0,
      balance: cardType === 'debit' ? Number(creditLimit) || 0 : 0,
      statementDay: Number(statementDay) || 5,
      dueDay: 25,
      dueDayType: 'daysAfterStatement',
      dueDaysOffset: Number(dueDaysOffset) || 20,
      currentBillAmount: 0,
      isBillPaid: true,
      annualFee: {
        feeType: cardType === 'debit' ? 'lifetimeFree' : 'swipeCount',
        targetSwipeCount: Number(targetSwipeCount) || 6,
        currentSwipeCount: 0,
        targetSpendAmount: 0,
        currentSpendAmount: 0,
        fixedChargeAmount: 0,
        targetPoints: 0,
        feeDueDate: '',
        notes: '由卡片拍照识别导入',
      },
      swipeTransactions: [],
      phoneBank: bankCfg.phone || '',
      notes: '拍照智能提取导入',
      cardColorTheme: 'black-gold',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onConfirmImport(newCard);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onPaste={handlePaste}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>拍卡提取卡片信息</span>
                <span className="text-[11px] font-normal px-2 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  AI 智能视觉提取 · 确认后入库
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: UPLOAD / CAMERA ================= */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-neutral-50/50 dark:bg-neutral-800/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFile(f);
                  }}
                />

                {selectedImage ? (
                  <div className="space-y-3">
                    <img 
                      src={selectedImage} 
                      alt="Bank card preview" 
                      className="max-h-56 mx-auto rounded-xl object-contain shadow-md border border-neutral-200 dark:border-neutral-700"
                    />
                    <div className="text-neutral-500 text-xs">
                      已选定卡片照片，点击可重新选取，或按下方按钮开始提取
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        点击拍照 或 从电脑/相册中选择银行卡正面图片
                      </div>
                      <div className="text-neutral-400 text-[11px] mt-1">
                        支持手机拍摄、电脑截屏粘贴（Ctrl+V / Cmd+V），保证卡号数字与银行标志清晰
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span>没有卡片？试玩演示：</span>
                  <button
                    type="button"
                    onClick={() => handleLoadDemoImage('cmb')}
                    className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 font-medium transition-colors"
                  >
                    招行白金样例
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadDemoImage('icbc')}
                    className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 font-medium transition-colors"
                  >
                    工银黑金样例
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!selectedImage || isScanning}
                  onClick={handleStartOCR}
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-white shadow-sm transition-all ${
                    !selectedImage || isScanning
                      ? 'bg-neutral-400 cursor-not-allowed opacity-60'
                      : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>正在识别卡面文字...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>开始智能提取卡片信息</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: VERIFY & CONFIRM BEFORE IMPORT ================= */}
          {step === 'verify' && (
            <div className="space-y-4">
              
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold">已提取卡片信息，请核对并补充账单与额度：</span>
                </div>
                <button
                  onClick={() => setStep('upload')}
                  className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline text-[11px]"
                >
                  重新拍照
                </button>
              </div>

              {/* Side-by-side or stacked view: Image thumbnail & Editable fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Photo Thumbnail */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-col justify-center items-center text-center">
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt="Bank card preview" 
                      className="rounded-lg max-h-36 object-contain shadow-xs border border-neutral-300 dark:border-neutral-700"
                    />
                  ) : (
                    <CreditCard className="w-12 h-12 text-neutral-300" />
                  )}
                  <span className="text-[10px] text-neutral-400 mt-2">
                    卡片原图对照（支持核实数字）
                  </span>
                </div>

                {/* Editable Fields */}
                <div className="md:col-span-2 space-y-3">
                  
                  {/* Card Type switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">卡片性质:</span>
                    <div className="inline-flex p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setCardType('credit')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          cardType === 'credit' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                        }`}
                      >
                        信用卡
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardType('debit')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          cardType === 'debit' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                        }`}
                      >
                        储蓄借记卡
                      </button>
                    </div>
                  </div>

                  {/* Bank & Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                        发卡银行
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => {
                          const b = e.target.value;
                          setBankName(b);
                          const cfg = BANK_CONFIGS[b];
                          if (cfg && cfg.defaultDueOffset) {
                            setDueDaysOffset(cfg.defaultDueOffset);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-medium"
                      >
                        {POPULAR_BANKS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                        卡片产品名称
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                        银行卡号 (纯数字)
                      </label>
                      <span className="text-[10px] text-neutral-400">
                        组织: {organization} · {cardTier}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCardNumber(val);
                        if (val.length >= 2) setOrganization(detectCardOrganization(val));
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-sm tracking-wider font-bold text-neutral-900 dark:text-white"
                    />
                  </div>

                  {/* Cardholder & Expiry */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                        持卡人
                      </label>
                      <input
                        type="text"
                        value={cardholder}
                        onChange={(e) => setCardholder(e.target.value)}
                        placeholder="ZHANG SAN"
                        className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white uppercase font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                        有效期 (月/年)
                      </label>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="text"
                          maxLength={2}
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                          className="w-12 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center text-neutral-900 dark:text-white"
                        />
                        <span>/</span>
                        <input
                          type="text"
                          maxLength={2}
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                          className="w-12 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Supplemental Parameters (Limit & Dates) */}
                  {cardType === 'credit' && (
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/70 rounded-xl space-y-2 border border-neutral-200 dark:border-neutral-700">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">信用额度</label>
                          <input
                            type="number"
                            value={creditLimit}
                            onChange={(e) => setCreditLimit(e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">每月账单日</label>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={statementDay}
                            onChange={(e) => setStatementDay(Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">账单后还款天数</label>
                          <input
                            type="number"
                            min={1}
                            max={35}
                            value={dueDaysOffset}
                            onChange={(e) => setDueDaysOffset(Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-1 border-t border-neutral-200/50 dark:border-neutral-700/50">
                        <label className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                          年费刷免目标次数 (例如 6 次免次年)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={targetSwipeCount}
                          onChange={(e) => setTargetSwipeCount(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-mono text-xs text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Confirm / Cancel footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>核对无误，确认导入卡包</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
