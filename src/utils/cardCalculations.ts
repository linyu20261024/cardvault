import { CardRecord, AnnualFeePolicy } from '../types/card';
import { normalizeBankName, normalizePerson } from './bankData';

export interface BillStatusResult {
  hasBill: boolean;
  statementDate: Date;
  dueDate: Date;
  statementDateStr: string;
  dueDateStr: string;
  dueDateDisplay: string;        // 友好显示，如：“次月13日 (账单日后18天)” 或 “当月25日”
  isCrossMonth: boolean;          // 是否跨月还款
  ruleDescription: string;       // 还款日规则描述
  daysUntilDue: number;          // 负数表示逾期天数，0表示今日到期，正数表示剩余天数
  status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'unpaid' | 'unbilled';
  statusText: string;
  statusBadgeClass: string;
  todayGracePeriodDays: number;  // 今天刷卡可享受的免息天数
  isBestCardToSwipeToday: boolean;
}

export interface AnnualFeeStatusResult {
  status: 'lifetime_free' | 'waived' | 'urgent' | 'warning' | 'in_progress' | 'charge_fixed';
  statusText: string;
  statusBadgeClass: string;
  progressPercent: number;
  daysRemaining: number;
  isUrgent: boolean; // 是否需要紧急提醒
  advice: string;
}

// 辅助函数：根据年月与指定日期生成合法 Date
function createSafeDate(year: number, monthIndex: number, day: number): Date {
  const maxDay = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(day, maxDay);
  return new Date(year, monthIndex, safeDay, 0, 0, 0, 0);
}

/**
 * 辅助计算特定出账日对应的到期还款日（全面适配“账单日后固定天数跨月”与“固定每月几号跨月”）
 */
export function computeDueDateForStatement(
  stmtDate: Date, 
  card: { statementDay: number; dueDayType?: 'fixedDay' | 'daysAfterStatement'; dueDaysOffset?: number; dueDay?: number }
): { dueDate: Date; isCrossMonth: boolean; offsetDays: number; displayStr: string } {
  const offset = Number(card.dueDaysOffset) || 20;
  let dueDate: Date;
  let isCrossMonth = false;
  let offsetDays = offset;

  if (card.dueDayType === 'daysAfterStatement') {
    dueDate = new Date(stmtDate);
    dueDate.setDate(dueDate.getDate() + offset);
    isCrossMonth = dueDate.getMonth() !== stmtDate.getMonth();
    const prefix = isCrossMonth ? '次月' : '当月';
    return {
      dueDate,
      isCrossMonth,
      offsetDays: offset,
      displayStr: `${prefix}${dueDate.getDate()}日 (账单日后${offset}天)`,
    };
  } else {
    // 固定还款日模式
    const dDay = Number(card.dueDay) || 20;
    const stmtDay = stmtDate.getDate();
    // 如果还款日数字 <= 账单日数字，必定是跨入次月还款（例如建行账单日12号，还款日2号 -> 次月2号）
    isCrossMonth = dDay <= stmtDay;
    if (isCrossMonth) {
      dueDate = createSafeDate(stmtDate.getFullYear(), stmtDate.getMonth() + 1, dDay);
    } else {
      dueDate = createSafeDate(stmtDate.getFullYear(), stmtDate.getMonth(), dDay);
    }
    const msDiff = dueDate.getTime() - stmtDate.getTime();
    offsetDays = Math.round(msDiff / (1000 * 60 * 60 * 24));
    const prefix = isCrossMonth ? '次月' : '每月';
    return {
      dueDate,
      isCrossMonth,
      offsetDays,
      displayStr: `${prefix}${dDay}日 (固定还款)`,
    };
  }
}

/**
 * 计算信用卡的账单状态、还款倒计时及今日刷卡免息期
 * 核心适配：账单日后固定天数（如招行18天、工行25天、广发20天）的精准跨月滚动计算
 */
