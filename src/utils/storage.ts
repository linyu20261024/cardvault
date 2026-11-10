import * as XLSX from 'xlsx';
import { CardRecord, StorageSettings, AnnualFeePolicy, AnnualFeeType } from '../types/card';
import { normalizeBankName, normalizePerson, BANK_CONFIGS } from './bankData';

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
    isSample: true,
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
    isSample: true,
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
    isSample: true,
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
    isSample: true,
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
    isSample: true,
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
    isSample: true,
  }
];

export function isSampleCard(card: CardRecord): boolean {
  return Boolean(card.isSample || (card.id && card.id.startsWith('sample-')));
}

export function removeSampleCards(cards: CardRecord[]): CardRecord[] {
  return cards.filter(c => !isSampleCard(c));
}

export function getStoredCards(): CardRecord[] {
  try {
    const raw = localStorage.getItem(CARDS_STORAGE_KEY);
    if (!raw) {
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
 * 智能年费政策提取解析器
 * 支持：
 * 1. 标准关键字：swipeCount, spendAmount, points, fixedCharge, lifetimeFree
 * 2. 中文类别：刷卡次数, 消费金额, 积分兑换, 刚性扣收, 终身免费
 * 3. 任意自然语言描述：
 *    - "刷卡满6次免年费" / "年刷12笔" / "首年免次年刷6次" -> swipeCount, target=6
 *    - "每年消费满20000元免" / "满3万免" -> spendAmount, target=20000 / 30000
 *    - "10000积分兑换次年年费" / "1万分兑换" -> points, target=10000
 *    - "刚性年费3600元不可减免" / "刚性200" -> fixedCharge, amount=3600 / 200
 *    - "终身免年费" / "借记卡无年费" -> lifetimeFree
 * 4. 进度列自动解析：
 *    - "0/6", "3/6", "5000/20000", "4"
 * 5. 用户原始填写的任何附加说明，均完整保留在 notes 字段中，绝不丢失！
 */
export function parseAnnualFeePolicy(rawPolicy: string = '', rawProgress: string = ''): AnnualFeePolicy {
  const policyStr = String(rawPolicy || '').trim();
  const progressStr = String(rawProgress || '').trim();

  let feeType: AnnualFeeType = 'swipeCount';
  let targetSwipeCount = 6;
  let currentSwipeCount = 0;
  let targetSpendAmount = 0;
  let currentSpendAmount = 0;
  let fixedChargeAmount = 0;
  let targetPoints = 0;
  let feeDueDate = '';

  // 1. 终身免年费 / 借记卡无年费 / 免费
  if (
    policyStr.toLowerCase() === 'lifetimefree' ||
    (/终身|终生|永久|免年费|无年费|不收年费|免费|免收/.test(policyStr) && !/次|笔|元|万|积分|分/.test(policyStr))
  ) {
    feeType = 'lifetimeFree';
    targetSwipeCount = 0;
    return {
      feeType,
      targetSwipeCount: 0,
      currentSwipeCount: 0,
      targetSpendAmount: 0,
      currentSpendAmount: 0,
      fixedChargeAmount: 0,
      targetPoints: 0,
      feeDueDate,
      notes: policyStr || '终身免年费'
    };
  }

  // 2. 积分兑换 (如 10000积分兑换, 1万分, 积分抵扣)
  if (
    policyStr.toLowerCase() === 'points' || 
    /积分|分兑换|分抵扣/.test(policyStr)
  ) {
    feeType = 'points';
    const match = policyStr.match(/(\d+(?:\.\d+)?)\s*(万)?\s*(?:积分|分)/);
    if (match) {
      const val = parseFloat(match[1]);
      targetPoints = match[2] ? val * 10000 : val;
    } else {
      const numMatch = policyStr.match(/\d+/);
      targetPoints = numMatch ? parseInt(numMatch[0], 10) : 10000;
    }
  }
  // 3. 消费金额免年费 (如 消费满20000元免, 满3万免, 年消费10000)
  else if (
    policyStr.toLowerCase() === 'spendamount' ||
    /(?:消费满|累计消费|年消费|满\s*\d+\s*(?:元|万)|刷满\s*\d+\s*(?:元|万)|消费金额)/.test(policyStr)
  ) {
    feeType = 'spendAmount';
    const match = policyStr.match(/(?:消费满|累计消费|年消费|满|刷满)?\s*(\d+(?:\.\d+)?)\s*(万|元)?/);
    if (match) {
      const val = parseFloat(match[1]);
      targetSpendAmount = match[2] === '万' ? val * 10000 : val;
    } else {
      targetSpendAmount = 10000;
    }
  }
  // 4. 刚性扣收 / 不可减免 (如 刚性年费3600元, 刚性200, 刚性扣收, 不可减免)
  else if (
    policyStr.toLowerCase() === 'fixedcharge' ||
    /刚性|不可减免|固定扣收|硬性|不可免/.test(policyStr)
  ) {
    feeType = 'fixedCharge';
    const match = policyStr.match(/(?:刚性(?:年费)?|不可减免|硬性|年费)?\s*(\d+(?:\.\d+)?)\s*元?/);
    if (match && match[1]) {
      fixedChargeAmount = parseFloat(match[1]);
    } else {
      fixedChargeAmount = 200;
    }
  }
  // 5. 刷卡次数免年费 (默认主流模式: 刷6次, 刷满5笔, 年刷12次, 消费6笔免次年)
  else {
    feeType = 'swipeCount';
    const match = policyStr.match(/(?:刷|消费|交易)?\s*(?:满)?\s*(\d+)\s*(?:次|笔)/);
    if (match) {
      targetSwipeCount = parseInt(match[1], 10);
    } else {
      // 提取纯数字（若小于等于100通常是刷卡次数）
      const numMatch = policyStr.match(/\d+/);
      if (numMatch && parseInt(numMatch[0], 10) > 0 && parseInt(numMatch[0], 10) <= 100) {
        targetSwipeCount = parseInt(numMatch[0], 10);
      } else {
        targetSwipeCount = 6;
      }
    }
  }

  // 解析进度列 (例如: "0/6", "3/6", "5000/20000", "4")
  if (progressStr) {
    if (progressStr.includes('/')) {
      const [curStr, tarStr] = progressStr.split('/');
      const cur = parseFloat(curStr);
      const tar = parseFloat(tarStr);
      if (!isNaN(cur)) {
        if (feeType === 'swipeCount') currentSwipeCount = cur;
        else if (feeType === 'spendAmount') currentSpendAmount = cur;
      }
      if (!isNaN(tar) && tar > 0) {
        if (feeType === 'swipeCount') targetSwipeCount = tar;
        else if (feeType === 'spendAmount') targetSpendAmount = tar;
        else if (feeType === 'points') targetPoints = tar;
        else if (feeType === 'fixedCharge') fixedChargeAmount = tar;
      }
    } else {
      const cur = parseFloat(progressStr);
      if (!isNaN(cur)) {
        if (feeType === 'swipeCount') currentSwipeCount = cur;
        else if (feeType === 'spendAmount') currentSpendAmount = cur;
      }
    }
  }

  return {
    feeType,
    targetSwipeCount,
    currentSwipeCount,
    targetSpendAmount,
    currentSpendAmount,
    fixedChargeAmount,
    targetPoints,
    feeDueDate,
    notes: policyStr || undefined,
  };
}

/**
 * 导出全部数据为 JSON
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
 * 从 JSON 导入卡片
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
      return { success: true, count: validCards.length, message: `成功导入 ${validCards.length} 张卡片（已全量覆盖现有卡包）` };
    } else {
      const existing = getStoredCards();
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
 * 标准表格列头定义（Excel 与 CSV 统一）
 */
/**
 * 标准表格列头定义（Excel 与 CSV 统一）
 */
export const SPREADSHEET_COLUMNS = [
  '类型(信用卡/储蓄卡)',
  '发卡银行',
  '卡片名称',
  '银行卡号',
  '额度性质(共享额度/独立额度)',
  '信用额度',
  '本期账单金额',
  '每月账单日(1-31)',
  '每月还款日(如: 账单日后18天 或 每月25号)',
  '本期已还(是/否)',
  '年费规则(支持任意自然语言描述，如: 刷6次免年费 / 消费满2万免 / 刚性3600元 / 终身免费)',
  '年费已刷/目标(如 0/6 或 3/6)',
  '有效期(MM/YY)',
  '安全码(CVV)',
  '卡组织(UnionPay/Visa/Mastercard)',
  '持卡人(选填，注重隐私可直接留空)',
  '客服电话',
  '私密备忘'
];

/**
 * 转换 CardRecord 数组为 2D 数组行
 */
function cardsToRows(cards: CardRecord[]): any[][] {
  return cards.map(c => [
    c.type === 'credit' ? '信用卡' : '储蓄卡',
    c.bankName,
    c.cardName,
    c.cardNumber, // Excel 单元格会设为文本格式，防止大数字科学计数法
    c.type === 'credit' ? (c.isSharedLimit !== false ? '共享额度' : '独立额度') : '无',
    c.type === 'credit' ? c.creditLimit : 0,
    c.type === 'credit' ? c.currentBillAmount : 0,
    c.statementDay,
    c.type === 'credit' 
      ? (c.dueDayType === 'daysAfterStatement' ? `账单日后${c.dueDaysOffset || 20}天` : `每月${c.dueDay}号`)
      : '实时到账',
    c.isBillPaid ? '是' : '否',
    c.annualFee.notes || (c.annualFee.feeType === 'swipeCount' ? `刷满${c.annualFee.targetSwipeCount}次免年费` : c.annualFee.feeType),
    c.annualFee.feeType === 'swipeCount' ? `${c.annualFee.currentSwipeCount}/${c.annualFee.targetSwipeCount}` : '',
    `${c.expiryMonth}/${c.expiryYear}`,
    c.cvv || '',
    c.organization,
    c.cardholder || '', // 隐私保护：支持留空
    c.phoneBank || '',
    c.notes || ''
  ]);
}

/**
 * 导出全部数据为原生 Excel (.xlsx) 文件 Blob
 */
export function exportCardsToExcelBlob(cards: CardRecord[]): Blob {
  const wb = XLSX.utils.book_new();
  const rows = [SPREADSHEET_COLUMNS, ...cardsToRows(cards)];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // 设置列宽
  ws['!cols'] = [
    { wch: 16 }, // 类型
    { wch: 14 }, // 发卡银行
    { wch: 22 }, // 卡片名称
    { wch: 24 }, // 银行卡号
    { wch: 16 }, // 额度性质
    { wch: 14 }, // 信用额度
    { wch: 14 }, // 本期账单金额
    { wch: 14 }, // 账单日
    { wch: 22 }, // 还款日规则
    { wch: 12 }, // 本期已还
    { wch: 38 }, // 年费规则
    { wch: 16 }, // 年费已刷/目标
    { wch: 14 }, // 有效期
    { wch: 12 }, // CVV
    { wch: 14 }, // 卡组织
    { wch: 16 }, // 持卡人
    { wch: 14 }, // 客服电话
    { wch: 32 }, // 私密备忘
  ];

  XLSX.utils.book_append_sheet(wb, ws, '我的银行卡');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * 获取标准 Excel 导入模板 (.xlsx)
 */
export function getStandardExcelTemplateBlob(): Blob {
  const wb = XLSX.utils.book_new();
  
  const sampleRow1 = [
    '信用卡',
    '招商银行',
    '经典白金信用卡',
    '6225881234567890',
    '共享额度',
    60000,
    5820.5,
    7,
    '账单日后18天 (次月到期)',
    '否',
    '10000积分兑换次年年费，主卡赠送洗车与体检',
    '0/10000',
    '08/29',
    '821',
    'UnionPay',
    '本人', // 隐私保护：可留空或填本人
    '95555',
    '生日月10倍积分'
  ];

  const sampleRow2 = [
    '信用卡',
    '工商银行',
    '工银黑金白金卡',
    '6222029988776655',
    '共享额度',
    100000,
    12000,
    1,
    '账单日后25天',
    '是',
    '刷满5笔免次年年费 (自然语言随意填写即可)',
    '4/5',
    '11/30',
    '914',
    'UnionPay',
    '', // 隐私保护：留空示例
    '95588',
    '差1笔达标'
  ];

  const sampleRow3 = [
    '储蓄卡',
    '招商银行',
    '一卡通工资借记卡',
    '6225880011223388',
    '无',
    0,
    0,
    1,
    '实时到账',
    '是',
    '终身免年费',
    '0/0',
    '12/35',
    '',
    'UnionPay',
    '', // 留空
    '95555',
    '工资卡与房贷扣款'
  ];

  const rows = [
    SPREADSHEET_COLUMNS,
    sampleRow1,
    sampleRow2,
    sampleRow3,
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 24 },
    { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 12 }, { wch: 38 }, { wch: 16 },
    { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
    { wch: 14 }, { wch: 32 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, '卡片批量维护模板');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * 导出为带 UTF-8 BOM 的 CSV 格式（防止 Excel 打开乱码）
 */
export function exportCardsToCsv(cards: CardRecord[]): string {
  const rows = cards.map(c => [
    c.type === 'credit' ? '信用卡' : '储蓄卡',
    `"${c.bankName}"`,
    `"${c.cardName}"`,
    `"\t${c.cardNumber}"`, // 前置Tab强行阻止Excel将长卡号吃成科学计数法
    `"${c.type === 'credit' ? (c.isSharedLimit !== false ? '共享额度' : '独立额度') : '无'}"`,
    c.creditLimit,
    c.currentBillAmount,
    c.statementDay,
    c.type === 'credit' ? `"${c.dueDayType === 'daysAfterStatement' ? `账单日后${c.dueDaysOffset || 20}天` : `每月${c.dueDay}号`}"` : '"实时到账"',
    c.isBillPaid ? '是' : '否',
    `"${(c.annualFee.notes || c.annualFee.feeType).replace(/"/g, '""')}"`,
    `"${c.annualFee.currentSwipeCount}/${c.annualFee.targetSwipeCount}"`,
    `"${c.expiryMonth}/${c.expiryYear}"`,
    `"${c.cvv || ''}"`,
    `"${c.organization}"`,
    `"${c.cardholder || ''}"`,
    `"${c.phoneBank || ''}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ]);

  return [SPREADSHEET_COLUMNS.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * 获取标准 CSV 模板字符串
 */
export function getStandardCsvTemplate(): string {
  const sampleRow1 = [
    '信用卡',
    '招商银行',
    '经典白金信用卡',
    '6225881234567890',
    '共享额度',
    '60000',
    '5000',
    '7',
    '账单日后18天',
    '否',
    '10000积分兑换次年年费',
    '0/10000',
    '08/29',
    '821',
    'UnionPay',
    '本人',
    '95555',
    '生日月10倍积分'
  ];

  const sampleRow2 = [
    '信用卡',
    '工商银行',
    '工银黑金白金卡',
    '6222029988776655',
    '共享额度',
    '100000',
    '12000',
    '1',
    '账单日后25天',
    '是',
    '刷满5笔免次年年费 (自然语言随意填写即可)',
    '4/5',
    '11/30',
    '914',
    'UnionPay',
    '',
    '95588',
    '差1笔达标'
  ];

  const sampleRow3 = [
    '储蓄卡',
    '招商银行',
    '一卡通工资借记卡',
    '6225880011223388',
    '无',
    '0',
    '0',
    '1',
    '实时到账',
    '是',
    '终身免年费',
    '0/0',
    '12/35',
    '',
    'UnionPay',
    '',
    '95555',
    '工资与理财'
  ];

  return [SPREADSHEET_COLUMNS.join(','), sampleRow1.join(','), sampleRow2.join(','), sampleRow3.join(',')].join('\n');
}

/**
 * 统一解析 2D 数组行到卡片对象
 */
/**
 * 统一解析 2D 数组行到卡片对象（搭载智能动态表头映射与容错机制）
 */
export function parseTableRowsToCards(
  rows: any[][], 
  mode: 'merge' | 'overwrite' = 'merge'
): { success: boolean; count: number; message: string; cards: CardRecord[] } {
  if (!rows || rows.length === 0) {
    return { success: false, count: 0, message: '表格为空，未检测到任何数据', cards: [] };
  }

  // 过滤全空行
  const validRows = rows.filter(r => r && r.length > 0 && r.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
  if (validRows.length === 0) {
    return { success: false, count: 0, message: '表格中无有效数据行', cards: [] };
  }

  // 1. 智能定位表头行并映射列名（扫描前 5 行，支持任意列顺序、增删列）
  let headerRowIndex = -1;
  const colMap: Record<string, number> = {};

  for (let r = 0; r < Math.min(5, validRows.length); r++) {
    const rowCells = validRows[r].map(c => String(c || '').trim().toLowerCase());
    const hasBank = rowCells.some(c => /银行|发卡行|bank/i.test(c));
    const hasCardNum = rowCells.some(c => /卡号|number|card_no/i.test(c));
    const hasType = rowCells.some(c => /类型|卡种|type/i.test(c));
    const hasLimit = rowCells.some(c => /额度|limit|授信/i.test(c));

    if ((hasBank && hasCardNum) || (hasBank && hasType) || (hasCardNum && hasLimit) || (hasBank && hasLimit)) {
      headerRowIndex = r;
      rowCells.forEach((c, idx) => {
        if (/类型|卡种|type/i.test(c) && colMap['type'] === undefined) colMap['type'] = idx;
        else if (/银行|发卡行|bank/i.test(c) && colMap['bank'] === undefined) colMap['bank'] = idx;
        else if (/卡片名称|卡名|卡产品|名称|name/i.test(c) && colMap['cardName'] === undefined) colMap['cardName'] = idx;
        else if (/卡号|银行卡号|number|card_no/i.test(c) && colMap['cardNumber'] === undefined) colMap['cardNumber'] = idx;
        else if (/共享|额度性质|是否共享|shared/i.test(c) && colMap['isSharedLimit'] === undefined) colMap['isSharedLimit'] = idx;
        else if (/(?:^|\s|信用|总)额度|授信|limit/i.test(c) && colMap['limit'] === undefined) colMap['limit'] = idx;
        else if (/账单金额|应还|当前账单|bill/i.test(c) && colMap['bill'] === undefined) colMap['bill'] = idx;
        else if (/账单日|对账单日|stmt/i.test(c) && colMap['stmtDay'] === undefined) colMap['stmtDay'] = idx;
        else if (/还款日|到期还款日|还款规则|还款|due/i.test(c) && colMap['dueDay'] === undefined) colMap['dueDay'] = idx;
        else if (/已还|是否还清|paid/i.test(c) && colMap['isPaid'] === undefined) colMap['isPaid'] = idx;
        else if (/年费规则|年费政策|年费|减免|政策|fee/i.test(c) && colMap['annualFee'] === undefined) colMap['annualFee'] = idx;
        else if (/已刷|进度|刷卡次数|progress/i.test(c) && colMap['feeProgress'] === undefined) colMap['feeProgress'] = idx;
        else if (/有效期|到期|expiry|exp/i.test(c) && colMap['expiry'] === undefined) colMap['expiry'] = idx;
        else if (/安全码|cvv|cvc/i.test(c) && colMap['cvv'] === undefined) colMap['cvv'] = idx;
        else if (/卡组织|组织|org/i.test(c) && colMap['organization'] === undefined) colMap['organization'] = idx;
        else if (/持卡人|姓名|holder/i.test(c) && colMap['cardholder'] === undefined) colMap['cardholder'] = idx;
        else if (/电话|客服|热线|phone/i.test(c) && colMap['phone'] === undefined) colMap['phone'] = idx;
        else if (/备注|备忘|说明|notes/i.test(c) && colMap['notes'] === undefined) colMap['notes'] = idx;
      });
      break;
    }
  }

  // 确定数据行
  const dataRows = headerRowIndex >= 0 ? validRows.slice(headerRowIndex + 1) : validRows;
  const parsedCards: CardRecord[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    // 过滤模板中的注释或说明行
    const rowStr = row.map(c => String(c || '').trim()).join(' ');
    if (/^#|示例|范例|提示说明|sample/i.test(rowStr)) continue;

    // 取值辅助函数（优先按列头名称映射，未匹配时按位置降级）
    const getVal = (key: string, fallbackIdx: number): string => {
      const idx = colMap[key] !== undefined ? colMap[key] : fallbackIdx;
      return idx >= 0 && row[idx] !== null && row[idx] !== undefined ? String(row[idx]).trim() : '';
    };

    const typeRaw = getVal('type', 0).toLowerCase();
    const isDebit = typeRaw.includes('储蓄') || typeRaw.includes('借记') || typeRaw === 'debit';
    const type: CardRecord['type'] = isDebit ? 'debit' : 'credit';

    // 银行名称归一化清洗：将“中国工商银行”、“工行”等统一规范为核心银行名，确保同行共享额度不被重复计算
    const rawBank = getVal('bank', 1) || '其他银行';
    const bankName = normalizeBankName(rawBank);
    const cardName = getVal('cardName', 2) || (isDebit ? '储蓄借记卡' : '信用卡');
    
    // 清理卡号：去掉制表符、单双引号、空格，并处理大数字科学计数法
    let cardNumber = getVal('cardNumber', 3).replace(/[\t\s"']/g, '');
    if (/^\d+(\.\d+)?[eE]\+\d+$/.test(cardNumber)) {
      try {
        cardNumber = BigInt(Math.round(Number(cardNumber))).toString();
      } catch {}
    }

    // 若没有任何有效卡号、卡名或银行，则视为无效空行跳过
    if (!cardNumber && !getVal('bank', 1) && !getVal('cardName', 2)) {
      continue;
    }

    // 额度共享性质：同行信用卡默认共享（除非写了“独立”）
    const sharedRaw = getVal('isSharedLimit', 4);
    const isSharedLimit = sharedRaw.includes('独立') ? false : true;

    // 持卡人：完全选填，保护隐私支持留空或“本人”
    const rawHolder = getVal('cardholder', 15);
    const cardholder = rawHolder && rawHolder.trim() !== '本人' ? rawHolder.trim() : '';

    const expiry = getVal('expiry', 12) || '12/29';
    const [m = '12', y = '29'] = expiry.split('/');
    const cvv = getVal('cvv', 13).replace(/[\s"']/g, '');
    
    let organization = getVal('organization', 14) || 'UnionPay';
    if (/visa/i.test(organization)) organization = 'Visa';
    else if (/master/i.test(organization)) organization = 'Mastercard';
    else if (/amex|american/i.test(organization)) organization = 'American Express';
    else if (/jcb/i.test(organization)) organization = 'JCB';
    else organization = 'UnionPay';

    const limit = Number(getVal('limit', 5)) || 0;
    const bill = Number(getVal('bill', 6)) || 0;
    const stmtDay = Math.min(31, Math.max(1, Number(getVal('stmtDay', 7)) || 5));

    // -------------------------------------------------------------
    // 智能还款日解析：全面适配“账单日后固定天数（如18天/25天/20天）”与跨月还款
    // 支持填写："账单日后18天", "后25天", "+20天", "18天", "次月13号", 或纯数字 18 / 13 / 25
    // -------------------------------------------------------------
    const dueRaw = getVal('dueDay', 8).trim();
    let dueDayType: 'fixedDay' | 'daysAfterStatement' = 'fixedDay';
    let dueDaysOffset = 20;
    let dueDay = 25;

    const bankCfg = BANK_CONFIGS[bankName];
    const defaultOffset = bankCfg?.defaultDueOffset || 20;

    const offsetMatch = dueRaw.match(/(?:账单(?:日)?后|后|\+)?\s*(\d+)\s*天?/);
    if (/天|offset|after/i.test(dueRaw) || /账单(?:日)?后|后\d+/i.test(dueRaw)) {
      dueDayType = 'daysAfterStatement';
      if (offsetMatch && offsetMatch[1]) {
        dueDaysOffset = parseInt(offsetMatch[1], 10);
      } else {
        dueDaysOffset = defaultOffset;
      }
      dueDay = ((stmtDay - 1 + dueDaysOffset) % 30) + 1;
    } else {
      const numMatch = dueRaw.match(/\d+/);
      const parsedNum = numMatch ? parseInt(numMatch[0], 10) : NaN;

      if (!isNaN(parsedNum)) {
        if (parsedNum > 31) {
          dueDayType = 'daysAfterStatement';
          dueDaysOffset = parsedNum;
          dueDay = ((stmtDay - 1 + dueDaysOffset) % 30) + 1;
        } else {
          // 数字在 1-31 之间
          if (bankCfg && bankCfg.defaultDueOffset && (parsedNum === bankCfg.defaultDueOffset || parsedNum < stmtDay)) {
            dueDayType = 'daysAfterStatement';
            if (parsedNum === bankCfg.defaultDueOffset) {
              dueDaysOffset = bankCfg.defaultDueOffset;
              dueDay = ((stmtDay - 1 + dueDaysOffset) % 30) + 1;
            } else {
              // 跨月到次月 parsedNum 号，计算天数差（例如账单日25号，还款日13号 -> 约18天）
              const estOffset = (30 - stmtDay) + parsedNum;
              dueDaysOffset = estOffset > 0 && estOffset <= 35 ? estOffset : defaultOffset;
              dueDay = parsedNum;
            }
          } else {
            dueDayType = 'fixedDay';
            dueDay = parsedNum;
            dueDaysOffset = parsedNum < stmtDay ? (30 - stmtDay) + parsedNum : (parsedNum - stmtDay);
          }
        }
      } else {
        if (bankCfg && bankCfg.defaultDueOffset) {
          dueDayType = 'daysAfterStatement';
          dueDaysOffset = bankCfg.defaultDueOffset;
          dueDay = ((stmtDay - 1 + dueDaysOffset) % 30) + 1;
        } else {
          dueDayType = 'fixedDay';
          dueDay = 25;
          dueDaysOffset = 20;
        }
      }
    }

    const isPaid = getVal('isPaid', 9).includes('是') || getVal('isPaid', 9).toLowerCase() === 'true';

    // 智能解析年费政策（支持自然语言或标准词）
    const policyRaw = getVal('annualFee', 10);
    const progressRaw = getVal('feeProgress', 11);
    const annualFee = isDebit 
      ? {
          feeType: 'lifetimeFree' as const,
          targetSwipeCount: 0,
          currentSwipeCount: 0,
          targetSpendAmount: 0,
          currentSpendAmount: 0,
          fixedChargeAmount: 0,
          targetPoints: 0,
          feeDueDate: '',
          notes: '储蓄卡终身免年费与账户管理费'
        }
      : parseAnnualFeePolicy(policyRaw, progressRaw);

    const phone = getVal('phone', 16) || bankCfg?.phone || '';
    const notes = getVal('notes', 17);

    parsedCards.push({
      id: `batch_card_${Date.now()}_${i}`,
      type,
      bankName,
      cardName,
      cardNumber,
      cardholder, // 隐私保护
      isSharedLimit: type === 'credit' ? isSharedLimit : false,
      expiryMonth: m.padStart(2, '0').slice(-2),
      expiryYear: y.length === 4 ? y.slice(-2) : y,
      cvv,
      organization: organization as any,
      cardTier: 'platinum',
      currency: 'CNY',
      creditLimit: isDebit ? 0 : limit,
      balance: isDebit ? limit : 0,
      statementDay: stmtDay,
      dueDay,
      dueDayType,
      dueDaysOffset,
      currentBillAmount: isDebit ? 0 : bill,
      isBillPaid: isDebit ? true : isPaid,
      annualFee,
      swipeTransactions: [],
      phoneBank: phone,
      notes,
      cardColorTheme: 'black-gold',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (parsedCards.length === 0) {
    return { success: false, count: 0, message: '未能从表格中解析出任何有效卡片，请确认表格中包含有效卡片数据。', cards: [] };
  }

  let finalCards: CardRecord[] = [];
  if (mode === 'overwrite') {
    finalCards = parsedCards;
    saveStoredCards(finalCards);
    return { 
      success: true, 
      count: finalCards.length, 
      message: `成功导入 ${finalCards.length} 张卡片（已全量覆盖现有卡包，历史样卡已彻底替换）`,
      cards: finalCards
    };
  } else {
    const existing = getStoredCards();
    const map = new Map<string, CardRecord>();
    // 先塞入已有的卡
    existing.forEach(c => map.set(c.cardNumber || c.id, c));
    // 导入的卡覆盖或新增
    parsedCards.forEach(c => map.set(c.cardNumber || c.id, c));
    finalCards = Array.from(map.values());
    saveStoredCards(finalCards);
    return { 
      success: true, 
      count: parsedCards.length, 
      message: `成功增量合并 ${parsedCards.length} 张卡片，现有卡包总数：${finalCards.length} 张`,
      cards: finalCards
    };
  }
}

/**
 * 智能读取用户上传的文件（自动区分 .xlsx / .xls 与 .csv，并自动解决 GBK / ANSI / UTF-8 乱码）
 */
export async function parseUploadedFileToCards(
  file: File, 
  mode: 'merge' | 'overwrite' = 'merge'
): Promise<{ success: boolean; count: number; message: string; cards: CardRecord[] }> {
  try {
    const fileName = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();

    // 1. 如果是原生 Excel 工作簿 (.xlsx 或 .xls)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return { success: false, count: 0, message: 'Excel 文件内没有工作表', cards: [] };
      }
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false });
      return parseTableRowsToCards(rows, mode);
    }

    // 2. 如果是 CSV 文件：处理 Windows Excel 默认导出的 ANSI (GBK/GB2312) 以及 UTF-8 编码，杜绝乱码！
    const bytes = new Uint8Array(buffer);
    let csvText = '';

    // 检测 UTF-8 BOM (0xEF, 0xBB, 0xBF)
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      csvText = new TextDecoder('utf-8').decode(bytes.subarray(3));
    } else {
      // 尝试严格 UTF-8 解码，如果遇到非 UTF-8 字符（即 Excel 的 GBK/ANSI），切换到 GBK 解码
      try {
        csvText = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch {
        try {
          csvText = new TextDecoder('gbk').decode(bytes);
        } catch {
          // 兜底降级
          csvText = new TextDecoder('utf-8').decode(bytes);
        }
      }
    }

    return parseCsvToCards(csvText, mode);
  } catch (err: any) {
    return { success: false, count: 0, message: `文件解析失败: ${err.message || '未知文件错误'}`, cards: [] };
  }
}

/**
 * 原有 parseCsvToCards 接口升级（接入智能年费解析与双引号转义）
 */
export function parseCsvToCards(
  csvText: string, 
  mode: 'merge' | 'overwrite' = 'merge'
): { success: boolean; count: number; message: string; cards: CardRecord[] } {
  try {
    const cleanText = csvText.replace(/^\uFEFF/, '').trim();
    if (!cleanText) {
      return { success: false, count: 0, message: 'CSV 内容为空', cards: [] };
    }

    const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      return { success: false, count: 0, message: 'CSV 表格缺少有效数据行', cards: [] };
    }

    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const rows = lines.map(line => parseRow(line));
    return parseTableRowsToCards(rows, mode);
  } catch (err: any) {
    return { success: false, count: 0, message: `CSV 解析失败: ${err.message}`, cards: [] };
  }
}
