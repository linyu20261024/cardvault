import { CardRecord, StorageSettings } from '../types/card';

const CARDS_STORAGE_KEY = 'cardvault_cards_v1';
const SETTINGS_STORAGE_KEY = 'cardvault_settings_v1';

// 预设的高拟真演示卡组（方便用户首次体验或一键导入测试）
export const SAMPLE_CARDS: CardRecord[] = [
  {
    id: 'sample-cmb-platinum',
    type: 'credit',
    bankName: '招商银行',
    cardName: '经典白金信用卡',
    cardNumber: '6225881234567890',
    cardholder: 'ZHANG SAN',
    expiryMonth: '08',
    expiryYear: '29',
    cvv: '821',
    organization: 'UnionPay',
    cardTier: 'platinum',
    currency: 'CNY',
    creditLimit: 60000,
    balance: 42500,
    statementDay: 7,
    dueDay: 25,
    dueDayType: 'fixedDay',
    dueDaysOffset: 18,
    currentBillAmount: 5820.50,
    isBillPaid: false,
    annualFee: {
      feeType: 'points',
      targetSwipeCount: 0,
      currentSwipeCount: 0,
      targetSpendAmount: 0,
      currentSpendAmount: 0,
      fixedChargeAmount: 3600,
      targetPoints: 10000,
      feeDueDate: '2026-12-15',
      notes: '年费可用10,000永久积分兑换次年年费，主卡赠送6次贵宾厅及体检洗牙'
    },
    swipeTransactions: [
      { id: 'tx-1', date: '2026-11-01', amount: 328.00, merchant: '山姆会员商店', note: '周末家庭采购' },
      { id: 'tx-2', date: '2026-11-03', amount: 89.50, merchant: '星巴克臻选', note: '商务咖啡' }
    ],
    phoneBank: '95555',
    notes: '核心大额消费卡，生日月享10倍积分（上限1万分），建议生日前后集中刷卡。',
    cardColorTheme: 'crimson-ruby',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-icbc-black',
    type: 'credit',
    bankName: '工商银行',
    cardName: '工银黑金白金卡',
    cardNumber: '6222029988776655',
    cardholder: 'ZHANG SAN',
    expiryMonth: '11',
    expiryYear: '30',
    cvv: '914',
    organization: 'UnionPay',
    cardTier: 'black',
    currency: 'CNY',
    creditLimit: 100000,
    balance: 88000,
    statementDay: 1,
    dueDay: 25,
    dueDayType: 'daysAfterStatement',
    dueDaysOffset: 25,
    currentBillAmount: 12000.00,
    isBillPaid: true,
    lastPaidDate: '2026-11-02',
    lastPaidAmount: 12000.00,
    annualFee: {
      feeType: 'swipeCount',
      targetSwipeCount: 5,
      currentSwipeCount: 4,
      targetSpendAmount: 0,
      currentSpendAmount: 0,
      fixedChargeAmount: 2000,
      targetPoints: 0,
      feeDueDate: '2026-11-28',
      notes: '消费满5笔或累计5000元免次年年费'
    },
    swipeTransactions: [
      { id: 'tx-3', date: '2026-10-15', amount: 1200.00, merchant: '中国石化', note: '加油' },
      { id: 'tx-4', date: '2026-10-22', amount: 450.00, merchant: '京东商城', note: '数码配件' },
      { id: 'tx-5', date: '2026-11-02', amount: 15.00, merchant: '全家便利店', note: '早餐' },
      { id: 'tx-6', date: '2026-11-04', amount: 35.00, merchant: '滴滴出行', note: '日常通勤打车' }
    ],
    phoneBank: '95588',
    notes: '差1笔刷卡达标免年费！距离年费日不足30天，需尽快刷1笔。',
    cardColorTheme: 'black-gold',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-cgb-doli',
    type: 'credit',
    bankName: '广发银行',
    cardName: '多利白金信用卡',
    cardNumber: '6225688811223344',
    cardholder: 'ZHANG SAN',
    expiryMonth: '05',
    expiryYear: '28',
    cvv: '562',
    organization: 'UnionPay',
    cardTier: 'gold',
    currency: 'CNY',
    creditLimit: 35000,
    balance: 29800,
    statementDay: 18,
    dueDay: 8,
    dueDayType: 'daysAfterStatement',
    dueDaysOffset: 20,
    currentBillAmount: 1845.20,
    isBillPaid: false,
    annualFee: {
      feeType: 'swipeCount',
      targetSwipeCount: 6,
      currentSwipeCount: 6,
      targetSpendAmount: 0,
      currentSpendAmount: 0,
      fixedChargeAmount: 480,
      targetPoints: 0,
      feeDueDate: '2027-05-18',
      notes: '首年免，刷卡满6次免次年年费（已达标）'
    },
    swipeTransactions: [],
    phoneBank: '95508',
    notes: '美团/饿了么/滴滴微信支付返现神卡，每月消费10%返现，最高返100元。',
    cardColorTheme: 'carbon-titanium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-ccb-car',
    type: 'credit',
    bankName: '建设银行',
    cardName: '龙卡汽车卡',
    cardNumber: '6259081234567899',
    cardholder: 'ZHANG SAN',
    expiryMonth: '09',
    expiryYear: '27',
    cvv: '339',
    organization: 'UnionPay',
    cardTier: 'standard',
    currency: 'CNY',
    creditLimit: 40000,
    balance: 38200,
    statementDay: 12,
    dueDay: 2,
    dueDayType: 'daysAfterStatement',
    dueDaysOffset: 20,
    currentBillAmount: 0,
    isBillPaid: true,
    annualFee: {
      feeType: 'fixedCharge',
      targetSwipeCount: 0,
      currentSwipeCount: 0,
      targetSpendAmount: 0,
      currentSpendAmount: 0,
      fixedChargeAmount: 200,
      targetPoints: 0,
      feeDueDate: '2027-09-12',
      notes: '刚性年费200元，卡内积分可抵扣，每周送洗车1次'
    },
    phoneBank: '95533',
    notes: '洗车专属卡，积分可在建行汽车卡生活馆兑换加油卡。',
    cardColorTheme: 'sapphire-blue',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-cmb-debit',
    type: 'debit',
    bankName: '招商银行',
    cardName: '一卡通金卡',
    cardNumber: '6225880011223388',
    cardholder: 'ZHANG SAN',
    expiryMonth: '12',
    expiryYear: '35',
    cvv: '',
    organization: 'UnionPay',
    cardTier: 'gold',
    currency: 'CNY',
    creditLimit: 0,
    balance: 56800.00,
    statementDay: 1,
    dueDay: 1,
    dueDayType: 'fixedDay',
    dueDaysOffset: 0,
    currentBillAmount: 0,
    isBillPaid: true,
    annualFee: {
      feeType: 'lifetimeFree',
      targetSwipeCount: 0,
      currentSwipeCount: 0,
      targetSpendAmount: 0,
      currentSpendAmount: 0,
      fixedChargeAmount: 0,
      targetPoints: 0,
      feeDueDate: '',
      notes: '储蓄卡免账户管理费与年费'
    },
    phoneBank: '95555',
    notes: '日常工资代发卡 & 信用卡自动扣款绑定关联账户。',
    cardColorTheme: 'black-gold',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-icbc-debit',
    type: 'debit',
    bankName: '工商银行',
    cardName: '薪享借记卡',
    cardNumber: '6212260200018899',
    cardholder: 'ZHANG SAN',
    expiryMonth: '10',
    expiryYear: '33',
    cvv: '',
    organization: 'UnionPay',
    cardTier: 'standard',
    currency: 'CNY',
    creditLimit: 0,
    balance: 18500.00,
    statementDay: 1,
    dueDay: 1,
    dueDayType: 'fixedDay',
    dueDaysOffset: 0,
    currentBillAmount: 0,
    isBillPaid: true,
    annualFee: {
      feeType: 'lifetimeFree',
      targetSwipeCount: 0,
      currentSwipeCount: 0,
      targetSpendAmount: 0,
      currentSpendAmount: 0,
      fixedChargeAmount: 0,
      targetPoints: 0,
      feeDueDate: '',
      notes: '终身免管理费与年费'
    },
    phoneBank: '95588',
    notes: '理财备用金账户，存入工银现金宝享受活期利率增益。',
    cardColorTheme: 'emerald-green',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function getStoredCards(): CardRecord[] {
  try {
    const raw = localStorage.getItem(CARDS_STORAGE_KEY);
    if (!raw) {
      // 首次载入若无数据，默认提供样本方便直观预览
      saveStoredCards(SAMPLE_CARDS);
      return SAMPLE_CARDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return SAMPLE_CARDS;
  } catch (err) {
    console.error('Failed to load cards from localStorage:', err);
    return SAMPLE_CARDS;
  }
}

export function saveStoredCards(cards: CardRecord[]): void {
  try {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save cards to localStorage:', err);
  }
}

export function getStoredSettings(): StorageSettings {
  const defaultSettings: StorageSettings = {
    privacyMode: false,
    isLocked: false,
    theme: 'dark',
  };

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: Partial<StorageSettings>): StorageSettings {
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return getStoredSettings();
  }
}

/**
 * 导出全部数据为 JSON 字符串
 */
export function exportCardsToJson(cards: CardRecord[]): string {
  const payload = {
    version: '1.0.0',
    exportTime: new Date().toISOString(),
    cardCount: cards.length,
    cards,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * 从 JSON 导入卡片数据（支持覆盖或合并）
 */
export function importCardsFromJson(jsonStr: string, mode: 'overwrite' | 'merge' = 'merge'): { success: boolean; count: number; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    let newCards: CardRecord[] = [];
    if (Array.isArray(parsed)) {
      newCards = parsed;
    } else if (parsed && Array.isArray(parsed.cards)) {
      newCards = parsed.cards;
    } else {
      return { success: false, count: 0, message: 'JSON 格式不符合要求，缺少有效卡片数组。' };
    }

    // 格式简单校验与标准化
    const validCards: CardRecord[] = newCards.map((c, i) => ({
      id: c.id || `card_${Date.now()}_${i}`,
      type: c.type === 'debit' ? 'debit' : 'credit',
      bankName: c.bankName || '其他银行',
      cardName: c.cardName || '未命名卡片',
      cardNumber: String(c.cardNumber || '').trim(),
      cardholder: c.cardholder || '持卡人',
      expiryMonth: String(c.expiryMonth || '12').padStart(2, '0'),
      expiryYear: String(c.expiryYear || '28'),
      cvv: String(c.cvv || ''),
      organization: c.organization || 'UnionPay',
      cardTier: c.cardTier || 'standard',
      currency: c.currency || 'CNY',
      creditLimit: Number(c.creditLimit) || 0,
      balance: Number(c.balance) || 0,
      statementDay: Number(c.statementDay) || 1,
      dueDay: Number(c.dueDay) || 20,
      dueDayType: c.dueDayType || 'fixedDay',
      dueDaysOffset: Number(c.dueDaysOffset) || 20,
      currentBillAmount: Number(c.currentBillAmount) || 0,
      isBillPaid: Boolean(c.isBillPaid),
      annualFee: c.annualFee || {
        feeType: 'swipeCount',
        targetSwipeCount: 6,
        currentSwipeCount: 0,
        targetSpendAmount: 0,
        currentSpendAmount: 0,
        fixedChargeAmount: 0,
        targetPoints: 0,
        feeDueDate: '',
      },
      swipeTransactions: Array.isArray(c.swipeTransactions) ? c.swipeTransactions : [],
      phoneBank: c.phoneBank || '',
      notes: c.notes || '',
      cardColorTheme: c.cardColorTheme || 'black-gold',
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    if (mode === 'overwrite') {
      saveStoredCards(validCards);
      return { success: true, count: validCards.length, message: `成功导入 ${validCards.length} 张卡片（已覆盖现有数据）` };
    } else {
      const existing = getStoredCards();
      // 根据 cardNumber 或 id 去重
      const map = new Map<string, CardRecord>();
      existing.forEach(c => map.set(c.id, c));
      validCards.forEach(c => map.set(c.id, c));
      const combined = Array.from(map.values());
      saveStoredCards(combined);
      return { success: true, count: validCards.length, message: `成功合并导入 ${validCards.length} 张卡片，现有总卡数：${combined.length}` };
    }
  } catch (err: any) {
    return { success: false, count: 0, message: `解析失败：${err.message || 'JSON 语法错误'}` };
  }
}

/**
 * 导出为 CSV 格式
 */
export function exportCardsToCsv(cards: CardRecord[]): string {
  const headers = [
    '类型',
    '银行',
    '卡名称',
    '卡号',
    '持卡人',
    '有效期',
    '安全码(CVV)',
    '卡组织',
    '信用额度',
    '当前账单',
    '账单日',
    '还款日',
    '本期已还',
    '年费规则',
    '年费已刷/目标',
    '客服电话',
    '备注'
  ];

  const rows = cards.map(c => [
    c.type === 'credit' ? '信用卡' : '储蓄卡',
    `"${c.bankName}"`,
    `"${c.cardName}"`,
    `"\t${c.cardNumber}"`, // 前置tab防止Excel吃掉长数字
    `"${c.cardholder}"`,
    `"${c.expiryMonth}/${c.expiryYear}"`,
    `"${c.cvv}"`,
    `"${c.organization}"`,
    c.creditLimit,
    c.currentBillAmount,
    c.statementDay,
    c.dueDay,
    c.isBillPaid ? '是' : '否',
    `"${c.annualFee.feeType}"`,
    `"${c.annualFee.currentSwipeCount}/${c.annualFee.targetSwipeCount}"`,
    `"${c.phoneBank || ''}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