export function calculateBillStatus(card: CardRecord, referenceDate: Date = new Date()): BillStatusResult {
  if (card.type !== 'credit') {
    const today = new Date(referenceDate);
    return {
      hasBill: false,
      statementDate: today,
      dueDate: today,
      statementDateStr: '-',
      dueDateStr: '-',
      dueDateDisplay: '实时到账',
      isCrossMonth: false,
      ruleDescription: '借记卡活期',
      daysUntilDue: 0,
      status: 'unbilled',
      statusText: '储蓄卡',
      statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      todayGracePeriodDays: 0,
      isBestCardToSwipeToday: false,
    };
  }

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const curYear = today.getFullYear();
  const curMonth = today.getMonth(); // 0-11
  const curDay = today.getDate();

  const stmtDay = Math.min(31, Math.max(1, card.statementDay || 1));
  
  // 1. 计算最近账单周期
  // 如果今天 >= 账单日，本期账单日为当月 stmtDay；否则为上月 stmtDay
  let currentStmtDate: Date;
  let nextStmtDate: Date;

  if (curDay >= stmtDay) {
    currentStmtDate = createSafeDate(curYear, curMonth, stmtDay);
    nextStmtDate = createSafeDate(curYear, curMonth + 1, stmtDay);
  } else {
    currentStmtDate = createSafeDate(curYear, curMonth - 1, stmtDay);
    nextStmtDate = createSafeDate(curYear, curMonth, stmtDay);
  }

  // 2. 计算当前账单对应的到期还款日
  const currentDueInfo = computeDueDateForStatement(currentStmtDate, card);
  let dueDate = currentDueInfo.dueDate;
  let isCrossMonth = currentDueInfo.isCrossMonth;
  let dueDateDisplay = currentDueInfo.displayStr;

  const msPerDay = 1000 * 60 * 60 * 24;
  let daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / msPerDay);

  let status: BillStatusResult['status'] = 'unpaid';
  let statusText = '待还款';
  let statusBadgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

  // 如果本期账单已全额还清，或者账单金额为0，且当前日期已经过了旧账单日，展示下一个即将出账与还款周期
  if (card.isBillPaid || card.currentBillAmount <= 0) {
    status = 'paid';
    statusText = '本期已还清';
    statusBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  } else if (daysUntilDue < 0) {
    status = 'overdue';
    statusText = `已逾期 ${Math.abs(daysUntilDue)} 天`;
    statusBadgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  } else if (daysUntilDue === 0) {
    status = 'due_today';
    statusText = '今日最后还款日';
    statusBadgeClass = 'bg-rose-500/20 text-rose-600 dark:text-rose-300 font-semibold border-rose-500/40';
  } else if (daysUntilDue <= 5) {
    status = 'due_soon';
    statusText = `仅剩 ${daysUntilDue} 天还款`;
    statusBadgeClass = 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
  } else {
    status = 'unpaid';
    statusText = `距离还款 ${daysUntilDue} 天`;
    statusBadgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  }

  // 3. 计算今天刷卡免息期 (Grace Period Calculation)
  // 如果今天刷卡：
  // 若今天 <= 当前月份账单日，该笔消费会在本月账单日出账，在当前周期 dueDate 还款。
  // 若今天 > 当前月份账单日，该笔消费会在下月账单日 (nextStmtDate) 出账，并在下期还款日还款（最长免息期！）
  let swipeBillStmtDate: Date;
  if (curDay <= stmtDay) {
    swipeBillStmtDate = createSafeDate(curYear, curMonth, stmtDay);
  } else {
    swipeBillStmtDate = createSafeDate(curYear, curMonth + 1, stmtDay);
  }

  const swipeDueInfo = computeDueDateForStatement(swipeBillStmtDate, card);
  const todayGracePeriodDays = Math.max(0, Math.round((swipeDueInfo.dueDate.getTime() - today.getTime()) / msPerDay));

  const formatLocalDate = (d: Date) => {
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const ruleDescription = card.dueDayType === 'daysAfterStatement'
    ? `账单日后${card.dueDaysOffset || 20}天还款${isCrossMonth ? ' (跨月)' : ''}`
    : `每月${card.dueDay || 20}号还款${isCrossMonth ? ' (跨月)' : ''}`;

  return {
    hasBill: true,
    statementDate: currentStmtDate,
    dueDate,
    statementDateStr: formatLocalDate(currentStmtDate),
    dueDateStr: formatLocalDate(dueDate),
    dueDateDisplay,
    isCrossMonth,
    ruleDescription,
    daysUntilDue,
    status,
    statusText,
    statusBadgeClass,
    todayGracePeriodDays,
    isBestCardToSwipeToday: false,
  };
}

/**
 * 计算年费政策达标情况及提醒
 */
