<template>
  <div class="login-shell flex min-h-screen items-center justify-center p-4 md:p-8">
    <section class="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
      <div class="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div class="bg-slate-950 px-8 py-10 text-white md:px-10 md:py-12">
          <Badge variant="secondary">{{ t('app.title') }}</Badge>
          <h1 class="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            {{ t('auth.startWorkspace') }}
          </h1>
          <p class="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            {{ t('auth.signInCopy') }}
          </p>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-300">{{ t('app.liveAndAvailable') }}</p>
              <p class="mt-2 text-lg font-semibold">{{ t('app.liveSync') }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-300">{{ t('app.scanDevices') }}</p>
              <p class="mt-2 text-lg font-semibold">{{ t('app.scanAndConnect') }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-300">{{ t('app.deviceInventoryTitle') }}</p>
              <p class="mt-2 text-lg font-semibold">{{ t('app.oneSimpleList') }}</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-8 md:px-10 md:py-12">
          <div class="max-w-md">
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ isCreateMode ? t('auth.createAccount') : t('auth.signIn') }}</p>
            <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {{ isCreateMode ? t('auth.startWorkspace') : t('auth.welcomeBack') }}
            </h2>
            <p class="mt-3 text-sm leading-6 text-slate-500">
              {{ isCreateMode ? t('auth.createAccountCopy') : t('auth.signInCopy') }}
            </p>

            <form class="mt-8 space-y-5" @submit.prevent="submitLogin">
              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">{{ t('auth.email') }}</span>
                <Input v-model="email" type="email" :placeholder="t('auth.emailPlaceholder')" />
              </label>

              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">{{ t('auth.password') }}</span>
                <Input v-model="password" type="password" :placeholder="t('auth.passwordPlaceholder')" />
              </label>

              <label v-if="isCreateMode" class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">{{ t('auth.confirmPassword') }}</span>
                <Input v-model="confirmPassword" type="password" :placeholder="t('auth.confirmPasswordPlaceholder')" />
              </label>

              <label v-if="isCreateMode" class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">{{ t('app.languageInRegistration') }}</span>
                <Select v-model="language">
                  <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </Select>
              </label>

              <p v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {{ error }}
              </p>

              <Button type="submit" class="w-full" :disabled="loading">
                {{ loading ? t('auth.pleaseWait') : isCreateMode ? t('auth.createAccount') : t('auth.signIn') }}
              </Button>

              <Button type="button" variant="ghost" class="w-full" @click="toggleMode">
                {{ isCreateMode ? t('auth.alreadyHaveAccount') : t('auth.needAccount') }}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Badge from './ui/Badge.vue';
import Button from './ui/Button.vue';
import Input from './ui/Input.vue';
import Select from './ui/Select.vue';
import { getStoredLocale, normalizeLocale, supportedLocales, type LocaleCode } from '../i18n';

defineProps<{
  loading: boolean;
  error: string;
}>();

const emit = defineEmits<{
  login: [credentials: { email: string; password: string }];
  register: [credentials: { email: string; password: string; confirmPassword: string; language: LocaleCode }];
}>();

const { t, locale } = useI18n();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const language = ref<LocaleCode>(getStoredLocale());
const isCreateMode = ref(false);

const languageOptions = computed(() => {
  void locale.value;

  return supportedLocales.map((value) => ({
    value,
    label: t(`app.languageLabels.${value}`),
  }));
});

const submitLogin = () => {
  if (isCreateMode.value) {
    emit('register', {
      email: email.value.trim(),
      password: password.value,
      confirmPassword: confirmPassword.value,
      language: normalizeLocale(language.value),
    });
    return;
  }

  emit('login', { email: email.value.trim(), password: password.value });
};

const toggleMode = () => {
  isCreateMode.value = !isCreateMode.value;
  password.value = '';
  confirmPassword.value = '';
};
</script>
