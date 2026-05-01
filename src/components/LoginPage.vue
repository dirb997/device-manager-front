<template>
  <div class="login-shell flex min-h-screen items-center justify-center p-4 md:p-8">
    <section class="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
      <div class="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div class="bg-slate-950 px-8 py-10 text-white md:px-10 md:py-12">
          <Badge variant="secondary">Device Manager</Badge>
          <h1 class="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            Keep devices visible, current, and easy to act on.
          </h1>
          <p class="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Log in to view live device status, trigger scans, add records manually, and disconnect devices when needed.
          </p>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-300">Live sync</p>
              <p class="mt-2 text-lg font-semibold">WebSocket updates</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-300">Actions</p>
              <p class="mt-2 text-lg font-semibold">Scan & connect</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-300">Registry</p>
              <p class="mt-2 text-lg font-semibold">One simple list</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-8 md:px-10 md:py-12">
          <div class="max-w-md">
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ isCreateMode ? 'Create account' : 'Sign in' }}</p>
            <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {{ isCreateMode ? 'Start your workspace' : 'Welcome back' }}
            </h2>
            <p class="mt-3 text-sm leading-6 text-slate-500">
              {{ isCreateMode ? 'Create a secure account to manage the device registry.' : 'Use your existing account to continue.' }}
            </p>

            <form class="mt-8 space-y-5" @submit.prevent="submitLogin">
              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">Email</span>
                <Input v-model="email" type="email" placeholder="you@example.com" />
              </label>

              <label class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">Password</span>
                <Input v-model="password" type="password" placeholder="Enter your password" />
              </label>

              <label v-if="isCreateMode" class="block space-y-2">
                <span class="text-sm font-medium text-slate-700">Confirm password</span>
                <Input v-model="confirmPassword" type="password" placeholder="Repeat your password" />
              </label>

              <p v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {{ error }}
              </p>

              <Button type="submit" class="w-full" :disabled="loading">
                {{ loading ? 'Please wait...' : isCreateMode ? 'Create account' : 'Sign in' }}
              </Button>

              <Button type="button" variant="ghost" class="w-full" @click="toggleMode">
                {{ isCreateMode ? 'Already have an account? Sign in' : 'Need an account? Create one' }}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Badge from './ui/Badge.vue';
import Button from './ui/Button.vue';
import Input from './ui/Input.vue';

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