export function calculateAnnualFeeStatus(policy: AnnualFeePolicy, referenceDate: Date = new Date()): AnnualFeeStatusResult {
  if (policy.feeType === 'lifetimeFree') {
    return {
      status: 'lifetime_free',
      statusText: '终身免年费',
      statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      progressPercent: 100,
      daysRemaining: 999,
      isUrgent: false,
      advice: '该卡无年费收取担忧，放心使用。',
    };
  }

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  let daysRemaining = 365;
  if (policy.feeDueDate) {
    const feeDate = new Date(policy.feeDueDate);
    feeDate.setHours(0, 0, 0, 0);
    daysRemaining = Math.round((feeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (policy.feeType === 'fixedCharge') {
    const isUrgent = daysRemaining >= 0 && daysRemaining <= 30;
    return {
      status: 'charge_fixed',
      statusText: `刚性年费 ¥${policy.fixedChargeAmount || 0}`,
      statusBadgeClass: isUrgent 
        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
        : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20',
      progressPercent: 0,
      daysRemaining,
      isUrgent,
      advice: daysRemaining < 0 
        ? '已过扣款日，请留意账单' 
        : `将在 ${daysRemaining} 天后扣收刚性年费 ¥${policy.fixedChargeAmount || 0}，请备足额度。`,
    };
  }

  // 刷卡次数免
  if (policy.feeType === 'swipeCount') {
    const target = policy.targetSwipeCount || 1;
    const current = policy.currentSwipeCount || 0;
    const progressPercent = Math.min(100, Math.round((current / target) * 100));
    const isWaived = current >= target;

    if (isWaived) {
      return {
        status: 'waived',
        statusText: `已达标 (${current}/${target}次)`,
        statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        progressPercent: 100,
        daysRemaining,
        isUrgent: false,
        advice: `本周期已刷 ${current} 次，免年费条件已完全达成！`,
      };
    }

    const needed = target - current;
    const isUrgent = daysRemaining <= 30 && daysRemaining >= 0;
    const isWarning = daysRemaining <= 60 && daysRemaining > 30;

    let statusBadgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    let status: AnnualFeeStatusResult['status'] = 'in_progress';
    if (isUrgent) {
      status = 'urgent';
      statusBadgeClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    } else if (isWarning) {
      status = 'warning';
      statusBadgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }

    return {
      status,
      statusText: `待刷 ${needed} 次 (${current}/${target})`,
      statusBadgeClass,
      progressPercent,
      daysRemaining,
      isUrgent,
      advice: `还需刷卡 ${needed} 次即可免次年年费，剩余 ${daysRemaining} 天到期。建议近期绑定微信/支付宝刷两笔小额！`,
    };
  }

  // 消费金额免
  if (policy.feeType === 'spendAmount') {
    const target = policy.targetSpendAmount || 1;
    const current = policy.currentSpendAmount || 0;
    const progressPercent = Math.min(100, Math.round((current / target) * 100));
    const isWaived = current >= target;

    if (isWaived) {
      return {
        status: 'waived',
        statusText: `金额达标 (已消费¥${current})`,
        statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        progressPercent: 100,
        daysRemaining,
        isUrgent: false,
        advice: `消费金额已满 ¥${target}，年费已豁免。`,
      };
    }

    const diff = target - current;
    const isUrgent = daysRemaining <= 30 && daysRemaining >= 0;

    return {
      status: isUrgent ? 'urgent' : 'in_progress',
      statusText: `还差 ¥${diff.toLocaleString()}`,
      statusBadgeClass: isUrgent 
        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      progressPercent,
      daysRemaining,
      isUrgent,
      advice: `还需消费 ¥${diff.toLocaleString()} 达标免年费，剩余 ${daysRemaining} 天。`,
    };
  }

  // 积分兑换
  return {
    status: 'in_progress',
    statusText: `需 ${policy.targetPoints || 0} 积分抵扣`,
    statusBadgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    progressPercent: 50,
    daysRemaining,
    isUrgent: daysRemaining <= 30 && daysRemaining >= 0,
    advice: `年费日可用 ${policy.targetPoints || 0} 信用卡积分进行年费冲抵。`,
  };
}

export interface BankCreditSummary {
  bankName: string;             // 标准化银行名称
  displayName: string;          // 展示名称 (如包含持卡人区分)
  cardholder: string;           // 归属持卡人（默认为“本人”）
  sharedLimit: number;          // 同行共享授信（该行开启共享的卡片中的最大额度）
  independentLimit: number;     // 独立额度卡片总和
  effectiveTotalLimit: number;  // 该行实际综合授信 = sharedLimit + independentLimit
  nominalTotalLimit: number;    // 单卡累加名义额度
  deductedSharedLimit: number;  // 因共享额度去重掉的虚高额度 (nominalTotalLimit - effectiveTotalLimit)
  currentDebt: number;          // 当前应还负债总额
  availableCredit: number;      // 当前剩余可用额度
  cardCount: number;
  sharedCardsCount: number;
  independentCardsCount: number;
  cards: CardRecord[];
}

export interface TotalCreditOverview {
  effectiveTotalLimit: number;   // 真实总授信（已合并同行多卡共享额度）
  nominalTotalLimit: number;     // 单卡累加名义总额度
  deductedSharedLimit: number;   // 因共享额度去重掉的虚高额度 (nominalTotalLimit - effectiveTotalLimit)
  totalDebt: number;             // 当前总负债
  availableCredit: number;       // 实际剩余可用信用额度
  utilizationRate: number;       // 真实信用额度使用率 (0-100%)
  bankSummaries: BankCreditSummary[];
}

/**
 * 智能计算银行授信与额度共享汇总（同行多张信用卡默认共享同一额度池）
 * 解决痛点：
 * 1. 银行名称清洗归一：将“中国工商银行”与“工商银行”、“招行”与“招商银行”彻底归并为同一发卡行，绝不重复计算
 * 2. 同一人名下归组：持卡人留空、填“本人”或同名，均视为同一持卡人并共享授信池
 * 3. 共享额度计算：同一银行同一人名下开启共享的卡，取最大额度作为真实授信；独立卡单独累加
 */
export function calculateBankCreditSummaries(cards: CardRecord[]): TotalCreditOverview {
  const creditCards = cards.filter(c => c.type === 'credit');

  // 1. 检查是否存在多个不同的明确持卡人姓名（例如张三 vs 李四）
  const distinctPersons = new Set<string>();
  creditCards.forEach(c => {
    distinctPersons.add(normalizePerson(c.cardholder));
  });
  const hasMultiplePersons = distinctPersons.size > 1;

  // 2. 按照 (标准化持卡人, 标准化银行) 联合分组
  const groups = new Map<string, { normPerson: string; normBank: string; cards: CardRecord[] }>();
  creditCards.forEach(c => {
    const normBank = normalizeBankName(c.bankName);
    const normPerson = normalizePerson(c.cardholder);
    const groupKey = `${normPerson}:::${normBank}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { normPerson, normBank, cards: [] });
    }
    groups.get(groupKey)!.cards.push(c);
  });

  const bankSummaries: BankCreditSummary[] = [];
  let effectiveTotalLimit = 0;
  let nominalTotalLimit = 0;
  let totalDebt = 0;

  groups.forEach(({ normPerson, normBank, cards: bankCards }) => {
    // 默认同银行信用卡为共享额度（只要没显式设置 isSharedLimit === false，均视为共享）
    const sharedCards = bankCards.filter(c => c.isSharedLimit !== false);
    const independentCards = bankCards.filter(c => c.isSharedLimit === false);

    // 共享额度：取同银行同一持卡人名下所有共享卡的最大授信额度（例如3张招行卡额度都是6万，该行共享总授信就是6万）
    const sharedLimit = sharedCards.length > 0 
      ? Math.max(...sharedCards.map(c => Number(c.creditLimit) || 0))
      : 0;
    
    // 独立额度：单独累加
    const independentLimit = independentCards.reduce((acc, c) => acc + (Number(c.creditLimit) || 0), 0);

    const bankEffectiveLimit = sharedLimit + independentLimit;
    const bankNominalLimit = bankCards.reduce((acc, c) => acc + (Number(c.creditLimit) || 0), 0);
    const bankDeducted = Math.max(0, bankNominalLimit - bankEffectiveLimit);
    const bankDebt = bankCards.reduce((acc, c) => acc + (Number(c.currentBillAmount) || 0), 0);
    const bankAvailable = Math.max(0, bankEffectiveLimit - bankDebt);

    effectiveTotalLimit += bankEffectiveLimit;
    nominalTotalLimit += bankNominalLimit;
    totalDebt += bankDebt;

    const displayName = hasMultiplePersons && normPerson !== '本人'
      ? `${normBank} (${normPerson})`
      : normBank;

    bankSummaries.push({
      bankName: normBank,
      displayName,
      cardholder: normPerson,
      sharedLimit,
      independentLimit,
      effectiveTotalLimit: bankEffectiveLimit,
      nominalTotalLimit: bankNominalLimit,
      deductedSharedLimit: bankDeducted,
      currentDebt: bankDebt,
      availableCredit: bankAvailable,
      cardCount: bankCards.length,
      sharedCardsCount: sharedCards.length,
      independentCardsCount: independentCards.length,
      cards: bankCards,
    });
  });

  // 按综合授信从高到低排列发卡行
  bankSummaries.sort((a, b) => b.effectiveTotalLimit - a.effectiveTotalLimit);

  const availableCredit = Math.max(0, effectiveTotalLimit - totalDebt);
  const utilizationRate = effectiveTotalLimit > 0 
    ? Math.round((totalDebt / effectiveTotalLimit) * 100) 
    : 0;

  return {
    effectiveTotalLimit,
    nominalTotalLimit,
    deductedSharedLimit: Math.max(0, nominalTotalLimit - effectiveTotalLimit),
    totalDebt,
    availableCredit,
    utilizationRate,
    bankSummaries,
  };
}

