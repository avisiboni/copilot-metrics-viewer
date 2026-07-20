<template>
  <div class="invite-members pa-4">
    <div class="d-flex flex-wrap align-center ga-2 mb-4">
      <div>
        <h2 class="text-h6 mb-1">
          {{ t('invite.title') }}
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t('invite.subtitle') }}
        </p>
      </div>
      <v-spacer />
      <v-btn
        variant="outlined"
        size="small"
        prepend-icon="mdi-file-excel-outline"
        :disabled="sending"
        @click="downloadTemplate"
      >
        {{ t('invite.downloadTemplate') }}
      </v-btn>
    </div>

    <v-alert
      v-if="showScopeHint"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4 brand-alert brand-alert--info"
      icon="mdi-information-outline"
      closable
      :close-label="t('common.close')"
      @click:close="showScopeHint = false"
    >
      {{ t('invite.scopeHint') }}
    </v-alert>

    <v-row dense>
      <v-col cols="12" md="5">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-subtitle-2 mb-3">
            {{ t('invite.orgSection') }}
          </div>

          <v-autocomplete
            v-model="selectedOrg"
            :items="orgItems"
            :loading="orgsLoading"
            :label="t('invite.orgPicker')"
            :hint="t('invite.orgPickerHint')"
            persistent-hint
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-domain"
            clearable
            :disabled="sending"
            class="mb-3"
          />

          <v-text-field
            v-model="manualOrg"
            :label="t('invite.manualOrg')"
            :hint="t('invite.manualOrgHint')"
            persistent-hint
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-pencil-outline"
            class="mb-3"
            :disabled="!!selectedOrg || sending"
          />

          <v-select
            v-model="role"
            :items="roleItems"
            :label="t('invite.role')"
            :hint="t('invite.roleHint')"
            persistent-hint
            variant="outlined"
            density="comfortable"
            :disabled="sending"
            class="mb-1"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="text-subtitle-2 mb-3">
            {{ t('invite.inviteSection') }}
          </div>

          <v-tabs v-model="inviteMode" density="compact" class="mb-3" :disabled="sending">
            <v-tab value="single">
              {{ t('invite.modeSingle') }}
            </v-tab>
            <v-tab value="bulk">
              {{ t('invite.modeBulk') }}
            </v-tab>
          </v-tabs>

          <v-window v-model="inviteMode">
            <v-window-item value="single">
              <v-text-field
                v-model="singleEmail"
                :label="t('invite.singleEmail')"
                type="email"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email-outline"
                :error-messages="singleEmailError"
                :disabled="sending"
                @keyup.enter="inviteSingle"
              />
              <v-btn
                color="primary"
                variant="flat"
                :loading="sending"
                :disabled="!canSendSingle"
                prepend-icon="mdi-account-plus"
                @click="inviteSingle"
              >
                {{ t('invite.sendSingle') }}
              </v-btn>
            </v-window-item>

            <v-window-item value="bulk">
              <v-file-input
                v-model="excelFile"
                :label="t('invite.excelLabel')"
                :hint="t('invite.excelHint')"
                persistent-hint
                accept=".xlsx,.xls"
                prepend-icon="mdi-microsoft-excel"
                variant="outlined"
                density="comfortable"
                show-size
                clearable
                :error-messages="excelError"
                :disabled="sending"
                class="mb-3"
                @update:model-value="onExcelSelected"
              />

              <v-alert
                v-if="parsedEmails.length"
                type="success"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                {{ t('invite.parsedCount', { count: parsedEmails.length }) }}
                <span v-if="invalidRowCount">
                  {{ t('invite.invalidRowCount', { count: invalidRowCount }) }}
                </span>
              </v-alert>

              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  :loading="sending"
                  :disabled="!canSendBulk"
                  prepend-icon="mdi-account-multiple-plus"
                  @click="inviteBulk"
                >
                  {{ t('invite.sendBulk', { count: parsedEmails.length }) }}
                </v-btn>
                <v-btn
                  v-if="sending"
                  variant="outlined"
                  color="error"
                  size="small"
                  @click="cancelSending = true"
                >
                  {{ t('invite.cancel') }}
                </v-btn>
                <v-btn
                  v-if="parsedEmails.length && !sending"
                  variant="text"
                  size="small"
                  @click="clearExcel"
                >
                  {{ t('invite.clear') }}
                </v-btn>
              </div>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="showProgressPanel" variant="outlined" class="mt-4 pa-4">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon size="small">mdi-progress-clock</v-icon>
        <span class="text-subtitle-2">{{ t('invite.progressTitle') }}</span>
        <v-spacer />
        <span class="text-caption text-medium-emphasis me-2">
          {{ t('invite.progressCounts', {
            done: progress.done,
            total: progress.total,
            invited: progress.invited,
            failed: progress.failed,
          }) }}
        </span>
        <v-btn
          v-if="!sending"
          icon
          variant="text"
          size="small"
          :aria-label="t('common.close')"
          @click="dismissProgress"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-progress-linear
        :model-value="progressPercent"
        :color="progress.failed && !sending ? 'warning' : 'primary'"
        height="10"
        rounded
        class="mb-2"
      />
      <div class="text-caption text-medium-emphasis mb-2">
        {{ progress.currentEmail
          ? t('invite.progressCurrent', { email: progress.currentEmail })
          : (sending ? t('invite.progressWorking') : t('invite.progressIdle')) }}
      </div>
      <v-textarea
        :model-value="activityLog.join('\n')"
        :label="t('invite.logTitle')"
        readonly
        variant="outlined"
        density="compact"
        rows="8"
        auto-grow
        class="invite-log font-monospace"
      />
    </v-card>

    <v-alert
      v-if="actionError"
      type="error"
      variant="tonal"
      density="compact"
      class="mt-4 brand-alert brand-alert--error"
      prominent
      closable
      :close-label="t('common.close')"
      @click:close="actionError = ''"
    >
      {{ actionError }}
    </v-alert>

    <v-alert
      v-if="lastSummary && !sending"
      :type="lastSummary.failed ? 'warning' : 'success'"
      variant="tonal"
      density="compact"
      class="mt-4"
      :class="lastSummary.failed ? 'brand-alert brand-alert--warning' : 'brand-alert brand-alert--success'"
      prominent
      closable
      :close-label="t('common.close')"
      @click:close="lastSummary = null"
    >
      {{
        t('invite.summary', {
          org: lastSummary.org,
          invited: lastSummary.invited,
          failed: lastSummary.failed,
        })
      }}
    </v-alert>

    <v-card v-if="previewRows.length && !resultRows.length" variant="outlined" class="mt-4">
      <v-card-title class="text-subtitle-2">
        {{ t('invite.previewTitle') }}
      </v-card-title>
      <BrandTableShell>
        <v-data-table
          :headers="previewHeaders"
          :items="previewRows"
          :items-per-page="10"
          density="compact"
        />
      </BrandTableShell>
    </v-card>

    <v-card v-if="resultRows.length" variant="outlined" class="mt-4">
      <v-card-title class="text-subtitle-2 d-flex align-center">
        {{ t('invite.resultsTitle') }}
        <v-spacer />
        <v-chip
          size="small"
          variant="flat"
          class="brand-status-chip brand-status-chip--invite-ok me-1"
        >
          {{ progress.invited }} {{ t('invite.statusOk') }}
        </v-chip>
        <v-chip
          size="small"
          variant="flat"
          class="brand-status-chip brand-status-chip--invite-fail me-2"
        >
          {{ progress.failed }} {{ t('invite.statusFail') }}
        </v-chip>
        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-download"
          class="me-2"
          @click="downloadResults"
        >
          {{ t('invite.downloadResults') }}
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('common.close')"
          @click="dismissResults"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <BrandTableShell>
        <v-data-table
          :headers="resultHeaders"
          :items="resultRows"
          :items-per-page="25"
          density="compact"
        >
          <template #item.success="{ item }">
            <v-chip
              size="small"
              variant="flat"
              class="brand-status-chip"
              :class="item.success ? 'brand-status-chip--invite-ok' : 'brand-status-chip--invite-fail'"
            >
              {{ item.success ? t('invite.statusOk') : t('invite.statusFail') }}
            </v-chip>
          </template>
          <template #item.status="{ item }">
            <span class="text-caption">{{ item.status ?? '—' }}</span>
          </template>
        </v-data-table>
      </BrandTableShell>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import {
  buildInviteEmailTemplateWorkbook,
  parseInviteEmailsFromWorkbook,
  isValidInviteEmail,
} from '../../shared/utils/org-invite-excel'
import type {
  OrgInvitationsResponse,
  OrgInviteResultItem,
} from '../../shared/types/org-invitations'
import { downloadCSV } from '@/utils/csvExport'

