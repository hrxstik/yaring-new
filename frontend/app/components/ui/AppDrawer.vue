<template>
  <Teleport to="body">
    <div v-if="open" class="drawer">
      <button type="button" class="drawer__overlay" aria-label="Закрыть" @click="$emit('close')" />
      <aside
        ref="panelRef"
        class="drawer__panel"
        :class="{ 'drawer__panel--wide': wide }"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="drawer__header">
          <button
            v-if="showBack"
            type="button"
            class="drawer__back"
            aria-label="Назад"
            @click="$emit('back')"
          >
            <ChevronLeft :size="24" />
          </button>
          <h2 class="drawer__title">{{ title }}</h2>
          <button type="button" class="drawer__close" aria-label="Закрыть" @click="$emit('close')">
            <X :size="28" />
          </button>
        </header>
        <div class="drawer__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="drawer__footer">
          <slot name="footer" />
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ChevronLeft, X } from 'lucide-vue-next';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const props = defineProps<{
  open: boolean;
  title: string;
  showBack?: boolean;
  wide?: boolean;
}>();

const emit = defineEmits<{ close: []; back: [] }>();

const panelRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close');
    return;
  }
  if (event.key !== 'Tab' || !panelRef.value) return;

  const focusable = Array.from(
    panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter((el) => !el.closest('[inert]'));

  if (!focusable.length) { event.preventDefault(); return; }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return;

    if (isOpen) {
      previouslyFocused = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeydown);
      nextTick(() => {
        const first = panelRef.value?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
      });
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
      previouslyFocused?.focus();
      previouslyFocused = null;
    }
  },
);

onUnmounted(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped lang="scss">
.drawer {
  position: fixed;
  inset: 0;
  z-index: 100;

  &__overlay {
    position: absolute;
    inset: 0;
    background: var(--color-overlay);
    border: none;
    cursor: pointer;
  }

  &__panel {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: min(100%, 420px);
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;

    &--wide {
      width: min(100%, 520px);
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-6 $space-5 $space-4;
  }

  &__title {
    flex: 1;
    font-size: $font-size-xl;
    margin: 0;
  }

  &__back,
  &__close {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: $space-1;
    display: flex;

    &:hover {
      color: var(--color-text);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 0 $space-5 $space-4;
  }

  &__footer {
    padding: $space-4 $space-5 $space-6;
    border-top: 1px solid var(--color-border);
  }
}
</style>
