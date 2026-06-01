<template>
  <Teleport to="body">
    <div class="ai-chat-panel">
      <v-btn
        v-if="!isOpen"
        class="ai-chat-fab"
        color="primary"
        icon
        size="large"
        elevation="6"
        @click="isOpen = true"
      >
        <v-icon>mdi-robot-outline</v-icon>
        <v-tooltip activator="parent" :z-index="2147483647" :location="fabTooltipLocation">
          {{ t('aiChat.fabTooltip') }}
        </v-tooltip>
      </v-btn>

      <v-card v-if="isOpen" class="ai-chat-card" elevation="12" rounded="lg">
        <v-toolbar class="brand-toolbar ai-chat-toolbar" density="compact" flat>
          <v-icon class="ms-3">mdi-robot-outline</v-icon>
          <v-toolbar-title class="text-body-1 font-weight-medium">
            {{ t('aiChat.title') }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            v-if="userToken"
            icon
            size="small"
            variant="text"
            :title="t('aiChat.disconnectToken')"
            @click="clearUserToken"
          >
            <v-icon size="small">mdi-key-remove</v-icon>
            <v-tooltip activator="parent" :z-index="2147483647" location="bottom">
              {{ t('aiChat.disconnectToken') }}
            </v-tooltip>
          </v-btn>
          <v-btn icon size="small" variant="text" @click="clearConversation">
            <v-icon size="small">mdi-delete-outline</v-icon>
            <v-tooltip activator="parent" :z-index="2147483647" location="bottom">
              {{ t('aiChat.clearConversation') }}
            </v-tooltip>
          </v-btn>
          <v-btn icon size="small" variant="text" @click="isOpen = false">
            <v-icon size="small">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <div ref="messagesContainer" class="ai-chat-messages">
          <div v-if="messages.length === 0 && !tokenSetupNeeded" class="ai-chat-welcome">
            <v-icon size="48" color="primary" class="mb-3 opacity-60">mdi-robot-happy-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('aiChat.welcome') }}
            </p>
            <div class="ai-chat-suggestions">
              <v-chip
                v-for="(q, i) in suggestedQuestions"
                :key="i"
                size="small"
                variant="outlined"
                color="primary"
                class="ma-1 ai-chat-suggestion-chip"
                @click="askQuestion(q)"
              >
                {{ q }}
              </v-chip>
            </div>
          </div>

          <div v-if="tokenSetupNeeded" class="ai-chat-token-setup pa-3">
            <v-icon size="40" color="warning" class="mb-2">mdi-key-alert</v-icon>
            <p class="text-body-2 font-weight-medium mb-2">{{ t('aiChat.tokenRequired') }}</p>
            <p class="text-body-2 text-medium-emphasis mb-3">
              {{ tokenErrorMessage }}
            </p>

            <v-expansion-panels variant="accordion" class="mb-3 ai-chat-token-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="text-body-2 py-2">
                  <v-icon size="small" class="me-2">mdi-server</v-icon>
                  {{ t('aiChat.tokenOptionServer') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p class="text-caption text-medium-emphasis mb-2">
                    {{
                      t('aiChat.tokenOptionServerHint', {
                        code: 'NUXT_AI_TOKEN',
                        permission: 'Models → Read',
                      })
                    }}
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    {{ t('aiChat.tokenOptionServerAccount') }}
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title class="text-body-2 py-2">
                  <v-icon size="small" class="me-2">mdi-account-key</v-icon>
                  {{ t('aiChat.tokenOptionPersonal') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p class="text-caption text-medium-emphasis mb-2">
                    {{ t('aiChat.tokenOptionPersonalHint', { permission: 'Models → Read' }) }}
                    <a
                      href="https://github.com/settings/personal-access-tokens/new"
                      target="_blank"
                      rel="noopener"
                      class="ai-chat-link"
                    >
                      {{ t('aiChat.tokenLinkLabel') }}
                    </a>
                  </p>
                  <v-text-field
                    v-model="userTokenInput"
                    type="password"
                    :placeholder="t('aiChat.tokenPlaceholder')"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mb-2"
                    prepend-inner-icon="mdi-key"
                  />
                  <v-btn
                    color="primary"
                    size="small"
                    block
                    :disabled="!userTokenInput.trim()"
                    @click="saveUserToken"
                  >
                    {{ t('aiChat.tokenSave') }}
                  </v-btn>
                  <p class="text-caption text-medium-emphasis mt-2">
                    <v-icon size="x-small">mdi-information-outline</v-icon>
                    {{ t('aiChat.tokenStorageHint') }}
                  </p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['ai-chat-message', msg.role === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-assistant']"
          >
            <div class="ai-chat-bubble">
              <div
                v-if="msg.role === 'assistant'"
                class="ai-chat-bubble-content"
                v-html="formatMarkdown(msg.content)"
              />
              <div v-else class="ai-chat-bubble-content">{{ msg.content }}</div>
            </div>
          </div>

          <div v-if="isLoading" class="ai-chat-message ai-chat-message-assistant">
            <div class="ai-chat-bubble ai-chat-loading">
              <v-progress-circular size="16" width="2" indeterminate color="primary" class="me-2" />
              <span class="text-body-2 text-medium-emphasis">
                {{ loadingText }}
              </span>
            </div>
          </div>

          <v-alert
            v-if="errorMessage"
            type="error"
            density="compact"
            variant="tonal"
            class="ma-2"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
        </div>

        <v-divider />
        <div class="ai-chat-input pa-2">
          <v-text-field
            v-model="inputText"
            :placeholder="t('aiChat.inputPlaceholder')"
            variant="outlined"
            density="compact"
            hide-details
            :disabled="isLoading"
            @keyup.enter="sendMessage"
          >
            <template #append-inner>
              <v-btn
                icon
                size="small"
                variant="text"
                color="primary"
                :disabled="!inputText.trim() || isLoading"
                @click="sendMessage"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>
      </v-card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { getAiChatSuggestedQuestions } from '../../shared/i18n/aiChatSuggestions'

interface Props {
  currentTab?: string
  queryParams?: Record<string, string>
  metrics?: unknown[]
  seats?: unknown[]
  totalSeats?: number
  userMetrics?: unknown[]
  reportData?: unknown[]
}

const props = withDefaults(defineProps<Props>(), {
  currentTab: undefined,
  queryParams: undefined,
  metrics: undefined,
  seats: undefined,
  totalSeats: undefined,
  userMetrics: undefined,
  reportData: undefined,
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const { t, locale, isRtl } = useAppI18n()

const isOpen = ref(false)
const inputText = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const loadingText = ref('')
const errorMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const tokenSetupNeeded = ref(false)
const tokenErrorMessage = ref('')
const userTokenInput = ref('')
const userToken = ref('')

loadingText.value = t.value('aiChat.thinking')

const fabTooltipLocation = computed(() => (isRtl.value ? 'right' : 'left'))

const suggestedQuestions = computed(() =>
  getAiChatSuggestedQuestions(props.currentTab, t.value)
)

if (import.meta.client) {
  const stored = sessionStorage.getItem('ai-chat-user-token')
  if (stored) userToken.value = stored
}

function clearConversation() {
  messages.value = []
  errorMessage.value = ''
  tokenSetupNeeded.value = false
}

function saveUserToken() {
  const token = userTokenInput.value.trim()
  if (!token) return
  userToken.value = token
  userTokenInput.value = ''
  tokenSetupNeeded.value = false
  if (import.meta.client) {
    sessionStorage.setItem('ai-chat-user-token', token)
  }
}

function clearUserToken() {
  userToken.value = ''
  userTokenInput.value = ''
  if (import.meta.client) {
    sessionStorage.removeItem('ai-chat-user-token')
  }
}

function askQuestion(question: string) {
  inputText.value = question
  sendMessage()
}

async function sendMessage() {
  const question = inputText.value.trim()
  if (!question || isLoading.value) return

  inputText.value = ''
  errorMessage.value = ''

  messages.value.push({ role: 'user', content: question })
  await scrollToBottom()

  isLoading.value = true
  loadingText.value = t.value('aiChat.analyzing')

  try {
    const history = messages.value.slice(0, -1).slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: {
        question,
        conversationHistory: history,
        currentTab: props.currentTab,
        locale: locale.value,
        queryParams: props.queryParams,
        userToken: userToken.value || undefined,
        dashboardData: {
          metrics: props.metrics,
          seats: props.seats,
          totalSeats: props.totalSeats,
          userMetrics: props.userMetrics,
          reportData: props.reportData,
        },
      },
    })

    const result = response as { answer: string; toolsUsed?: string[]; rounds?: number }

    messages.value.push({
      role: 'assistant',
      content: result.answer,
    })
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      statusMessage?: string
      data?: { statusMessage?: string; data?: { code?: string; message?: string } }
      message?: string
    }
    const errorCode = err.data?.data?.code || err.statusMessage
    const errorMsg =
      err.data?.data?.message ||
      err.data?.statusMessage ||
      err.message ||
      t.value('aiChat.errorGeneric')

    if (errorCode === 'missing_token' || errorCode === 'invalid_token') {
      tokenSetupNeeded.value = true
      tokenErrorMessage.value = errorMsg
      messages.value.pop()
    } else {
      errorMessage.value = errorMsg
    }
  } finally {
    isLoading.value = false
    loadingText.value = t.value('aiChat.thinking')
    await scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

watch(locale, () => {
  loadingText.value = t.value('aiChat.thinking')
})

watch(messages, () => scrollToBottom(), { deep: true })
</script>

<style scoped>
.ai-chat-panel {
  position: fixed;
  inset-block-end: 16px;
  inset-inline-end: 16px;
  z-index: 2147483647;
}

.ai-chat-fab {
  position: fixed;
  inset-block-end: 24px;
  inset-inline-end: 24px;
  z-index: 2147483647;
}

.ai-chat-card {
  width: 420px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  background: #ffffff !important;
  border: 1px solid color-mix(in srgb, var(--brand-lavender) 80%, white);
  box-shadow: var(--brand-shadow-lg);
  z-index: 2147483647;
}

.ai-chat-toolbar {
  flex-shrink: 0;
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  min-height: 200px;
  max-height: 420px;
  background: #ffffff;
}

.ai-chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  text-align: center;
}

.ai-chat-token-setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.ai-chat-token-panels {
  width: 100%;
  text-align: start;
}

.ai-chat-link {
  color: var(--brand-primary);
  font-weight: 600;
  text-decoration: none;
}

.ai-chat-link:hover {
  text-decoration: underline;
}

.ai-chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

/* Outlined chips fill with primary on hover — keep label white for contrast */
.ai-chat-suggestions :deep(.ai-chat-suggestion-chip) {
  border-color: var(--brand-primary) !important;
  color: var(--brand-primary-dark) !important;
}

.ai-chat-suggestions :deep(.ai-chat-suggestion-chip .v-chip__content) {
  color: var(--brand-primary-dark) !important;
}

.ai-chat-suggestions :deep(.ai-chat-suggestion-chip:hover),
.ai-chat-suggestions :deep(.ai-chat-suggestion-chip:focus-visible),
.ai-chat-suggestions :deep(.ai-chat-suggestion-chip.v-chip--selected) {
  background: var(--brand-primary) !important;
  color: #ffffff !important;
}

.ai-chat-suggestions :deep(.ai-chat-suggestion-chip:hover .v-chip__content),
.ai-chat-suggestions :deep(.ai-chat-suggestion-chip:focus-visible .v-chip__content),
.ai-chat-suggestions :deep(.ai-chat-suggestion-chip.v-chip--selected .v-chip__content) {
  color: #ffffff !important;
}

.ai-chat-suggestions :deep(.ai-chat-suggestion-chip:hover .v-chip__overlay),
.ai-chat-suggestions :deep(.ai-chat-suggestion-chip:focus-visible .v-chip__overlay) {
  opacity: 0 !important;
}

.ai-chat-message {
  margin-bottom: 8px;
  display: flex;
}

.ai-chat-message-user {
  justify-content: flex-end;
}

.ai-chat-message-assistant {
  justify-content: flex-start;
}

.ai-chat-bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: var(--brand-radius-md);
  font-size: 0.875rem;
  line-height: 1.5;
}

.ai-chat-message-user .ai-chat-bubble {
  background: var(--brand-primary);
  color: #ffffff;
  border-end-end-radius: 4px;
}

.ai-chat-message-assistant .ai-chat-bubble {
  background: color-mix(in srgb, var(--brand-lavender) 45%, white);
  color: var(--brand-text);
  border-end-start-radius: 4px;
}

.ai-chat-loading {
  display: flex;
  align-items: center;
}

.ai-chat-bubble-content :deep(code) {
  background-color: color-mix(in srgb, var(--brand-primary) 12%, white);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.85em;
}

.ai-chat-input {
  background-color: #ffffff;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .ai-chat-card {
    width: calc(100vw - 32px);
    max-height: calc(100vh - 100px);
  }
}
</style>
