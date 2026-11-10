export type CardType = 'credit' | 'debit';

export type CardOrganization = 'UnionPay' | 'Visa' | 'Mastercard' | 'American Express' | 'JCB' | 'Other';

export type CardTier = 'standard' | 'gold' | 'platinum' | 'diamond' | 'black';

export type AnnualFeeType = 
  | 'swipeCount'    // 刷满指定次数免次年
  | 'spendAmount'   // 刷满指定金额免次年
  | 'fixedCharge'   // 刚性扣收（不可免）
  | 'points'        // 积分兑换年费
  | 'lifetimeFree'; // 终身免年费

export interface AnnualFeePolicy {
  feeType: AnnualFeeType;
  targetSwipeCount: number;      // 目标刷卡次数 (例如 6 次)
  currentSwipeCount: number;     // 已刷次数 (例如 4 次)
  targetSpendAmount: number;     // 目标消费金额 (例如 10000 元)
  currentSpendAmount: number;    // 已刷金额
  fixedChargeAmount: number;     // 刚性年费金额 (例如 3600 元)
  targetPoints: number;          // 积分兑换所需积分
  feeDueDate: string;            // 年费到期日 / 核卡纪念日 (YYYY-MM-DD)
  notes?: string;                // 年费说明（例如：首年免，次年刷6次免）
}

export interface SwipeTransaction {
  id: string;
  date: string;
  amount: number;
  merchant?: string;
  note?: string;
}

export interface CardRecord {
  id: string;
  type: CardType;
  bankName: string;
  cardName: string;              // 卡片名称（例如：经典白金卡、工银黑金卡、薪享一卡通）
  cardNumber: string;            // 完整卡号
  cardholder?: string;           // 持卡人标识 (选填，隐私保护可留空或填“本人”)
  expiryMonth: string;           // 有效期月份 (01-12)
  expiryYear: string;            // 有效期年份 (YY 或 YYYY)
  cvv: string;                   // 安全码 (CVV/CVC 3-4位)
  organization: CardOrganization;
  cardTier: CardTier;
  currency: string;              // 币种 (CNY, USD, HKD, EUR等)
  creditLimit: number;           // 信用额度 (信用卡专属)
  balance: number;               // 余额 (储蓄卡) 或 可用额度 (信用卡)
  
  // 额度共享设置 (同银行多卡额度共享)
  isSharedLimit?: boolean;       // 是否与该行其他信用卡共享额度 (默认为 true)
  sharedLimitGroupId?: string;   // 共享额度组标识 (默认同银行归为一组)
  
  // 账单与还款信息
  statementDay: number;          // 每月账单日 (1-31)
  dueDay: number;                // 每月还款日 (1-31)
  dueDayType: 'fixedDay' | 'daysAfterStatement'; // 固定每月几号，或者账单日后N天
  dueDaysOffset: number;         // 账单日后第几天还款（例如 20 天）
  currentBillAmount: number;     // 本期应还账单金额
  isBillPaid: boolean;           // 本期是否已还清
  lastPaidDate?: string;         // 上次还款日期 (YYYY-MM-DD)
  lastPaidAmount?: number;       // 上次还款金额
  
  // 年费政策与进度
  annualFee: AnnualFeePolicy;
  
  // 交易记录（用于记录刷免进度）
  swipeTransactions?: SwipeTransaction[];

  // 快捷信息与备注
  phoneBank?: string;            // 银行客服热线 (例如 95555)
  notes?: string;                // 自定义备注 (例如：绑定微信/支付宝、海淘专用等)
  cardColorTheme?: string;       // 卡片渐变主题标识
  
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;            // 是否为系统预置的演示样卡
}

export type ViewTab = 'cards' | 'calendar' | 'annual_fee' | 'stats';

export type FilterType = 'all' | 'credit' | 'debit' | 'unpaid' | 'annual_pending' | 'due_soon';

export interface StorageSettings {
  privacyMode: boolean;          // 是否开启隐私模式（隐藏卡号敏感位和金额）
  pinCode?: string;              // 本地访问锁 PIN 码 (可选)
  isLocked: boolean;             // 当前是否锁屏
  theme: 'dark' | 'light';       // 主题
}
