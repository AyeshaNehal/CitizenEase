import {
  Requirement,
  EligibilityRule,
  REQUIREMENTS,
  ELIGIBILITY_RULES,
  SOURCES,
  ServiceSlug
} from '../data/catalog';

export type UserItemStatus = 'have' | 'missing' | 'not_sure';

export interface EvaluatedChecklistItem {
  item_id: string;
  requirement_id: string;
  code: string;
  title_en: string;
  title_ur: string;
  why_needed_en: string;
  why_needed_ur: string;
  kind: 'document' | 'step';
  applicability: 'mandatory' | 'conditional' | 'optional';
  verification_status: 'verified' | 'unverified';
  user_status: UserItemStatus;
  source: {
    id: string;
    title: string;
    url?: string;
    issuing_authority: string;
    last_verified_on: string;
    source_type: string;
    verification_status: string;
  };
  notes?: string;
}

export interface ReadinessResult {
  score: number | null; // null when total verified items is 0
  ready_count: number;
  total_count: number;
  missing_items: EvaluatedChecklistItem[];
  conditional_items: EvaluatedChecklistItem[];
  unverified_items: EvaluatedChecklistItem[];
  have_items: EvaluatedChecklistItem[];
  explanation_en: string;
  explanation_ur: string;
  is_guarantee: boolean;
}

export interface GeneratedChecklist {
  checklist_id: string;
  service_slug: ServiceSlug;
  rules_version: string;
  answers_snapshot: Record<string, any>;
  items: EvaluatedChecklistItem[];
  readiness: ReadinessResult;
  generated_at: string;
}

/**
 * Evaluates a single condition against the answers dictionary
 */
function evaluateSingleCondition(cond: { key: string; op: 'eq' | 'neq' | 'in'; value: any }, answers: Record<string, any>): boolean {
  const actualValue = answers[cond.key];
  if (actualValue === undefined) {
    return false;
  }

  switch (cond.op) {
    case 'eq':
      return actualValue === cond.value;
    case 'neq':
      return actualValue !== cond.value;
    case 'in':
      if (Array.isArray(cond.value)) {
        return cond.value.includes(actualValue);
      }
      return false;
    default:
      return false;
  }
}

/**
 * Pure evaluator matching Section 8 of the blueprint
 */
export function generateChecklistFromAnswers(
  serviceSlug: ServiceSlug,
  answers: Record<string, any>,
  userStatuses: Record<string, UserItemStatus> = {}
): GeneratedChecklist {
  const serviceRequirements = REQUIREMENTS.filter(
    r => r.service_slug === serviceSlug || (r.service_slugs && r.service_slugs.includes(serviceSlug))
  );
  const serviceRules = ELIGIBILITY_RULES;

  const evaluatedItems: EvaluatedChecklistItem[] = [];

  for (const req of serviceRequirements) {
    // Find all rules matching this requirement
    const matchingRules = serviceRules.filter(r => r.requirement_id === req.id && r.is_active);

    if (matchingRules.length === 0) {
      continue;
    }

    // Evaluate applicability with priority and district specificity
    let applies = false;
    let chosenRule: EligibilityRule | null = null;

    for (const rule of matchingRules) {
      // If rule specifies a district, it only applies if district matches
      if (rule.district && answers.district !== rule.district) {
        continue;
      }

      // Check condition
      let conditionMet = true;
      if (rule.condition) {
        if (rule.condition.all && rule.condition.all.length > 0) {
          conditionMet = rule.condition.all.every(c => evaluateSingleCondition(c, answers));
        }
        if (rule.condition.any && rule.condition.any.length > 0) {
          conditionMet = rule.condition.any.some(c => evaluateSingleCondition(c, answers));
        }
      }

      if (conditionMet) {
        if (!chosenRule || (rule.district && !chosenRule.district) || rule.priority > chosenRule.priority) {
          chosenRule = rule;
          applies = true;
        }
      }
    }

    if (!applies || !chosenRule) {
      continue;
    }

    const source = SOURCES[req.source_id] || {
      id: req.source_id,
      title: 'Official Karachi Administrative Notice',
      url: undefined,
      issuing_authority: 'Sindh Government / NADRA',
      last_verified_on: req.last_verified_on,
      source_type: 'official_document',
      verification_status: req.verification_status
    };

    const status: UserItemStatus = userStatuses[req.id] || 'missing';

    evaluatedItems.push({
      item_id: `item_${req.id}`,
      requirement_id: req.id,
      code: req.code,
      title_en: req.title_en,
      title_ur: req.title_ur,
      why_needed_en: req.why_needed_en,
      why_needed_ur: req.why_needed_ur,
      kind: req.kind,
      applicability: chosenRule.applicability,
      verification_status: req.verification_status,
      user_status: status,
      source: {
        id: source.id,
        title: source.title,
        url: source.url,
        issuing_authority: source.issuing_authority,
        last_verified_on: source.last_verified_on,
        source_type: source.source_type,
        verification_status: source.verification_status
      },
      notes: req.notes
    });
  }

  // Calculate readiness score strictly following Section 8 of the blueprint
  const readiness = calculateReadinessScore(evaluatedItems);

  return {
    checklist_id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    service_slug: serviceSlug,
    rules_version: 'v2026.11-karachi-core',
    answers_snapshot: { ...answers },
    items: evaluatedItems,
    readiness,
    generated_at: new Date().toISOString()
  };
}

/**
 * Readiness score calculator:
 * "Only verified + mandatory + applicable items count in the score denominator.
 * Score = ready ÷ total * 100.
 * If total is 0, return score = null and display 'No verified requirements yet. Confirm with the office'
 * Show unverified items in a separate block, not in the denominator.
 * Always show disclaimer: this is preparation, not approval."
 */
export function calculateReadinessScore(items: EvaluatedChecklistItem[]): ReadinessResult {
  const verifiedMandatoryItems = items.filter(
    item => item.verification_status === 'verified' && item.applicability === 'mandatory'
  );

  const conditionalItems = items.filter(
    item => item.applicability === 'conditional' && item.verification_status === 'verified'
  );

  const unverifiedItems = items.filter(item => item.verification_status === 'unverified');

  const total = verifiedMandatoryItems.length;
  const ready = verifiedMandatoryItems.filter(item => item.user_status === 'have').length;

  const missing = verifiedMandatoryItems.filter(item => item.user_status !== 'have');
  const have = verifiedMandatoryItems.filter(item => item.user_status === 'have');

  let score: number | null = null;
  let explanation_en = '';
  let explanation_ur = '';

  if (total === 0) {
    score = null;
    explanation_en = 'No verified requirements yet. Confirm with the office.';
    explanation_ur = 'ابھی کوئی تصدیق شدہ لازمی تقاضہ موجود نہیں ہے۔ براہِ کرم دفتر سے تصدیق کریں۔';
  } else {
    score = Math.round((ready / total) * 100);
    explanation_en = `${ready} of ${total} verified required items ready (${score}% prepared).`;
    explanation_ur = `${total} میں سے ${ready} تصدیق شدہ لازمی دستاویزات تیار ہیں (${score}٪ تیاری)۔`;
  }

  return {
    score,
    ready_count: ready,
    total_count: total,
    missing_items: missing,
    conditional_items: conditionalItems,
    unverified_items: unverifiedItems,
    have_items: have,
    explanation_en,
    explanation_ur,
    is_guarantee: false
  };
}
