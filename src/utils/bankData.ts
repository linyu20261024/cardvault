import { CardOrganization, CardTier } from '../types/card';

export interface BankConfig {
  id: string;
  name: string;
  shortName: string;
  logoColor: string;
  gradientClass: string;
  phone: string;
  website: string;
  defaultDueOffset: number; // 默认账单日后还款天数
}

export const BANK_CONFIGS: Record<string, BankConfig> = {
  '招商银行': {
    id: 'cmb',
    name: '招商银行',
    shortName: '招行',
    logoColor: '#DC2626',
    gradientClass: 'from-rose-900 via-red-900 to-neutral-950',
    phone: '95555',
    website: 'http://www.cmbchina.com',
    defaultDueOffset: 18,
  },
  '工商银行': {
    id: 'icbc',
    name: '中国工商银行',
    shortName: '工行',
    logoColor: '#B91C1C',
    gradientClass: 'from-zinc-900 via-neutral-900 to-red-950',
    phone: '95588',
    website: 'http://www.icbc.com.cn',
    defaultDueOffset: 25,
  },
  '建设银行': {
    id: 'ccb',
    name: '中国建设银行',
    shortName: '建行',
    logoColor: '#0284C7',
    gradientClass: 'from-blue-950 via-slate-900 to-sky-950',
    phone: '95533',
    website: 'http://www.ccb.com',
    defaultDueOffset: 20,
  },
  '中国银行': {
    id: 'boc',
    name: '中国银行',
    shortName: '中行',
    logoColor: '#C026D3',
    gradientClass: 'from-red-950 via-neutral-900 to-rose-950',
    phone: '95566',
    website: 'http://www.boc.cn',
    defaultDueOffset: 20,
  },
  '农业银行': {
    id: 'abc',
    name: '中国农业银行',
    shortName: '农行',
    logoColor: '#059669',
    gradientClass: 'from-emerald-950 via-slate-900 to-teal-950',
    phone: '95599',
    website: 'http://www.abchina.com',
    defaultDueOffset: 25,
  },
  '交通银行': {
    id: 'boco',
    name: '交通银行',
    shortName: '交行',
    logoColor: '#1D4ED8',
    gradientClass: 'from-blue-950 via-indigo-950 to-neutral-950',
    phone: '95559',
    website: 'http://www.bankcomm.com',
    defaultDueOffset: 25,
  },
  '中信银行': {
    id: 'citic',
    name: '中信银行',
    shortName: '中信',
    logoColor: '#E11D48',
    gradientClass: 'from-rose-950 via-neutral-900 to-red-950',
    phone: '95558',
    website: 'http://www.citicbank.com',
    defaultDueOffset: 19,
  },
  '浦发银行': {
    id: 'spdb',
    name: '上海浦东发展银行',
    shortName: '浦发',
    logoColor: '#0369A1',
    gradientClass: 'from-slate-900 via-sky-950 to-blue-950',
    phone: '95528',
    website: 'http://www.spdb.com.cn',
    defaultDueOffset: 20,
  },
  '广发银行': {
    id: 'cgb',
    name: '广发银行',
    shortName: '广发',
    logoColor: '#DC2626',
    gradientClass: 'from-amber-950 via-red-950 to-neutral-950',
    phone: '95508',
    website: 'http://www.cgbchina.com.cn',
    defaultDueOffset: 20,
  },
  '平安银行': {
    id: 'pab',
    name: '平安银行',
    shortName: '平安',
    logoColor: '#EA580C',
    gradientClass: 'from-orange-950 via-stone-900 to-amber-950',
    phone: '95511',
    website: 'http://bank.pingan.com',
    defaultDueOffset: 18,
  },
  '兴业银行': {
    id: 'cib',
    name: '兴业银行',
    shortName: '兴业',
    logoColor: '#2563EB',
    gradientClass: 'from-cyan-950 via-slate-900 to-blue-950',
    phone: '95561',
    website: 'http://www.cib.com.cn',
    defaultDueOffset: 20,
  },
  '民生银行': {
    id: 'cmbc',
    name: '中国民生银行',
    shortName: '民生',
    logoColor: '#0284C7',
    gradientClass: 'from-teal-950 via-slate-900 to-sky-950',
    phone: '95568',
    website: 'http://www.cmbc.com.cn',
    defaultDueOffset: 20,
  },
  '邮储银行': {
    id: 'psbc',
    name: '中国邮政储蓄银行',
    shortName: '邮储',
    logoColor: '#16A34A',
    gradientClass: 'from-emerald-950 via-neutral-900 to-green-950',
    phone: '95580',
    website: 'http://www.psbc.com',
    defaultDueOffset: 20,
  },
  '汇丰银行': {
    id: 'hsbc',
    name: '汇丰银行',
    shortName: '汇丰',
    logoColor: '#DC2626',
    gradientClass: 'from-red-950 via-zinc-900 to-neutral-950',
    phone: '95366',
    website: 'http://www.hsbc.com.cn',
    defaultDueOffset: 25,
  },
  '光大银行': {
    id: 'ceb',
    name: '中国光大银行',
    shortName: '光大',
    logoColor: '#7C3AED',
    gradientClass: 'from-purple-950 via-neutral-900 to-indigo-950',
    phone: '95595',
    website: 'http://www.cebbank.com',
    defaultDueOffset: 20,
  },
  '华夏银行': {
    id: 'hxb',
    name: '华夏银行',
    shortName: '华夏',
    logoColor: '#DC2626',
    gradientClass: 'from-red-950 via-rose-950 to-neutral-950',
    phone: '95577',
    website: 'http://www.hxb.com.cn',
    defaultDueOffset: 25,
  },
  '其他银行': {
    id: 'other',
    name: '其他银行',
    shortName: '银行',
    logoColor: '#64748B',
    gradientClass: 'from-slate-900 via-neutral-900 to-stone-950',
    phone: '',
    website: '',
    defaultDueOffset: 20,
  }
};