const { t } = useAppI18n()
const config = useRuntimeConfig()
const route = useRoute()

type InviteMode = 'single' | 'bulk'

interface OrgOption {
  title: string
  value: string
}

const inviteMode = ref<InviteMode>('bulk')
const selectedOrg = ref<string | null>(null)
const manualOrg = ref('')
const role = ref('direct_member')
const singleEmail = ref('')
const singleEmailError = ref('')
const excelFile = ref<File | File[] | null>(null)
const excelError = ref('')
const parsedEmails = ref<string[]>([])
const invalidRowCount = ref(0)
const orgsLoading = ref(false)
const orgItems = ref<OrgOption[]>([])
const sending = ref(false)
const cancelSending = ref(false)
const showScopeHint = ref(true)
const progressDismissed = ref(false)
const actionError = ref('')
const activityLog = ref<string[]>([])
const lastSummary = ref<{ org: string; invited: number; failed: number } | null>(null)
const resultRows = ref<OrgInviteResultItem[]>([])
const progress = ref({
  total: 0,
  done: 0,
  invited: 0,
  failed: 0,
  currentEmail: '',
})

const showProgressPanel = computed(
  () => !progressDismissed.value && (sending.value || progress.value.total > 0)
)

const roleItems = computed(() => [
  { title: t.value('invite.roles.direct_member'), value: 'direct_member' },
  { title: t.value('invite.roles.admin'), value: 'admin' },
  { title: t.value('invite.roles.billing_manager'), value: 'billing_manager' },
  { title: t.value('invite.roles.reinstate_member'), value: 'reinstate_member' },
])

