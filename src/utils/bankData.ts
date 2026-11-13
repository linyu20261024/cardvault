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

export const CARD_TIER_OPTIONS: { value: CardTier; label: string }[] = [
  { value: 'standard', label: '普卡' },
  { value: 'gold', label: '金卡' },
  { value: 'platinum', label: '白金卡' },
  { value: 'diamond', label: '钻石卡' },
  { value: 'black', label: '黑金卡' },
];

const CARD_TIER_LABEL_MAP: Record<CardTier, string> = {
  standard: '普卡',
  gold: '金卡',
  platinum: '白金卡',
  diamond: '钻石卡',
  black: '黑金卡',
};

export function getCardTierLabel(tier?: CardTier | string): string {
  if (!tier) return '普卡';
  return CARD_TIER_LABEL_MAP[tier as CardTier] || '普卡';
}

export function parseCardTierInput(raw?: string): CardTier | null {
  if (!raw) return null;
  const clean = raw.trim().toLowerCase();
  if (!clean) return null;
  if (/black|centurion|infinite|world\s*elite|黑金|无限|百夫长黑|世界之极/.test(clean)) return 'black';
  if (/diamond|钻石|私行|私人银行/.test(clean)) return 'diamond';
  if (/platinum|plat|白金|铂金/.test(clean)) return 'platinum';
  if (/gold|titanium|金卡|钛金/.test(clean)) return 'gold';
  if (/standard|classic|normal|普卡|标准/.test(clean)) return 'standard';
  return null;
}

/**
 * 常用银行卡 BIN (前6位/前4位) -> 卡片等级映射表
 * 说明：仅用于依据卡BIN识别卡片物理卡级，不推算也不提示卡片权益。
 */
const BIN_TIER_EXACT_6: Record<string, CardTier> = {
  // 黑金 / 无限 / 世界之极
  '622238': 'black', // 工银黑金
  '625961': 'black', // 工银高端黑金
  '370248': 'black', // 招行百夫长黑金
  '376966': 'black', // 民生/浦发黑金系列
  '552534': 'black', // 招行/世界之极高端万事达
  '549757': 'black', // 万事达世界之极
  '453242': 'black', // Visa Infinite

  // 钻石卡 / 世界卡
  '625808': 'diamond', // 招行钻石
  '625902': 'diamond', // 建行钻石
  '625362': 'diamond', // 银联钻石
  '625363': 'diamond', // 银联钻石
  '625999': 'diamond', // 银联高端钻石
  '625911': 'diamond', // 中行钻石
  '622982': 'diamond', // 银联钻石
  '622983': 'diamond', // 银联钻石

  // 白金卡
  '622575': 'platinum', '622576': 'platinum', '622577': 'platinum', '622578': 'platinum', '622579': 'platinum',
  '625802': 'platinum', '625803': 'platinum', '625805': 'platinum', '625806': 'platinum', '625809': 'platinum',
  '439227': 'platinum', '545619': 'platinum', '545620': 'platinum',
  '622230': 'platinum', '622231': 'platinum', '622232': 'platinum', '622233': 'platinum', '622235': 'platinum',
  '625330': 'platinum', '625331': 'platinum', '625332': 'platinum', '625960': 'platinum', '451804': 'platinum', '530980': 'platinum',
  '622166': 'platinum', '622168': 'platinum', '625955': 'platinum', '625956': 'platinum', '625957': 'platinum', '625958': 'platinum', '553242': 'platinum', '436745': 'platinum',
  '622788': 'platinum', '622760': 'platinum', '625905': 'platinum', '625906': 'platinum', '625907': 'platinum', '625910': 'platinum', '622752': 'platinum', '524865': 'platinum',
  '625996': 'platinum', '625997': 'platinum', '625998': 'platinum', '625336': 'platinum', '622836': 'platinum', '622837': 'platinum',
  '622253': 'platinum', '625028': 'platinum', '625029': 'platinum', '625946': 'platinum', '625947': 'platinum', '552853': 'platinum',
  '622918': 'platinum', '622919': 'platinum', '625801': 'platinum', '625951': 'platinum', '625952': 'platinum', '625953': 'platinum',
  '622518': 'platinum', '625959': 'platinum', '625993': 'platinum', '376968': 'platinum', '376969': 'platinum',
  '625071': 'platinum', '625072': 'platinum', '625807': 'platinum', '622569': 'platinum',
  '622155': 'platinum', '622156': 'platinum', '625978': 'platinum', '625979': 'platinum', '622989': 'platinum',
  '622908': 'platinum', '622909': 'platinum', '625900': 'platinum', '625901': 'platinum',
  '622622': 'platinum', '625912': 'platinum', '625913': 'platinum',
  '622658': 'platinum', '622659': 'platinum', '625975': 'platinum', '625976': 'platinum',
  '625919': 'platinum', '625920': 'platinum',
  '625967': 'platinum', '625968': 'platinum',

  // 金卡
  '622580': 'gold', '622581': 'gold', '622582': 'gold', '622588': 'gold', '439225': 'gold', '439226': 'gold', '518710': 'gold', '524090': 'gold', '356885': 'gold', '356886': 'gold',
  '622200': 'gold', '622202': 'gold', '622208': 'gold', '622210': 'gold', '622215': 'gold', '625338': 'gold', '451810': 'gold', '548259': 'gold',
  '622700': 'gold', '622160': 'gold', '622161': 'gold', '436742': 'gold', '532450': 'gold', '532458': 'gold',
  '622750': 'gold', '622751': 'gold', '625909': 'gold', '518378': 'gold', '456351': 'gold',
  '622848': 'gold', '622821': 'gold', '625995': 'gold', '535910': 'gold', '403361': 'gold',
  '622250': 'gold', '622251': 'gold', '622252': 'gold', '625025': 'gold', '458123': 'gold', '521899': 'gold',
  '622688': 'gold', '622689': 'gold', '622690': 'gold', '625800': 'gold', '433670': 'gold', '518212': 'gold',
  '622516': 'gold', '622517': 'gold', '622521': 'gold', '622522': 'gold', '456418': 'gold', '517650': 'gold',
  '622568': 'gold', '625070': 'gold', '406365': 'gold', '528931': 'gold',
  '622150': 'gold', '622151': 'gold', '625977': 'gold', '526855': 'gold',
  '622900': 'gold', '622901': 'gold', '622902': 'gold', '527414': 'gold',
  '622615': 'gold', '622617': 'gold', '622619': 'gold', '622620': 'gold', '517636': 'gold',
  '622650': 'gold', '622655': 'gold', '622656': 'gold', '406252': 'gold',
  '622810': 'gold', '622811': 'gold', '625918': 'gold',
  '622636': 'gold', '622637': 'gold', '625966': 'gold',

  // 普卡 / 标准借记卡
  '625908': 'standard',
  '622589': 'standard', '621286': 'standard', '621483': 'standard',
  '621226': 'standard', '622220': 'standard', '622225': 'standard', '621721': 'standard',
  '621700': 'standard', '621284': 'standard', '622280': 'standard',
  '621660': 'standard', '621661': 'standard', '621756': 'standard', '622755': 'standard',
  '622845': 'standard', '622846': 'standard', '621282': 'standard', '621336': 'standard',
  '622260': 'standard', '622262': 'standard', '621069': 'standard',
  '621768': 'standard', '622696': 'standard',
  '621792': 'standard', '622520': 'standard',
  '621462': 'standard', '622560': 'standard',
  '621626': 'standard', '622986': 'standard',
  '621691': 'standard', '622600': 'standard',
  '622660': 'standard', '621492': 'standard',
  '622188': 'standard', '621799': 'standard', '621098': 'standard',
  '621222': 'standard', '622630': 'standard',
};

