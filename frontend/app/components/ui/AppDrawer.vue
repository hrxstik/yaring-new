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
        <span class="drawer__grabber" aria-hidden="true" />
        <header v-if="title || showBack" class="drawer__header">
          <button
            v-if="showBack"
            type="button"
            class="drawer__icon-btn"
            aria-label="Назад"
            @click="$emit('back')"
          >
            <ArrowLeft :size="18" />
          </button>
          <button
            v-else
            type="button"
            class="drawer__icon-btn drawer__icon-btn--close"
            aria-label="Закрыть"
            @click="$emit('close')"
          >
            <X :size="17" />
          </button>
          <h2 class="drawer__title">{{ title }}</h2>
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
import { ArrowLeft, X } from 'lucide-vue-next';

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
    animation: yar-fadein 0.25s ease-out;
  }

  &__panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 85%;
    background: var(--color-surface);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.22);
    display: flex;
    flex-direction: column;
    animation: yar-slideup 0.25s ease-out;

    @include md {
      left: auto;
      top: 0;
      height: 100%;
      max-height: none;
      width: min(100%, 400px);
      border-radius: var(--radius-xl) 0 0 var(--radius-xl);
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
      animation: yar-slidein-right 0.25s ease-out;
    }

    &--wide {
      @include md {
        width: min(100%, 460px);
      }
    }
  }

  &__grabber {
    flex: none;
    width: 40px;
    height: 4px;
    margin: $space-1 + 2px auto 0;
    border-radius: $radius-full;
    background: var(--color-border);

    @include md {
      display: none;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3 + 2px $space-4 + 2px;
    border-bottom: 1px solid var(--color-border);
  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex: none;
    border: none;
    border-radius: $radius-full;
    background: var(--color-surface-elevated);
    color: var(--color-text);
    cursor: pointer;

    &--close {
      display: none;

      @include md {
        display: flex;
      }
    }

    &:hover {
      color: var(--color-primary);
    }
  }

  &__title {
    flex: 1;
    margin: 0;
    font-size: var(--font-lg);
    font-weight: 700;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: $space-4 + 2px;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__footer {
    flex: none;
    display: flex;
    gap: $space-3;
    padding: $space-4 $space-4 + 2px;
    border-top: 1px solid var(--color-border);
  }
}
</style>