const targetOrg = computed(() => {
  const fromPicker = (selectedOrg.value || '').trim()
  if (fromPicker) return fromPicker
  return manualOrg.value.trim()
})

const canSendSingle = computed(
  () => !!targetOrg.value && isValidInviteEmail(singleEmail.value) && !sending.value
)
const canSendBulk = computed(
  () => !!targetOrg.value && parsedEmails.value.length > 0 && !sending.value
)

const progressPercent = computed(() => {
  if (!progress.value.total) return 0
  return Math.round((progress.value.done / progress.value.total) * 100)
})

const previewRows = computed(() =>
  parsedEmails.value.map((email, index) => ({ index: index + 1, email }))
)

const previewHeaders = computed(() => [
  { title: '#', key: 'index', width: 64 },
  { title: t.value('invite.colEmail'), key: 'email' },
])

const resultHeaders = computed(() => [
  { title: t.value('invite.colEmail'), key: 'email' },
  { title: t.value('invite.colStatus'), key: 'success' },
  { title: 'HTTP', key: 'status', width: 72 },
  { title: t.value('invite.colMessage'), key: 'message' },
])

function appendLog(line: string) {
  const stamp = new Date().toLocaleTimeString()
  activityLog.value = [...activityLog.value, `[${stamp}] ${line}`].slice(-200)
}