/**
 * 智能发卡银行名称标准化清洗器
 * 统一将各种缩写、别称、带"中国"前缀或空格换行清洗为系统核心标准银行名
 * 例如："中国工商银行" -> "工商银行"，"工行" -> "工商银行"，"招行" -> "招商银行"
 * 确保同一家银行下的多张卡片绝对归入同一授信组，避免额度被重复计算！
 */
export function normalizeBankName(rawName?: string): string {
  if (!rawName) return '其他银行';
  const clean = String(rawName).trim().replace(/[\s\t\r\n]+/g, '');
  if (!clean) return '其他银行';

  // 1. 招商银行
  if (/招商|招行|cmb/i.test(clean)) return '招商银行';

  // 2. 工商银行
  if (/工商|工行|icbc/i.test(clean)) return '工商银行';

  // 3. 建设银行
  if (/建设|建行|ccb/i.test(clean)) return '建设银行';

  // 4. 农业银行
  if (/农业|农行|abc/i.test(clean)) return '农业银行';

  // 5. 中国银行 (注意避开中信、中行区分)
  if (/^(中国银行|中行|boc)$/i.test(clean) || (clean.includes('中行') && !clean.includes('中信'))) {
    return '中国银行';
  }

  // 6. 交通银行
  if (/交通|交行|boco|bankcomm/i.test(clean)) return '交通银行';

  // 7. 中信银行
  if (/中信|citic/i.test(clean)) return '中信银行';

  // 8. 浦发银行
  if (/浦发|浦东发展|spdb/i.test(clean)) return '浦发银行';

  // 9. 广发银行
  if (/广发|广东发展|cgb/i.test(clean)) return '广发银行';

  // 10. 平安银行
  if (/平安|pab|pingan/i.test(clean)) return '平安银行';

  // 11. 兴业银行
  if (/兴业|cib/i.test(clean)) return '兴业银行';

  // 12. 民生银行
  if (/民生|cmbc/i.test(clean)) return '民生银行';

  // 13. 邮储银行
  if (/邮政|邮储|psbc/i.test(clean)) return '邮储银行';

  // 14. 光大银行
  if (/光大|ceb/i.test(clean)) return '光大银行';

  // 15. 华夏银行
  if (/华夏|hxb/i.test(clean)) return '华夏银行';

  // 16. 汇丰银行
  if (/汇丰|hsbc/i.test(clean)) return '汇丰银行';

  // 17. 渣打银行
  if (/渣打|scb/i.test(clean)) return '渣打银行';

  // 18. 花旗银行
  if (/花旗|citi/i.test(clean)) return '花旗银行';

  // 通用去掉开头的“中国”前缀（如“中国北京银行”->“北京银行”）
  let normalized = clean;
  if (normalized.startsWith('中国') && normalized.length > 4) {
    normalized = normalized.slice(2);
  }
  return normalized;
}

/**
 * 标准化持卡人标识（隐私保护：空值、本人、自己均统一映射为“本人”）
 */
export function normalizePerson(holder?: string): string {
  if (!holder) return '本人';
  const clean = holder.trim();
  if (!clean || /^(本人|自己|我|持卡人|self|me|owner|default)$/i.test(clean)) {
    return '本人';
  }
  return clean;
}

export const POPULAR_BANKS = Object.keys(BANK_CONFIGS);

export const THEME_GRADIENTS: { id: string; name: string; class: string; border: string }[] = [
  { id: 'black-gold', name: '黑金御尊', class: 'from-zinc-950 via-stone-900 to-neutral-900 text-amber-100', border: 'border-amber-500/30' },
  { id: 'platinum-silver', name: '铂金皓银', class: 'from-slate-900 via-slate-800 to-neutral-800 text-slate-100', border: 'border-slate-400/30' },
  { id: 'crimson-ruby', name: '红曜赤金', class: 'from-rose-950 via-red-950 to-neutral-950 text-rose-100', border: 'border-rose-500/30' },
  { id: 'sapphire-blue', name: '深海湛蓝', class: 'from-blue-950 via-slate-900 to-indigo-950 text-sky-100', border: 'border-sky-500/30' },
  { id: 'emerald-green', name: '翡翠墨绿', class: 'from-emerald-950 via-slate-950 to-teal-950 text-emerald-100', border: 'border-emerald-500/30' },
  { id: 'amethyst-purple', name: '极光幻紫', class: 'from-purple-950 via-slate-950 to-violet-950 text-purple-100', border: 'border-purple-500/30' },
  { id: 'carbon-titanium', name: '碳纤曜黑', class: 'from-neutral-950 via-zinc-950 to-neutral-900 text-neutral-100', border: 'border-neutral-700/50' },
];

export function detectCardOrganization(cardNumber: string): CardOrganization {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) return 'UnionPay';
  if (clean.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^(?:2131|1800|35)/.test(clean)) return 'JCB';
  if (clean.startsWith('62')) return 'UnionPay';
  return 'UnionPay';
}

export function formatCardNumber(num: string, masked: boolean = false): string {
  const clean = num.replace(/\D/g, '');
  if (masked) {
    if (clean.length < 8) return clean;
    const first4 = clean.slice(0, 4);
    const last4 = clean.slice(-4);
    return `${first4} **** **** ${last4}`;
  }
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatMoney(amount: number | undefined, currency: string = 'CNY'): string {
  if (amount === undefined || isNaN(amount)) return '¥ 0.00';
  const prefix = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'HKD' ? 'HK$' : '¥';
  return `${prefix} ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
