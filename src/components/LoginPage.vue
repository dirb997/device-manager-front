<template>
  <div class="min-h-screen login-shell flex items-center justify-center p-4 md:p-8">
    <section class="w-full max-w-xl rounded-3xl border border-[#d9dfd8] bg-[#f7f9f6]/95 backdrop-blur-sm shadow-[0_24px_70px_-36px_rgba(30,54,45,0.55)]">
      <div class="p-7 md:p-9 border-b border-[#dfe5de]">
        <p class="text-[#2f6b67] font-semibold tracking-wide">ETHOS</p>
        <h1 class="mt-3 text-3xl md:text-4xl font-semibold text-[#1f2724] leading-tight">
          {{ isCreateMode ? 'Create Your Account' : 'Access Device Manager' }}
        </h1>
        <p class="mt-3 text-sm text-[#5f6964]">
          {{
            isCreateMode
              ? 'Create a secure account to continue to your overview dashboard.'
              : 'Sign in to continue to your secure overview dashboard.'
          }}
        </p>
      </div>

      <form class="p-7 md:p-9 space-y-5" @submit.prevent="submitLogin">
        <label class="block space-y-2">
          <span class="text-xs uppercase tracking-[0.14em] text-[#7b8580]">Email</span>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@ethos.local"
            class="w-full rounded-xl border border-[#d5ddd7] bg-white px-4 py-3 text-sm text-[#27302c] placeholder:text-[#9ca49f] focus:outline-none focus:ring-2 focus:ring-[#6f9f98]/40"
          />
        </label>

        <label class="block space-y-2">
          <span class="text-xs uppercase tracking-[0.14em] text-[#7b8580]">Password</span>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            class="w-full rounded-xl border border-[#d5ddd7] bg-white px-4 py-3 text-sm text-[#27302c] placeholder:text-[#9ca49f] focus:outline-none focus:ring-2 focus:ring-[#6f9f98]/40"
          />
        </label>

        <label v-if="isCreateMode" class="block space-y-2">
          <span class="text-xs uppercase tracking-[0.14em] text-[#7b8580]">Confirm Password</span>
          <input
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Confirm your password"
            class="w-full rounded-xl border border-[#d5ddd7] bg-white px-4 py-3 text-sm text-[#27302c] placeholder:text-[#9ca49f] focus:outline-none focus:ring-2 focus:ring-[#6f9f98]/40"
          />
        </label>

        <p v-if="error" class="rounded-xl border border-[#edc8c2] bg-[#faeeeb] px-4 py-3 text-sm text-[#9f4d42]">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-[#4f7d77] text-white font-medium py-3.5 transition shadow-sm hover:bg-[#466f6a] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Please wait...' : isCreateMode ? 'Create Account' : 'Sign In' }}
        </button>

        <p class="text-xs text-[#7a8480] text-center">
          <button
            type="button"
            class="font-semibold text-[#2f6b67] hover:underline"
            @click="toggleMode"
          >
            {{ isCreateMode ? 'Already have an account? Sign in' : 'Need an account? Create one' }}
          </button>
        </p>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  loading: boolean;
  error: string;
}>();

const emit = defineEmits<{
  login: [credentials: { email: string; password: string }];
  register: [credentials: { email: string; password: string; confirmPassword: string }];
}>();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isCreateMode = ref(false);

const submitLogin = () => {
  if (isCreateMode.value) {
    emit('register', {
      email: email.value.trim(),
      password: password.value,
      confirmPassword: confirmPassword.value,
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