function dismissProgress() {
  progressDismissed.value = true
  if (!sending.value) {
    activityLog.value = []
    progress.value = { total: 0, done: 0, invited: 0, failed: 0, currentEmail: '' }
  }
}

function dismissResults() {
  resultRows.value = []
  lastSummary.value = null
}

function csvEscape(value: string | number | boolean | null | undefined): string {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadResults() {
  if (!resultRows.value.length) return
  const headers = ['email', 'status', 'http_status', 'message', 'invitation_id', 'organization', 'role']
  const org = targetOrg.value
  const memberRole = role.value
  const lines = [
    headers.join(','),
    ...resultRows.value.map((row) =>
      [
        csvEscape(row.email),
        csvEscape(row.success ? 'invited' : 'failed'),
        csvEscape(row.status ?? ''),
        csvEscape(row.message ?? ''),
        csvEscape(row.invitationId ?? ''),
        csvEscape(org),
        csvEscape(memberRole),
      ].join(',')
    ),
  ]
  const stamp = new Date().toISOString().slice(0, 10)
  const safeOrg = org.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'org'
  downloadCSV(lines.join('\n'), `org-invite-results-${safeOrg}-${stamp}.csv`)
}

function asFile(value: File | File[] | null | undefined): File | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

async function loadOrgs() {
  orgsLoading.value = true
  const options: OrgOption[] = []
  const currentOrg = String(config.public.githubOrg || '').trim()
  if (currentOrg) {
    options.push({
      title: `${currentOrg} (${t.value('invite.currentOrg')})`,
      value: currentOrg,
    })
  }

  const ent = String(config.public.githubEnt || '').trim()
  if (ent) {
    try {
      const params = new URLSearchParams({
        githubEnt: ent,
        scope: 'enterprise',
      })
      if (config.public.isDataMocked) params.set('isDataMocked', 'true')
      const res = await $fetch<{ isFullGhec: boolean; orgs: Array<{ login: string; name: string }> }>(
        `/api/enterprise-orgs?${params}`
      )
      for (const org of res.orgs || []) {
        if (options.some((o) => o.value === org.login)) continue
        options.push({
          title: org.name && org.name !== org.login ? `${org.name} (${org.login})` : org.login,
          value: org.login,
        })
      }
    } catch (err) {
      console.warn('Failed to load enterprise orgs for invite picker', err)
      appendLog(t.value('invite.logOrgsFailed'))
    }
  }

  const routeOrg = typeof route.params.org === 'string' ? route.params.org : ''
  if (routeOrg && !options.some((o) => o.value === routeOrg)) {
    options.unshift({ title: routeOrg, value: routeOrg })
  }

  orgItems.value = options
  if (!selectedOrg.value) {
    selectedOrg.value = routeOrg || currentOrg || options[0]?.value || null
  }
  orgsLoading.value = false
}

async function onExcelSelected(value: File | File[] | null) {
  excelError.value = ''
  parsedEmails.value = []
  invalidRowCount.value = 0
  const file = asFile(value)
  if (!file) return

  try {
    const buffer = await file.arrayBuffer()
    const parsed = await parseInviteEmailsFromWorkbook(buffer)
    if (parsed.error === 'missing_email_column') {
      excelError.value = t.value('invite.errors.missingEmailColumn')
      return
    }
    if (parsed.error === 'empty_file') {
      excelError.value = t.value('invite.errors.emptyFile')
      return
    }
    if (parsed.error === 'no_emails') {
      excelError.value = t.value('invite.errors.noEmails')
      return
    }
    if (parsed.error === 'invalid_rows') {
      excelError.value = t.value('invite.errors.invalidRows')
      return
    }
    parsedEmails.value = parsed.emails
    invalidRowCount.value = parsed.invalidRows.length
    appendLog(t.value('invite.logParsed', { count: parsed.emails.length, sheet: parsed.sheetName }))
  } catch (err) {
    console.error(err)
    excelError.value = t.value('invite.errors.parseFailed')
  }
}

function clearExcel() {
  excelFile.value = null
  excelError.value = ''
  parsedEmails.value = []
  invalidRowCount.value = 0
}

async function downloadTemplate() {
  const buf = await buildInviteEmailTemplateWorkbook()
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'org-invite-emails-template.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

async function inviteEmail(email: string): Promise<OrgInviteResultItem> {
  const res = await $fetch<OrgInvitationsResponse>('/api/org-invitations', {
    method: 'POST',
    body: {
      org: targetOrg.value,
      emails: [email],
      role: role.value,
      isDataMocked: config.public.isDataMocked === true,
    },
  })
  for (const line of res.logs || []) {
    appendLog(line)
  }
  return (
    res.results[0] || {
      email,
      success: false,
      message: 'No result returned',
    }
  )
}

async function sendInvites(emails: string[]) {
  actionError.value = ''
  lastSummary.value = null
  resultRows.value = []
  cancelSending.value = false
  activityLog.value = []
  if (!targetOrg.value) {
    actionError.value = t.value('invite.errors.orgRequired')
    return
  }

  sending.value = true
  progressDismissed.value = false
  progress.value = {
    total: emails.length,
    done: 0,
    invited: 0,
    failed: 0,
    currentEmail: '',
  }
  appendLog(t.value('invite.logStart', { org: targetOrg.value, count: emails.length, role: role.value }))

  const results: OrgInviteResultItem[] = []
  try {
    for (let i = 0; i < emails.length; i++) {
      if (cancelSending.value) {
        appendLog(t.value('invite.logCancelled', { done: i, total: emails.length }))
        break
      }
      const email = emails[i]!
      progress.value.currentEmail = email
      appendLog(t.value('invite.logSending', { index: i + 1, total: emails.length, email }))

      try {
        const item = await inviteEmail(email)
        results.push(item)
        if (item.success) {
          progress.value.invited += 1
          appendLog(t.value('invite.logOk', { email, status: item.status ?? 201 }))
        } else {
          progress.value.failed += 1
          appendLog(
            t.value('invite.logFail', {
              email,
              status: item.status ?? '—',
              message: item.message || 'Unknown error',
            })
          )
        }
      } catch (err: unknown) {
        const e = err as { data?: { statusMessage?: string; message?: string }; message?: string; statusCode?: number }
        const message =
          e.data?.statusMessage ||
          e.data?.message ||
          e.message ||
          t.value('invite.errors.sendFailed')
        const item: OrgInviteResultItem = {
          email,
          success: false,
          status: e.statusCode,
          message,
        }
        results.push(item)
        progress.value.failed += 1
        appendLog(t.value('invite.logFail', { email, status: e.statusCode ?? '—', message }))
      }

      progress.value.done = i + 1
      resultRows.value = [...results]
    }

    lastSummary.value = {
      org: targetOrg.value,
      invited: progress.value.invited,
      failed: progress.value.failed,
    }
    appendLog(
      t.value('invite.logDone', {
        invited: progress.value.invited,
        failed: progress.value.failed,
      })
    )
  } finally {
    progress.value.currentEmail = ''
    sending.value = false
    cancelSending.value = false
  }
}

async function inviteSingle() {
  singleEmailError.value = ''
  const email = singleEmail.value.trim()
  if (!isValidInviteEmail(email)) {
    singleEmailError.value = t.value('invite.errors.invalidEmail')
    return
  }
  await sendInvites([email])
}

async function inviteBulk() {
  if (!parsedEmails.value.length) {
    excelError.value = t.value('invite.errors.noEmails')
    return
  }
  await sendInvites(parsedEmails.value)
}

onMounted(() => {
  loadOrgs()
})
</script>

<style scoped>
.invite-log :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.35;
}
</style>