export interface BinTierMatchResult {
  tier: CardTier;
  label: string;
  matchedBy: 'bin' | 'name' | 'default';
  binPrefix: string;
  matchedDesc: string;
}

/**
 * 根据卡BIN（前6位数字）及卡片名称匹配卡片等级
 */
export function detectCardTierByBin(cardNumber: string, cardName?: string): BinTierMatchResult {
  const clean = (cardNumber || '').replace(/\D/g, '');
  const bin6 = clean.slice(0, 6);
  const bin4 = clean.slice(0, 4);

  // 1. 优先精确匹配 6 位卡 BIN
  if (bin6.length === 6 && BIN_TIER_EXACT_6[bin6]) {
    const tier = BIN_TIER_EXACT_6[bin6];
    const label = getCardTierLabel(tier);
    return {
      tier,
      label,
      matchedBy: 'bin',
      binPrefix: bin6,
      matchedDesc: `卡BIN ${bin6} 匹配为${label}`,
    };
  }

  // 2. 匹配部分明确的高端国际卡组织 BIN 前缀
  if (bin4 === '3702') {
    return { tier: 'black', label: '黑金卡', matchedBy: 'bin', binPrefix: bin4, matchedDesc: `卡BIN ${bin4} 匹配为黑金卡` };
  }
  if (bin6.startsWith('6259') && cardName && /钻石/.test(cardName)) {
    return { tier: 'diamond', label: '钻石卡', matchedBy: 'bin', binPrefix: bin6, matchedDesc: `卡BIN ${bin6} 匹配为钻石卡` };
  }
  if (bin6.startsWith('6259')) {
    return { tier: 'platinum', label: '白金卡', matchedBy: 'bin', binPrefix: bin6, matchedDesc: `银联白金段 ${bin6} 匹配为白金卡` };
  }

  // 3. 结合卡片名称关键词辅助判断（仅当明确包含等级名称时）
  if (cardName) {
    const parsedFromName = parseCardTierInput(cardName);
    if (parsedFromName) {
      const label = getCardTierLabel(parsedFromName);
      return {
        tier: parsedFromName,
        label,
        matchedBy: 'name',
        binPrefix: bin6,
        matchedDesc: `卡名匹配为${label}`,
      };
    }
  }

  // 4. 默认返回普卡（不再默认套用白金卡）
  return {
    tier: 'standard',
    label: '普卡',
    matchedBy: 'default',
    binPrefix: bin6,
    matchedDesc: bin6 ? `卡BIN ${bin6} 未收录，默认普卡` : '默认普卡',
  };
}

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
