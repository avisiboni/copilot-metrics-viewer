import type { MessageTree } from '../types'

const en: MessageTree = {
  common: {
    apply: 'Apply',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    na: 'N/A',
    allUsers: 'All users',
    loading: 'Loading',
    aboutKpi: 'About this KPI',
    aboutChart: 'About chart: {title}',
    emDash: '—',
    comingSoon: 'Coming soon',
  },
  language: {
    label: 'Language',
    english: 'English',
    hebrew: 'Hebrew',
  },
  header: {
    /** Fallback only; runtime title uses NUXT_PUBLIC_BRAND_APP_NAME */
    appName: 'Copilot Metrics Viewer',
    scopeEnterprise: 'Enterprise',
    scopeOrganization: 'Organization',
    teamSuffix: ' | Team : {team}',
    pageTitle: '{appName} | {scope} : {name}{team}',
    metaDescription: 'Copilot Metrics Dashboard',
    mockData: 'Mock data',
    logout: 'Logout',
    collapseSidebar: 'Collapse to icons',
    expandSidebar: 'Expand sidebar',
    signInGithub: 'Sign in with GitHub',
    seatsBanner: 'Seats · {name}',
    mockDataHint: 'Using mock data - see README if unintended',
  },
  footer: {
    docs: 'Documentation',
  },
  skeleton: {
    page: 'Loading page content',
    metrics: 'Loading metrics',
    table: 'Loading table',
    seats: 'Loading seat metrics',
  },
  tabs: {
    organization: 'Organization',
    enterprise: 'Enterprise',
    team: 'Team',
    teams: 'Teams',
    languages: 'Languages',
    editors: 'Editors',
    copilotChat: 'Copilot chat',
    usageInsights: 'Usage insights',
    users: 'Users analysis',
    inviteMembers: 'Invite members',
    usageBilling: 'Usage & billing',
    seatAnalysis: 'Seat analysis',
    apiResponse: 'API response',
  },
  alerts: {
    noDataTitle: 'No data',
    noDataText: 'No data available to display',
    loadingTab: 'Loading {tab}',
  },
  errors: {
    noTeamData:
      'No data returned from API - check if the team exists and has any activity and at least 5 active members',
    unauthorized:
      '401 Unauthorized access returned by GitHub API - check if your token in the .env (for local runs). Check PAT token and GitHub permissions.',
    notFound:
      '404 Not Found - is the {scope} org:"{org}" ent:"{ent}" team:"{team}" correct? {message}',
    unprocessable:
      '422 Unprocessable Entity - Is the Copilot Metrics API enabled for the Org/Ent? When changing filters, try adjusting the "from" date. {message}',
    serverError: '500 Internal Server Error - most likely a bug in the app. Error: {message}',
    generic: '{status} Error: {message}',
  },
  dateRange: {
    from: 'From',
    to: 'To',
    excludeHolidays: 'Exclude holidays from metrics',
    last28Days: 'Last 28 days',
    selectRange: 'Select date range',
    exclHolidays: ', excl. holidays',
    reportSuffix: '· Report {range}',
    billingSuffix: '· Billing {range}',
    usageReportSuffix: '· Usage {range}',
    forSingleDay: 'For {date}{holidayNote}',
    overLast28: 'Over the last 28 days{holidayNote}',
    fromTo: 'From {from} to {to} ({days} days){holidayNote}',
    excludingHolidays: ' (excluding holidays/weekends)',
    summarySingle: '{date}{holidayNote}',
    summaryLast28: 'Last 28 days{holidayNote}',
    summaryRange: '{from} – {to} ({days}d{holidayNote})',
  },
  metrics: {
    acceptanceRateByCount: 'Acceptance Rate (by count)',
    totalSuggestions: 'Total count of Suggestions (Prompts)',
    acceptanceRateByLines: 'Acceptance Rate (by lines)',
    totalLinesSuggested: 'Total Lines of code Suggested',
    kpiTooltipAcceptanceCount:
      'Ratio of accepted suggestions to total suggestions (by prompt count). Indicates how often Copilot suggestions are accepted; interpret alongside how your team uses Copilot (research, review, inject, etc.).',
    kpiTooltipTotalSuggestions:
      'Total number of code suggestions (prompts) Copilot offered in the selected period. Reflects overall Copilot engagement and activity volume.',
    kpiTooltipAcceptanceLines:
      'Ratio of accepted lines to total lines suggested. Measures acceptance by volume of code rather than number of prompts.',
    kpiTooltipTotalLines:
      'Total lines of code Copilot suggested in the selected period. Shows the scale of generated or assisted code volume.',
    chartAcceptanceRateByCount: 'Acceptance rate by count (%)',
    chartSuggestionsAcceptances: 'Total Suggestions Count | Total Acceptances Count',
    chartAcceptanceRateByLines: 'Acceptance rate by lines (%)',
    chartLinesSuggestedAccepted: 'Total Lines Suggested | Total Lines Accepted',
    chartTotalActiveUsers: 'Total Active Users',
    chartDauWauMau: 'DAU / WAU / MAU',
    legendTotalSuggestions: 'Total Suggestions',
    legendTotalAcceptance: 'Total Acceptance',
    legendTotalLinesSuggested: 'Total Lines Suggested',
    legendTotalLinesAccepted: 'Total Lines Accepted',
    legendAcceptanceRateLines: 'Acceptance Rate by Lines',
    legendAcceptanceRateCount: 'Acceptance Rate by Count',
    legendTotalActiveUsers: 'Total Active Users',
    legendDau: 'DAU',
    legendWau: 'WAU',
    legendMau: 'MAU',
  },
  chat: {
    cumulativeTurns: 'Cumulative Number of Turns',
    cumulativeAcceptances: 'Cumulative Number of Acceptances',
    kpiTooltipTurns:
      'Total chat turns in the selected period. A turn is a user or assistant message in Copilot chat.',
    kpiTooltipAcceptances:
      'Total chat acceptances in the selected period. Shows how often chat suggestions are accepted.',
    chartAcceptancesTurns: 'Total Acceptances | Total Turns Count',
    chartActiveUsers: 'Total Active Copilot Chat Users',
    chartByMode: 'Chat requests by mode',
    legendAcceptances: 'Total Acceptances',
    legendTurns: 'Total Turns',
    legendActiveUsers: 'Total Active Copilot Chat Users',
    modeAsk: 'ask',
    modeEdit: 'edit',
    modePlan: 'plan',
    modeAgent: 'agent',
    modeCustom: 'custom',
    modeUnknown: 'unknown',
  },
  breakdown: {
    entityLanguage: 'language',
    entityEditor: 'editor',
    entityLanguages: 'Languages',
    entityEditors: 'Editors',
    kpiCount: 'Number of {entity}',
    kpiTooltip:
      'Count of distinct {entity} with Copilot activity in the selected period.',
    chartTopAccepted: 'Top 5 {entities} by accepted suggestions (prompts)',
    chartAcceptanceByCount: 'Acceptance Rate (by count) for Top 5 {entities}',
    chartAcceptanceByLines: 'Acceptance Rate (by code lines) for Top 5 {entities}',
    tableTitle: '{entities} breakdown',
    headerName: '{entity} Name',
    headerAcceptedPrompts: 'Accepted Prompts',
    headerSuggestedPrompts: 'Suggested Prompts',
    headerAcceptedLines: 'Accepted Lines of Code',
    headerSuggestedLines: 'Suggested Lines of Code',
    headerAcceptanceCount: 'Acceptance Rate by Count (%)',
    headerAcceptanceLines: 'Acceptance Rate by Lines (%)',
  },
  teams: {
    loading: 'Loading teams',
    title: 'Teams Comparison',
    subtitle: 'Select teams to compare metrics across your {scope}',
    searchLabel: 'Search and select teams to compare',
    searchHint:
      'Type to filter and select multiple teams from your {scope}. Metrics are aggregated per team for the selected date range.',
    clearAll: 'Clear All',
    selectedTeams: 'Selected Teams',
    viewDetails: 'View Details',
    teamsSelected: 'Teams Selected',
    totalActiveUsers: 'Total Active Users',
    kpiTooltipTeams:
      'Number of teams currently selected for comparison.',
    kpiTooltipUsers:
      'Combined count of active Copilot users across all selected teams.',
    noLanguageData: 'No language data available for selected teams',
    noEditorData: 'No editor data available for selected teams',
    noTeamsTitle: 'No Teams Selected',
    noTeamsText:
      'Select one or more teams from the dropdown above to compare Copilot metrics.',
    scopeEnterprise: 'enterprise',
    scopeOrganization: 'organization',
    chartAcceptanceCount: 'Acceptance Rate by Count (%)',
    chartSuggestions: 'Total Suggestions Count | Total Acceptances Count',
    chartAcceptanceLines: 'Acceptance Rate by Lines (%)',
    chartLines: 'Total Lines Suggested | Total Lines Accepted',
    chartActiveUsers: 'Total Active Users',
    chartIdeCompletions: 'IDE Code Completions Usage',
    chartIdeChat: 'IDE Chat Usage',
    chartDotcomChat: 'GitHub.com Chat Usage',
    chartDotcomPr: 'GitHub.com PR Usage',
    chartLanguage: 'Language Usage by Team',
    chartEditor: 'Editor Usage by Team',
    legendAcceptanceRate: '{team} - Acceptance Rate (%)',
    legendSuggestions: '{team} - Suggestions',
    legendAcceptances: '{team} - Acceptances',
    legendLinesSuggested: '{team} - Lines Suggested',
    legendLinesAccepted: '{team} - Lines Accepted',
    legendActiveUsers: '{team} - Active Users',
    legendIdeCompletions: 'IDE Completions Users',
    legendIdeChat: 'IDE Chat Users',
    legendCli: 'CLI Active Users',
    legendCodeReview: 'Code Review Active Users',
  },
  seats: {
    totalAssigned: 'Total Assigned',
    assignedNeverUsed: 'Assigned But Never Used',
    noActivity7: 'No Activity in the Last 7 days',
    noActivity30: 'No Activity in the Last 30 days',
    subtitleAssigned: 'Currently assigned seats',
    subtitleAssignedTeam: 'Seats assigned to team "{team}"',
    subtitleNeverUsed: 'No show seats',
    subtitleNoUse7: 'No use in the last 7 days',
    subtitleNoUse30: 'No use in the last 30 days',
    filterHint: 'Showing in table · click again to clear',
    billingTitle: 'Copilot subscription policies',
    plan: 'Plan:',
    ideChat: 'IDE chat:',
    platformChat: 'Platform chat:',
    cli: 'CLI:',
    publicSuggestions: 'Public code suggestions:',
    seatManagement: 'Seat management:',
    totalSeats: 'Total seats:',
    activeCycle: 'Active this cycle:',
    tableAll: 'All assigned seats',
    tableNeverUsed: 'Assigned but never used',
    tableNoActivity7: 'No activity in the last 7 days',
    tableNoActivity30: 'No activity in the last 30 days',
    colSerial: 'S.No',
    colLogin: 'Login',
    colGithubId: 'GitHub ID',
    colTeam: 'Assigning team',
    colAssigned: 'Assigned time',
    colLastActivity: 'Last Activity At',
    colLastEditor: 'Last Activity Editor',
    tooltipTotal:
      'Total Copilot seats assigned {scope}. Click to show all assigned seats in the table.',
    tooltipNeverUsed:
      'Seats assigned but never used. Click to filter the table to these seats.',
    tooltipInactive:
      'Never used seats, or last activity more than {days} days ago. Click to filter the table.',
    scopeInOrg: 'within the organization',
    scopeInEnt: 'within the enterprise',
    scopeToTeam: 'to team "{team}"',
    scopeCurrentOrgEnt: 'within the current organization/enterprise',
    monthlyTitle: 'Seats per month (invoice breakdown)',
    monthlySubtitleHistorical:
      'Per month: new seats (change vs prior month) + existing seats (already assigned) = total assigned at month-end. From daily historical snapshots.',
    monthlySubtitleAssigned:
      'Per month: new assignments + existing (cumulative from prior months, still assigned) = total for invoice reconciliation. Based on “Assigned time”; removed seats are not subtracted.',
    monthlyColNew: 'New seats',
    monthlyColExisting: 'Existing seats',
    monthlyHistoricalEmpty:
      'Historical seat snapshots are not available yet. Enable historical mode and run the daily sync job to store daily seat counts, then return here.',
    monthlyColMonth: 'Month',
    monthlyColTotal: 'Total seats',
    monthlyColSnapshot: 'Snapshot date',
    monthlyTotalRow: 'Period total',
    monthlyEnableHistorical:
      'To see total seats at the end of each month (not just new assignments), set NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true and run daily sync with PostgreSQL.',
    noMonthlyData: 'No monthly seat data to display for the selected scope.',
  },
  api: {
    checkQuality: 'Check Metric data quality',
    copyClipboard: 'Copy Metrics to Clipboard',
    downloadCsvSummary: 'Download CSV (Summary)',
    downloadCsvFull: 'Download CSV (Full)',
    downloadNdjson: 'Download NDJSON (Full)',
    showSeatCount: 'Show Assigned Seats count',
    copied: 'Copied to clipboard!',
    copyFailed: 'Could not copy text!',
    allValid: 'All metrics are valid!',
    inconsistent:
      'Some metrics might be inconsistent, please double check the API response.',
    seatCount: 'Seat count: {count}',
    csvSummaryOk: 'Summary CSV file downloaded successfully!',
    csvFullOk: 'Full CSV file downloaded successfully!',
    noExportData: 'No metrics data available to export.',
    csvError: 'Error generating CSV file.',
    ndjsonOk: 'Full NDJSON file downloaded successfully!',
    ndjsonError: 'Error generating NDJSON file.',
  },
  billing: {
    loading: 'Loading usage and billing',
    errorTitle: 'Error loading usage & billing',
    errorLoad: 'Failed to load usage insights.',
    title: 'Usage & billing',
    subtitle:
      'Organization usage totals and GitHub Billing costs for the selected period. Per-user activity is on Users analysis.',
    emailUnavailableTitle: 'Emails not available from GitHub API',
    emailUnavailableBody:
      'User emails are not included in Copilot metrics API responses. Use login or display name to identify users. To export emails, an org admin needs the admin:org scope and SAML may restrict visibility.',
    filterUser: 'Filter by user',
    filterHint: 'Search by login, display name, or email when available',
    showingUser: 'Showing: {user}',
    noUserData: 'No usage data for this user in the report window',
    billingNotLoadedTitle: 'Billing API data not loaded',
    billingNotLoadedSummary: 'Billing usage endpoints returned no data.',
    billingNotLoadedDetail:
      'Usage metrics below still reflect the users-28-day report. Enable enhanced billing and grant manage_billing:copilot on your token, then sign out and sign in again.',
    billingRangeNoteTitle: 'Costs cover your full date range',
    billingRangeNoteBody:
      'Net spend and SKU charts use GitHub Billing for every month from {since} to {until}. User activity KPIs are aggregated across the same period (this can take longer for ranges over 28 days).',
    usagePartialWindowTitle: 'Usage data still loading for full range',
    usagePartialWindowBody:
      'GitHub returned usage for {usageRange} so far. Billing totals already include {billingRange}. Wait for the reload to finish or enable historical mode with daily sync for faster long ranges.',
    billingSpanNoteTitle: 'Costs cover your full date range',
    billingSpanNoteBody:
      'Net spend and SKU charts use GitHub Billing for {billingRange}. Usage KPIs may reflect a shorter Copilot metrics window ({usageRange}) while long ranges load.',
    kpiSeatCost: 'Seat cost (period)',
    kpiSeatCostHint: 'Assigned seats × {price}/seat (same as Seat analysis)',
    kpiGithubSeatEmptyHint: 'No seat assignment data for this range yet',
    kpiTooltipSeatCost:
      'Estimated seat license cost for the selected period: monthly assigned seats × NUXT_PUBLIC_COPILOT_SEAT_UNIT_PRICE. Matches the Seat analysis invoice table. This is not the GitHub Billing ghec_licenses SKU (often unavailable on org billing).',
    kpiUsageCost: 'Copilot cost (period)',
    kpiUsageCostHint: 'Premium requests, AI credits, and other usage SKUs',
    kpiCopilotEmptyHint: 'No Copilot SKUs in billing for this range',
    kpiTooltipUsageCost:
      'Total net spend from all GitHub Copilot Billing SKUs for the selected period (Copilot Enterprise, Premium Request, AI credits, and related Copilot lines).',
    kpiSkuHintMultiple: '{sku} + {count} more',
    kpiNetSpend: 'Total net spend (period)',
    kpiNetSpendViewDetail: 'View breakdown',
    kpiNetSpendOpenDetail: 'Open net spend breakdown by SKU',
    skuDetailTitle: 'Net spend by SKU',
    skuDetailLineTypes: 'SKU line types',
    skuDetailTableTitle: 'Pricing breakdown',
    skuDetailTableSubtitle: 'Gross and net amounts from GitHub Billing Usage for the selected period',
    skuDetailTotal: 'Total',
    colSku: 'SKU',
    colQuantity: 'Quantity',
    colGrossAmount: 'Gross',
    colNetAmount: 'Net',
    colShareOfSpend: '% of net spend',
    kpiPremiumRequests: 'Premium requests (PRU)',
    kpiModelsBilled: 'Models billed (PRU)',
    kpiHintSku: '{count} SKU line types',
    kpiHintUsers: '{count} users with PRU',
    kpiHintDistinct: 'Distinct models in premium report',
    kpiActiveUsers: 'Active users',
    kpiInteractions: 'Interactions',
    kpiGenerations: 'Generations',
    kpiAcceptances: 'Acceptances',
    kpiLocAdded: 'LoC added',
    kpiLocChanged: 'Lines changed with AI',
    kpiModelsUsed: 'Models used',
    kpiAgentUsers: 'Agent users',
    kpiChatUsers: 'Chat users',
    chartTopModels: 'Top models by interactions',
    chartFeatureAdoption: 'Feature adoption',
    chartCostBySku: 'Cost by SKU',
    chartPremiumByModel: 'Premium requests by model',
    chartTeamUsage: 'Team usage (latest user-teams day)',
    seatCostTitle: 'Copilot seat cost by month',
    seatCostSubtitle:
      'Each month: (existing + new) assigned seats × {price}/seat. Existing seats are billed every month until removed.',
    seatCostColExisting: 'Existing cost',
    seatCostColNew: 'New cost',
    seatCostColMonth: 'Month cost',
    seatCostUnitPriceHint:
      'Set NUXT_PUBLIC_COPILOT_SEAT_UNIT_PRICE (USD per seat per month) to show cost columns.',
    tableLeaderboard: 'User leaderboard',
    colUser: 'User',
    colInteractions: 'Interactions',
    colGenerations: 'Generations',
    colAcceptances: 'Acceptances',
    colLocAdded: 'LoC added',
    colModels: 'Models',
    colTopModel: 'Top model',
    colAgent: 'Agent',
    colChat: 'Chat',
    colCodingAgent: 'Coding agent',
    colPremiumCredits: 'Premium credits',
    colAiCredits: 'AI credits',
    colPruCost: 'PRU cost',
    colUsage: 'Usage',
    colUserHint:
      'GitHub login for the user. Name and email appear when the org member directory (GraphQL) returns them.',
    colUsageHint:
      'Opens a per-user breakdown: models, features, and activity for the selected date range.',
    colInteractionsHint:
      'User-initiated Copilot interactions in the period (e.g. chat turns, prompts) from the GitHub users metrics report (`user_initiated_interaction_count`).',
    colGenerationsHint:
      'Times Copilot produced code suggestions or edits for this user (`code_generation_activity_count`) — completions, agent edits, chat generations, etc.',
    colAcceptancesHint:
      'Times this user accepted a Copilot suggestion (`code_acceptance_activity_count`) — Tab on inline completions, Accept in chat, etc.',
    colLocAddedHint:
      'Lines of code added through Copilot features for this user in the period (`loc_added_sum`).',
    colModelsHint:
      'Count of distinct Copilot models this user used in the period.',
    colTopModelHint:
      'The model with the highest interaction count for this user in the period.',
    colAgentHint:
      'Whether the user used Copilot Agent-style features (e.g. agent mode, agent edits) at least once in the period.',
    colChatHint:
      'Whether the user used Copilot Chat (panel or inline) at least once in the period.',
    colCodingAgentHint:
      'Whether the user triggered Copilot coding agent (issue assignment or @copilot in a PR comment) at least once in the period.',
    colPruCostHint:
      'Estimated net premium request (PRU) cost for this user in the billing period, from the GitHub Billing Usage API when available.',
    colAiCreditsHint:
      'AI credits consumed by this user in the period — from usage metrics `ai_credits_used` when available, otherwise from the GitHub Billing API.',
    aiCreditsUsed: '{count} credits',
    aiCreditsFromMetrics: 'from usage metrics',
    aiCreditsFromMetricsHint:
      'Value comes from the Copilot usage metrics API (`ai_credits_used`). Billing API may refine totals when loaded.',
    aiCreditsLoading: 'Loading…',
    aiCreditsExceedsQuota: 'Over quota',
    aiCreditsExceedsQuotaHint: 'This user exceeded their AI credits budget or quota for the period.',
    aiCreditsPerUserUnavailable: '(per-user AI credits not in org API)',
    aiCreditsPerUserUnavailableHint:
      'GitHub org billing API does not include per-user AI credit rows for enterprise-owned orgs. Set NUXT_PUBLIC_GITHUB_ENT and admin:enterprise on the PAT.',
    dataSources: 'Data sources:',
    dataSourcesBilling:
      'users-28-day, user-teams-1-day, billing usage & premium requests APIs.',
    dataSourcesNoBilling:
      'Billing REST unavailable — matches manual CSV exports when the org enables enhanced billing.',
    legendInteractions: 'Interactions',
    legendNetUsd: 'Net $',
    legendPru: 'PRU quantity',
    billingApiRequired: 'Billing usage API required',
    percentPruLeft: '{percent}% · {left} PRU left',
    pruLeft: 'PRU left',
    usedQuota: '{used} / {quota} used',
    estimated: '(estimated)',
    perUserUnavailable: '(per-user PRU not in org API)',
    perUserUnavailableHint:
      'GitHub org billing API does not include per-user premium rows for enterprise-owned orgs. Set NUXT_PUBLIC_GITHUB_ENT and admin:enterprise on the PAT.',
    premiumCreditsCacheHint:
      'Premium usage is loaded per user from the billing API (10 users at a time). Results are cached on the server for 10 minutes.',
    premiumCreditsLoading: 'Loading…',
    premiumCreditsDisabledIp:
      'Disabled for now — Billing API is blocked by IP allowlist restrictions.',
    premiumCreditsDisabledIpShort: 'Disabled (IP allowlist)',
    premiumCreditsDisabledIpHint:
      'Premium credits will return when network access to GitHub Billing Usage is allowed from this deployment.',
    leaderboardColumnHints:
      'AI adoption phase: each user’s Copilot maturity label from the 28-day usage report (hover the chip, e.g. Code first). Premium credits: monthly PRU quota when billing API access is enabled.',
    kpiTooltipActiveUsers:
      'Users with Copilot usage in the users-28-day report (not org seat count). GitHub “People” on Insights is org membership; monthly active users on the org report can differ day to day.',
    kpiTooltipInteractions:
      'Total model interactions (prompts, chat turns, etc.) aggregated across all users.',
    kpiTooltipGenerations:
      'Total generations produced by Copilot models in the report window.',
    kpiTooltipAcceptances:
      'Total acceptances of Copilot suggestions or outputs across all users.',
    kpiTooltipLocAdded:
      'Total lines of code added via Copilot agent or completion features.',
    kpiTooltipLocChanged:
      'Lines added plus lines deleted (all Copilot features), matching GitHub Insights → Code generation. Added: {added}, deleted: {deleted}.',
    kpiTooltipModelsUsed:
      'Distinct Copilot models used by at least one user in the period.',
    kpiTooltipAgentUsers:
      'Users who used Copilot agent-style features (e.g. agent mode) in the period.',
    kpiTooltipChatUsers:
      'Users who used Copilot chat features in the period.',
    kpiTooltipNetSpend:
      'Total net Copilot spend for the selected period from the GitHub Billing Usage API (all SKU lines combined).',
    kpiTooltipPremiumRequests:
      'Total premium request units (PRU) consumed in the period — billable model usage beyond included quota.',
    kpiTooltipModelsBilled:
      'Number of distinct models that incurred premium (PRU) charges in the billing report.',
    dataSourcesMetrics:
      'users-28-day/latest (models, features, activity); user-teams-1-day (team rollups);',
    dataSourcesBillingEndpoints:
      'billing/usage, billing/usage/summary, billing/premium_request/usage, billing/ai_credit/usage.',
    usersAnalysisHint: ' For per-user activity, open the Users analysis tab.',
    leaderboardReportLabel: '28-day usage report',
    premiumQuotaPerSeat: 'Premium requests (billing) · up to {quota} PRU/seat per month',
  },
  users: {
    loading: 'Loading user metrics',
    errorTitle: 'Error Loading User Metrics',
    errorLoad: 'Failed to load user metrics.',
    errorBilling: 'Failed to check billing status.',
    title: 'Users analysis',
    billingStatus: 'Billing status',
    billingStatusHint:
      'Checks the GitHub Billing Usage API for premium request data. Requires manage_billing:copilot.',
    checkNow: 'Check now',
    premiumNeedsBillingTitle: 'Premium credits need billing data',
    premiumNeedsBillingBody:
      'Billing usage data is not available. Enable enhanced billing and manage_billing:copilot on your token.',
    tokenScopes: 'Current token scopes: {scopes}',
    addScope: 'Add manage_billing:copilot to your GitHub OAuth app and sign out and sign in again.',
    premiumCreditsNote:
      'Premium credits use GitHub Billing Usage for {dates} ({count} users with PRU usage in period).',
    filterByDay: 'Filter by day (users-1-day report)',
    filterDayHint: 'Leave empty for rolling 28-day latest report',
    filterUser: 'Filter by user',
    applyFilters: 'Apply filters',
    searchUsers: 'Search users',
    tableTitle: 'Users',
    subtitleBillingUnavailable: 'Premium credits: billing API unavailable for this period.',
    subtitleBillingRange: 'Billing: {range}',
    subtitleBillingRangeDetailed:
      'Billing: {since} → {until} ({count} users with PRU data)',
    billingUnavailablePeriod:
      'Billing usage data is not available for this period ({since} → {until}).',
    billingHttpStatus: 'GitHub returned HTTP {status}.',
    billingReasonFallback:
      'Enable enhanced billing and manage_billing:copilot on the token.',
    addScopePat:
      'Add manage_billing:copilot to your GitHub App or PAT, then sign out and sign in again.',
    billingStatusHintColumn:
      'Checks the GitHub Billing Usage API for the “Premium credits” column.',
    reportDay: 'Day: {day}',
    usersWithPruInWindow: '{count} users with PRU usage in that window.',
    usersWithAiCreditsInWindow: '{count} users with AI credit usage in that window.',
    aiCreditsLoadingProgress:
      'Loading per-user AI credits from billing API ({loaded}/{total})…',
    perUserPruUnavailable:
      'Billing is connected, but per-user PRU is not available yet. Enterprise-owned orgs cannot use org billing ?user=; set NUXT_PUBLIC_GITHUB_ENT and a classic PAT with admin:enterprise.',
    premiumLoadingProgress:
      'Loading premium credits from billing API… {loaded} / {total} users (cached 10 min).',
    premiumCreditsComingSoonTitle: 'Premium credits — coming soon',
    premiumCreditsComingSoonBody:
      'Per-user premium request usage (PRU) from the GitHub Billing API is temporarily disabled. Usage metrics in this table still load from Copilot metrics reports. Set NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=true when enterprise billing and network access are ready.',
    premiumCreditsComingSoonHint:
      'Requires enterprise billing API access for enterprise-owned organizations. See documentation → Premium credits.',
    topUsersTitle: 'Top 5 effective Copilot users',
    topUsersTooltip:
      'Users ranked by effective Copilot usage: pattern and acceptance rate, weighted by real activity (interactions, generations, acceptances) in the period. Light or wasteful users are excluded. Click a card for full usage details.',
    topUserRank: '#{rank}',
    topUserQualityLabel: 'Effectiveness score',
    topUserEngagementLabel: 'Engagement score',
    topUserActivityHint:
      '{interactions} interactions · {generations} generations · {acceptances} acceptances',
    topUserCardTooltip:
      'Rank {rank} by Copilot effectiveness in this period. Open full usage breakdown.',
    topUserOpenDetail: 'Open usage details for {user}, rank {rank}',
  },
  usageInsights: {
    loading: 'Loading usage insights',
    errorTitle: 'Error Loading Statistics',
    errorLoad: 'Failed to fetch GitHub statistics',
    title: 'Copilot usage insights',
    ideCompletions: 'IDE Code Completions',
    ideChat: 'IDE Chat',
    totalUsersActivity: 'Total Users with Activity',
    modelsUsed: '{count} Models Used',
    copilotCli: 'Copilot CLI',
    cliActiveUsers: 'CLI active users (sum over period)',
    codeReview: 'Code review',
    activeReviewUsers: 'Active review users (sum)',
    passive: 'Passive: {count}',
    agentLocAdded: 'Agent LoC added: {count}',
    chartFeatureUsage: 'Copilot Feature Usage Over Time',
    chartDauWauMau: 'DAU / WAU / MAU',
    chartChatByMode: 'Chat requests by mode',
    chartCli: 'CLI usage',
    chartModels: 'Models Used by Users',
    yAxisUsers: 'Users with Activity',
    panelCompletions: 'IDE Code Completions Models ({count})',
    panelChat: 'IDE Chat Models ({count})',
    colModel: 'Model Name',
    colEditor: 'Editor',
    colType: 'Type',
    colTotalUsers: 'Total Users with Activity',
    colTotalChats: 'Total Chats',
    colInsertions: 'Insertions',
    colCopyEvents: 'Copy Events',
    kpiTooltipCompletions:
      'Users with IDE code completion activity in the selected period.',
    kpiTooltipChat: 'Users with IDE chat activity in the selected period.',
    kpiTooltipCli: 'Sum of daily active Copilot CLI users across the period.',
    kpiTooltipReview:
      'Users with active code review engagement; passive and agent line metrics shown below.',
  },
  userDetail: {
    premiumCredits: 'Premium credits',
    aiCredits: 'AI credits',
    aiCreditsPeriod: 'AI credits (billing period)',
    pruCost: 'PRU cost (period)',
    teamsSnapshot: 'Teams (latest user-teams snapshot)',
    agent: 'Agent',
    chat: 'Chat',
    cli: 'CLI',
    codingAgent: 'Coding agent',
    serverSideTelemetryHint:
      'This user appears active from server-side telemetry; feature and model breakdowns may be empty until richer telemetry is available.',
    noBreakdown: 'No model or feature breakdown for this user in the report window.',
    kpiInteractions: 'Interactions',
    kpiGenerations: 'Generations',
    kpiAcceptances: 'Acceptances',
    kpiLocAdded: 'LoC added',
    chartTopModels: 'Top models (interactions)',
    chartActivityMix: 'Activity mix',
    chartFeatures: 'Features (interactions)',
    chartModelFeature: 'Model × feature (interactions)',
    legendInteractions: 'Interactions',
    legendCount: 'Count',
    activityInteractions: 'Interactions',
    activityGenerations: 'Generations',
    activityAcceptances: 'Acceptances',
  },
  charts: {
    acceptanceRateByCount:
      'Daily percentage of Copilot suggestions accepted vs total suggestions (by prompt count). Use it to see whether suggestions are getting more useful over time.',
    totalSuggestionsAndAcceptances:
      'Daily volume of suggestions Copilot offered and how many were accepted. Helps separate activity level from acceptance quality.',
    acceptanceRateByLines:
      'Daily percentage of suggested lines of code that were accepted. Complements acceptance-by-count when edits are large or small.',
    totalLinesSuggestedAccepted:
      'Daily lines of code suggested by Copilot vs lines accepted into the codebase. Shows volume of generated code actually kept.',
    totalActiveUsers:
      'Number of users with Copilot activity each day in the selected range. Indicates adoption and breadth of usage.',
    dauWauMau:
      'Daily (DAU), weekly (WAU), and monthly (MAU) active users. Compare short-term spikes with longer-term engagement and retention.',
    chatAcceptancesAndTurns:
      'Daily Copilot chat acceptances alongside total chat turns (user + assistant messages). Shows chat intensity vs how often outputs are accepted.',
    chatActiveUsers:
      'Users who used Copilot chat on each day. Useful for seeing chat adoption separate from code completions.',
    chatRequestsByMode:
      'Chat usage split by mode (ask, agent, edit, plan, etc.) over time. Shows which chat workflows the org prefers.',
    usageInsightsOverview:
      'Org-wide Copilot feature and model usage derived from organization/enterprise daily metrics for your date range.',
    copilotFeatureUsageOverTime:
      'How different Copilot features (completions, chat, CLI, code review, etc.) trend day by day. Spot shifts in how teams use Copilot.',
    usageInsightsDauWauMau:
      'Daily, weekly, and monthly active users from org metrics. Same DAU/WAU/MAU idea as the Organization tab, based on aggregated usage reports.',
    usageInsightsChatByMode:
      'IDE chat requests grouped by chat panel mode over time (ask, agent, edit, plan, custom).',
    usageInsightsCli:
      'Daily active Copilot CLI users summed across the period. Shows command-line adoption over time.',
    modelsUsedByUsers:
      'Which AI models were used for IDE completions and chat, and how many engaged users per model.',
    teamsAcceptanceRateByCount:
      'Compare selected teams: acceptance rate by suggestion count. Higher means more prompts accepted per team.',
    teamsTotalSuggestions:
      'Compare teams on daily suggestions vs acceptances. See which teams generate and accept the most Copilot output.',
    teamsAcceptanceRateByLines:
      'Team comparison of acceptance rate by lines of code. Useful when teams work in different languages or change sizes.',
    teamsLinesSuggestedAccepted:
      'Lines suggested vs accepted per team. Highlights teams that incorporate more suggested code.',
    teamsActiveUsers:
      'Active Copilot users per team over time. Shows relative adoption across teams you selected.',
    teamsIdeCompletions:
      'IDE code completion usage by team. Compare completion engagement across teams.',
    teamsIdeChat:
      'IDE chat usage by team. See which teams rely more on conversational Copilot.',
    teamsDotcomChat:
      'GitHub.com (dotcom) Copilot chat usage by team when available in metrics.',
    teamsDotcomPr:
      'GitHub.com pull request Copilot usage by team (e.g. PR summaries) when available.',
    teamsLanguageUsage:
      'Breakdown of Copilot activity by programming language for each selected team.',
    teamsEditorUsage:
      'Breakdown of Copilot activity by editor (VS Code, JetBrains, etc.) for each selected team.',
    billingTopModels:
      'Models with the most user-initiated interactions in the users-28-day report (all users combined).',
    billingFeatureAdoption:
      'Share of interactions by Copilot feature (completions, chat modes, agent, etc.) across the org.',
    billingCostBySku:
      'Net spend by billing SKU from GitHub Billing Usage API for the selected period. Requires manage_billing:copilot.',
    billingPremiumByModel:
      'Premium request units (PRU) consumed per model when billing data is available.',
    billingTeamUsage:
      'Interaction totals by team from the latest user-teams snapshot. Shows which teams drive the most Copilot usage.',
    userTopModels:
      "This user's interactions broken down by AI model. Shows which models they use most.",
    userActivityMix:
      "This user's interactions, generations, and acceptances compared side by side for the report window.",
    userFeatures:
      "Share of this user's interactions by Copilot feature (chat mode, completions, agent, etc.).",
    userModelFeature:
      'Top model + feature combinations for this user. Helps see if they use chat vs completions on specific models.',
    breakdownTopAcceptedPrompts:
      'The five breakdown dimensions (e.g. languages) with the most accepted Copilot suggestions in the period.',
    breakdownAcceptanceRateByCount:
      'Acceptance rate by suggestion count for the top five breakdown dimensions. Shows which areas accept the most prompts.',
    breakdownAcceptanceRateByLines:
      'Acceptance rate by lines of code for the top five breakdown dimensions. Useful when change size varies by language or editor.',
    adoptionPhases:
      '28-day Copilot adoption phases (≥2 active days): No cohort, Code first, Agent first, Multi-agent. Each card shows org cohort count and users-report count when both are available.',
    adoptionPhasesIdeOnly:
      'Adoption phases (IDE only): No cohort and Code first — in-editor Copilot. Non-IDE agent phases are hidden.',
  },
  adoption: {
    panelTitle: 'AI adoption cohorts',
    panelSubtitle:
      'How users are classified over a rolling 28-day window (GitHub Copilot usage metrics API). Phases reflect which Copilot surfaces they used on at least two days.',
    panelTooltip:
      'GitHub assigns each user an adoption phase from the last 28 days (at least 2 active days). Phases: No cohort → Code first (mainly IDE) → Agent first → Multi-agent.',
    panelTooltipIdeOnly:
      'GitHub classifies users by in-editor Copilot use (completions and/or IDE agent mode). Agent surfaces outside the IDE (CLI, cloud agent, etc.) are hidden — not used in your org.',
    panelTooltipDual:
      'Each card shows two numbers: Cohort engaged — org total from the 28-day rollup; In users report — users with that label in the Users table (same as the phase column).',
    panelTooltipDualIdeOnly:
      'IDE-only mode: only No cohort and Code first are shown. Each card compares cohort engaged vs labeled in the users report.',
    dualMetricsNote:
      'Two counts: org cohort engaged (GitHub 28-day rollup, ≥2 active days) vs users labeled in the users report (same labels as the table column).',
    kpiSectionCohort: 'Cohort engaged (org 28-day rollup)',
    kpiSectionReport: 'Labeled in users report',
    engagedUsers: 'Engaged users',
    engagedUsersCohort: 'Cohort engaged',
    labeledInReport: 'In users report',
    chartUsersByPhase: 'Users by adoption phase',
    chartCohortEngaged: 'Cohort engaged',
    chartLabeledInReport: 'Labeled in report',
    colLabeledUsers: 'In users report',
    tableTitle: 'Cohort averages',
    tableSubtitle: 'Per-user averages within each phase (not sums).',
    colPhase: 'Phase',
    colEngagedUsers: 'Engaged users',
    colAvgInteractions: 'Avg interactions',
    colAvgGenerations: 'Avg generations',
    colAvgAcceptances: 'Avg acceptances',
    colAvgLocAdded: 'Avg LOC added',
    colAvgLocDeleted: 'Avg LOC deleted',
    colAvgPrCreated: 'Avg PRs created',
    colAvgPrMerged: 'Avg PRs merged',
    colAvgPrReviewed: 'Avg PRs reviewed',
    colMedianMinutesToMerge: 'Avg median min to merge',
    colAdoptionPhase: 'AI adoption phase',
    colAdoptionPhaseHint:
      'Per-user cohort from GitHub Copilot usage metrics (28-day window, ≥2 active days). Code first = mainly code completion and/or IDE agent mode; Agent first / Multi-agent = GitHub agent surfaces. Hover the chip in each row for the full definition.',
    colAdoptionPhaseHintIdeOnly:
      'Adoption phase from GitHub: mainly in-editor Copilot (completions / IDE agent). Non-IDE agent phases are hidden when your org does not use those surfaces.',
    leaderboardColumnNoteIdeOnly:
      'AI adoption phase — IDE stages only (No cohort, Code first). If GitHub labels an unused agent phase, the cell shows “Not applicable”.',
    leaderboardColumnNote:
      'The AI adoption phase column shows how each user is classified in the latest users report. Hover a chip (e.g. Code first) for what that phase means.',
    phaseUnknown: 'Not classified',
    phase0Title: 'No cohort',
    phase0Hint: 'Did not meet engagement criteria for a cohort in the 28-day window.',
    phase1Title: 'Code first',
    phase1Hint:
      'Phase 1 (Code first): the user met engagement on code completion and/or Copilot IDE agent mode on at least two days in the last 28 — they rely on in-editor coding help before broader GitHub agent surfaces.',
    phase1HintIdeOnly:
      'Regular in-editor Copilot use (completions and/or IDE agent mode) on at least two days in the last 28.',
    agentPhaseHidden: 'N/A',
    agentPhaseHiddenHint:
      'GitHub labeled an agent phase (cloud, CLI, code review, etc.) — surfaces not used in your org.',
    phase2Title: 'Agent first',
    phase2Hint: 'One GitHub-based agent surface (cloud agent, code review, or CLI).',
    phase3Title: 'Multi-agent',
    phase3Hint: 'Two or more GitHub agent surfaces, or the GitHub Copilot app.',
    versionLabel: 'Classification version: {version}',
  },
  usagePattern: {
    noInsight: '—',
    colPattern: 'Usage pattern',
    colPatternHint:
      'Heuristic label from this user’s rates vs the org cohort in the current date range (not a GitHub API field). Open Usage for formulas and percentiles.',
    panelTitle: 'Usage pattern & scores',
    panelSubtitle: 'Compared with {count} users in the selected date range',
    ratesTitle: 'Derived rates (your value vs org)',
    rawCountsTitle: 'Raw totals vs org',
    colMetric: 'Metric',
    colValue: 'Your value',
    colOrgMedian: 'Org median',
    colPercentile: 'Percentile',
    colFormula: 'How it is calculated',
    percentileVsOrg: 'P{p} vs org',
    medianShort: 'median {v}',
    engagementScoreShort: 'Engagement {score}',
    disclaimer:
      'Patterns use org percentiles (P25/P50/P75) on derived rates and raw counts for the filtered cohort. They are guidance for coaching, not performance ratings.',
    recommendationsTitle: 'Coaching recommendations',
    recommendationsSubtitle: 'Suggested next steps for this person — not a performance rating.',
    effectiveness: {
      unknown: 'Need more data',
      idle: 'Seat mostly idle',
      building: 'Building the habit',
      productive: 'Strong fit',
      mixed: 'Mixed signals',
      high_volume_low_fit: 'High volume, low keep rate',
    },
    headlines: {
      insufficient_data: 'Not enough activity yet to coach on patterns — check back after a few days of use.',
      underuse: 'Copilot seat looks mostly idle compared to peers — focus on activation, not optimization.',
      light_user: 'Light but real usage — small nudges can turn this into a steady habit.',
      high_volume_low_fit:
        'Heavy Copilot activity with a low acceptance rate vs the org — lots of trials, few keeps. Tune how they work with suggestions.',
      active_reviewer:
        'They explore many suggestions but keep few — coaching on when to accept, edit, or dismiss will help.',
      selective_accepter:
        'They accept selectively with good fit — encourage broader tasks without forcing volume.',
      completion_first:
        'Inline completions carry most of the work — Chat and Agent can unlock bigger refactors.',
      efficient_adopter:
        'Strong acceptance and healthy volume — a natural internal champion candidate.',
      volume_adopter:
        'High accepted output — pair encouragement with PR quality habits so volume stays valuable.',
      power_user:
        'Deep, multi-surface usage — leverage them to lift the team while watching for burnout.',
      balanced_user:
        'Steady, typical mix vs the org — maintain rhythm and experiment with one new surface.',
    },
    actions: {
      waitForActivity: 'Wait for at least a few days of Copilot use in this date range before coaching on patterns.',
      tryShortSession: 'Ask them to complete one focused task with Copilot (e.g. a small bugfix) and review the metrics again.',
      checkDateRange: 'Confirm the global date range includes days when they actually worked.',
      enableCopilot: 'Verify the IDE extension is installed, signed in, and allowed by org policy.',
      officeHours: 'Offer a 30-minute Copilot office hours slot for setup and first wins.',
      removeBlockers: 'Check proxy, VPN, or repo access — idle seats are often technical blockers.',
      pairOnFirstTask: 'Pair-program on one ticket so they see accept vs dismiss in context.',
      dailyCopilotGoal: 'Suggest one Copilot-assisted task per day for two weeks (tests, docs, or small features).',
      tryChatOnce: 'Have them try Copilot Chat on a well-scoped question (not only Tab completions).',
      watchDemo: 'Share a 10-minute internal demo from a stronger adopter on the same stack.',
      pickSmallTicket: 'Assign a ticket sized for experimentation without delivery pressure.',
      repoInstructions: 'Add or refresh `.github/copilot-instructions.md` for their main repos (stack, conventions, test commands).',
      scopedPrompts: 'Coach smaller, file-scoped asks instead of “rewrite the whole module” in one shot.',
      tryChatRefactor: 'For multi-file work, use Chat with explicit goals and files instead of repeated inline generations.',
      pairWithPeer: 'Pair with someone in the top quartile for acceptance rate and compare prompt style.',
      reviewAcceptanceHabit: 'Discuss accept vs reject explicitly — many “low keep” users never dismiss, they just regenerate.',
      acceptOrDismiss: 'Encourage accepting good hunks quickly and dismissing bad ones instead of endless regeneration.',
      smallerEdits: 'Break work into smaller Copilot turns so each suggestion is easier to judge.',
      compareWithEfficientPeer: 'Compare their workflow with an efficient adopter on the same team (same repo if possible).',
      qualityIsGood: 'Affirm selective acceptance — quality over raw volume is healthy.',
      tryLargerChatTask: 'Invite one larger Chat task (refactor, test suite, migration plan) to grow impact safely.',
      shareSelectiveWorkflow: 'Ask them to demo how they decide what to accept — others can learn from it.',
      optionalExpandUsage: 'Optional: gradually increase usage on harder tickets once they are comfortable.',
      keepCompletions: 'Keep leveraging inline completions for boilerplate and small edits.',
      tryChatForTests: 'Use Chat for unit tests, edge cases, and “explain this diff” reviews.',
      agentForMultiFile: 'Try Agent or IDE agent mode for cross-file changes with a clear task description.',
      documentPatterns: 'Capture 3 prompt patterns that work for their repo in team docs.',
      championInvite: 'Invite them to a short “Copilot tips” session for the team or guild.',
      lunchAndLearn: 'Schedule a lunch-and-learn on their workflow (15 min demo + Q&A).',
      captureTips: 'Document their top 5 prompts in the team wiki or internal Slack channel.',
      stretchWithAgent: 'If they only use completions, pilot one Agent task on a contained branch.',
      prQualityCheck: 'Add a light PR checklist: tests run, no secrets, human review on large AI-assisted diffs.',
      shareVolumePatterns: 'Have them share how they batch-accept suggestions without losing review quality.',
      balanceSpeedAndReview: 'Balance speed with review — high LOC is fine if reviewers stay engaged.',
      mentorOthers: 'Ask them to mentor one lighter user for two weeks.',
      orgChampion: 'Nominate as org Copilot champion — office hours, repo templates, feedback loop to admins.',
      crossTeamDemo: 'Run a cross-team demo on Agent + Chat surfaces they use most.',
      exploreNewSurfaces: 'Experiment with one new surface (CLI, code review, or cloud agent) on a safe branch.',
      guardrailForBurnout: 'Check in on sustainable pace — power users can over-rely on generation without review.',
      maintainRhythm: 'Maintain current rhythm; revisit metrics monthly for drift.',
      tryOneNewSurface: 'Try one new surface this quarter (Chat if completion-heavy, Agent if chat-only).',
      monthlySelfCheck: 'Self-check: acceptance rate and PR review comments once per month.',
      benchmarkWithMedian: 'Compare against org medians in this dashboard — aim for fit, not maximum LOC.',
      tryChat: 'They rarely use Chat — try it for scoped questions, tests, and refactors.',
      tryAgent: 'Agent surfaces are unused — pilot IDE agent or cloud agent on a contained task.',
      cliWorkflow: 'They use the CLI — share team playbooks for scripts, PRs, and safe automation boundaries.',
      modelExperiment:
        'Their top model in this window is {model} — if acceptance stays low, try another model for their language/stack in IDE settings.',
      lowConfidenceNote: 'Low activity in range — treat recommendations as tentative until confidence rises.',
    },
    confidence: {
      low: 'Low confidence',
      medium: 'Medium confidence',
      high: 'High confidence',
    },
    rates: {
      acceptanceRate: {
        label: 'Acceptance rate',
        formula: 'acceptances ÷ generations × 100 (0% if generations = 0)',
      },
      generationsPerInteraction: {
        label: 'Generations per interaction',
        formula: 'generations ÷ interactions (0 if interactions = 0)',
      },
      locPerAcceptance: {
        label: 'LOC per acceptance',
        formula: 'lines added ÷ acceptances (0 if acceptances = 0)',
      },
      locPerInteraction: {
        label: 'LOC per interaction',
        formula: 'lines added ÷ interactions (0 if interactions = 0)',
      },
      locPerGeneration: {
        label: 'LOC per generation',
        formula: 'lines added ÷ generations (0 if generations = 0)',
      },
    },
    pattern: {
      insufficient_data: {
        title: 'Insufficient data',
        hint: 'Too little activity in the range to classify reliably.',
      },
      underuse: {
        title: 'Underuse',
        hint: 'Low interactions, generations, and LOC vs org — seat may be idle.',
      },
      light_user: {
        title: 'Light user',
        hint: 'Low activity vs the org in this period — including a high acceptance rate on very few events.',
      },
      selective_accepter: {
        title: 'Selective accepter',
        hint: 'High acceptance with meaningful generations in the period — focused, effective uptake.',
      },
      completion_first: {
        title: 'Completion-first',
        hint: 'High LOC per interaction with fewer chat turns — inline completions dominate.',
      },
      active_reviewer: {
        title: 'Active reviewer',
        hint: 'Many interactions with lower acceptance — explores suggestions before accepting.',
      },
      efficient_adopter: {
        title: 'Efficient adopter',
        hint: 'High acceptance and solid generation volume — good suggestion fit.',
      },
      volume_adopter: {
        title: 'Volume adopter',
        hint: 'Accepts many Copilot suggestions and adds many lines of code — above most peers in the org (not a quality score).',
      },
      high_try_low_keep: {
        title: 'High try, low keep',
        hint: 'Many generations and LOC but low acceptance — lots of trials, few keeps.',
      },
      power_user: {
        title: 'Power user',
        hint: 'High generations and LOC with agent or chat usage.',
      },
      balanced_user: {
        title: 'Balanced',
        hint: 'Metrics near org medians — steady, typical usage mix.',
      },
    },
  },
  usageCoaching: {
    panelTitle: 'Models & modes coaching',
    panelSubtitle:
      'From GitHub usage breakdown (Plan / Agent / Ask modes and models) — guidance only, not a rating.',
    planModeNote:
      'Plan mode appears in metrics as feature `{feature}` with models listed under Model × feature in the charts below.',
    hints: {
      insufficient_breakdown:
        'Activity is recorded but model/feature breakdown is missing for this window — coaching on Plan mode or premium models is not reliable yet.',
      plan_mode_summary:
        'Used Plan mode ({interactions} chat interactions). Models in Plan mode: {models}.',
      no_plan_mode:
        'Chat or Agent is active but Plan mode was not used — for architecture or multi-step work, try Plan mode with a strong model (e.g. Opus) before coding.',
      no_premium_models:
        'No premium models detected in this period — fine for routine work; for complex planning consider Opus or similar on Plan/Agent tasks.',
      premium_without_plan:
        'Premium models used ({models}) but not in Plan mode — suggest Plan mode for design/refactors, then Agent or edits for implementation.',
      high_spend_low_acceptance:
        'Extra AI spend with low acceptance ({acceptanceRate}%) — review prompts and model choice; routine tasks may not need premium models.',
    },
  },
  aiChat: {
    title: 'AI Metrics Assistant',
    fabTooltip: 'Ask AI about metrics',
    welcome: 'Ask me anything about your Copilot metrics!',
    inputPlaceholder: 'Ask about your Copilot metrics…',
    thinking: 'Thinking…',
    analyzing: 'Analyzing metrics…',
    disconnectToken: 'Disconnect personal token',
    clearConversation: 'Clear conversation',
    tokenRequired: 'AI token required',
    tokenOptionServer: 'Option 1: Server environment variable',
    tokenOptionServerHint:
      'An administrator can set the {code} environment variable on the server with a GitHub fine-grained PAT that has {permission} permission.',
    tokenOptionServerAccount:
      'The token must be scoped to a personal account (not an organization).',
    tokenOptionPersonal: 'Option 2: Provide your personal token',
    tokenOptionPersonalHint:
      'Create a personal fine-grained PAT with {permission}:',
    tokenLinkLabel: 'fine-grained personal access token',
    tokenPlaceholder: 'github_pat_…',
    tokenSave: 'Save & connect',
    tokenStorageHint:
      'Token is stored in your browser session only and sent securely to the server per request.',
    errorGeneric: 'An error occurred',
    suggested: {
      generalAdoption: 'What is our overall Copilot adoption trend?',
      generalImprovement: 'Which areas have the most room for improvement?',
      orgSummary: 'Summarize our Copilot usage over this period',
      orgAcceptanceTrend: 'What is our acceptance rate trend?',
      langTopAcceptance: 'Which programming language has the highest acceptance rate?',
      langUnderperforming: 'Which languages are underperforming in Copilot adoption?',
      editorMostActive: 'Which IDE has the most active Copilot users?',
      editorCompare: 'Compare VS Code and JetBrains Copilot usage',
      chatUsage: 'How actively is Copilot Chat being used?',
      chatTrend: 'What is the trend in chat turns over time?',
      seatsUnused: 'How many seats are unused or inactive?',
      seatsUtilization: 'What is our seat utilization rate?',
      usersTop: 'Who are the most active Copilot users?',
      usersZero: 'How many users have zero activity?',
      billingSpend: 'What is our net Copilot spend this period?',
      billingSku: 'Which billing SKUs drive the most cost?',
      prCreated: 'How many PRs were created by Copilot?',
      prMergeRate: 'What is the Copilot PR merge rate?',
    },
  },
  invite: {
    title: 'Invite members to organization',
    subtitle:
      'Invite GitHub users by email — one at a time or in bulk from an Excel file.',
    scopeHint:
      'Requires an organization owner token with admin:org (or equivalent GitHub App permission). Invitations are sent by GitHub email.',
    orgSection: 'Target organization',
    orgPicker: 'Organization',
    orgPickerHint: 'Select the organization that will receive the invitations',
    manualOrg: 'Organization slug',
    manualOrgHint: 'Enter a GitHub organization login if it is not in the list',
    currentOrg: 'current',
    role: 'Member role',
    roleHint: 'Default is direct_member (standard org member)',
    roles: {
      direct_member: 'Direct member',
      admin: 'Owner (admin)',
      billing_manager: 'Billing manager',
      reinstate_member: 'Reinstate member',
    },
    inviteSection: 'Invitations',
    modeSingle: 'Single email',
    modeBulk: 'Bulk Excel',
    singleEmail: 'Email address',
    sendSingle: 'Send invitation',
    excelLabel: 'Excel file (.xlsx)',
    excelHint:
      'The first sheet must include a column named email (case-insensitive). Other columns are ignored.',
    parsedCount: '{count} unique email(s) ready to invite.',
    invalidRowCount: ' {count} row(s) skipped (invalid email).',
    sendBulk: 'Invite {count} users',
    clear: 'Clear file',
    cancel: 'Cancel',
    downloadTemplate: 'Download Excel template',
    downloadResults: 'Download results',
    previewTitle: 'Emails to invite',
    resultsTitle: 'Invitation results',
    colEmail: 'Email',
    colStatus: 'Status',
    colMessage: 'Message',
    statusOk: 'Invited',
    statusFail: 'Failed',
    summary:
      'Organization {org}: {invited} invitation(s) created, {failed} failed.',
    progressTitle: 'Progress',
    progressCounts: '{done}/{total} · {invited} ok · {failed} failed',
    progressCurrent: 'Sending: {email}',
    progressWorking: 'Working…',
    progressIdle: 'Finished',
    logTitle: 'Activity log',
    logStart: 'Starting invites → org={org} count={count} role={role}',
    logParsed: 'Parsed {count} email(s) from sheet "{sheet}"',
    logSending: '[{index}/{total}] Inviting {email}',
    logOk: 'OK {email} (HTTP {status})',
    logFail: 'FAIL {email} (HTTP {status}): {message}',
    logDone: 'Done. invited={invited} failed={failed}',
    logCancelled: 'Cancelled after {done}/{total}',
    logOrgsFailed: 'Could not load enterprise organizations (IP allow list or permissions).',
    errors: {
      missingEmailColumn:
        'The Excel file must include a column named "email" (any capitalization).',
      emptyFile: 'The Excel file is empty or could not be read.',
      noEmails: 'No email addresses found in the email column.',
      invalidRows: 'The email column has values, but none are valid email addresses.',
      parseFailed: 'Could not parse the Excel file. Use .xlsx with an email column.',
      invalidEmail: 'Enter a valid email address.',
      orgRequired: 'Select or enter an organization first.',
      sendFailed: 'Failed to send invitations. Check token permissions (admin:org).',
    },
  },
}

export default en
