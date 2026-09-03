import type { TranslateFn } from './translator'

/** Starter questions for the AI metrics chat, localized via i18n. */
export function getAiChatSuggestedQuestions(
  currentTab: string | undefined,
  t: TranslateFn
): string[] {
  const pick = (...keys: string[]) => keys.map((k) => t(k))
  const general = pick(
    'aiChat.suggested.generalAdoption',
    'aiChat.suggested.generalImprovement'
  )

  switch (currentTab) {
    case 'organization':
    case 'enterprise':
    case 'team':
      return [
        ...pick('aiChat.suggested.orgSummary', 'aiChat.suggested.orgAcceptanceTrend'),
        ...general,
      ]
    case 'languages':
      return [
        ...pick(
          'aiChat.suggested.langTopAcceptance',
          'aiChat.suggested.langUnderperforming'
        ),
        ...general,
      ]
    case 'editors':
      return [
        ...pick('aiChat.suggested.editorMostActive', 'aiChat.suggested.editorCompare'),
        ...general,
      ]
    case 'copilot chat':
      return [
        ...pick('aiChat.suggested.chatUsage', 'aiChat.suggested.chatTrend'),
        ...general,
      ]
    case 'seat analysis':
      return [
        ...pick('aiChat.suggested.seatsUnused', 'aiChat.suggested.seatsUtilization'),
        ...general,
      ]
    case 'user metrics':
    case 'users':
      return [
        ...pick('aiChat.suggested.usersTop', 'aiChat.suggested.usersZero'),
        ...general,
      ]
    case 'usage & billing':
    case 'usage-billing':
      return [
        ...pick('aiChat.suggested.billingSpend', 'aiChat.suggested.billingSku'),
        ...general,
      ]
    case 'agent activity':
    case 'pull requests':
      return [
        ...pick('aiChat.suggested.prCreated', 'aiChat.suggested.prMergeRate'),
        ...general,
      ]
    default:
      return general
  }
}
