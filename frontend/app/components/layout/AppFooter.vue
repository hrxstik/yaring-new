<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <Trees :size="24" />
        <span>Яринг — база отдыха</span>
      </div>
      <nav class="footer__nav">
        <NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink>
        <NuxtLink to="/rules">Правила проживания</NuxtLink>
        <NuxtLink to="/contacts">Контакты</NuxtLink>
      </nav>
      <p class="footer__copy">© {{ year }} Яринг. Все права защищены.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Trees } from 'lucide-vue-next';

const year = new Date().getFullYear();
</script>

<style scoped lang="scss">
.footer {
  margin-top: auto;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: $space-8 0;

  &__inner {
    @include container;
    display: flex;
    flex-direction: column;
    gap: $space-5;

    @include md {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: $space-2;
    color: var(--color-primary);
    font-weight: 500;
  }

  &__nav {
    display: flex;
    flex-wrap: wrap;
    gap: $space-4;

    a {
      font-size: $font-size-sm;
      color: var(--color-text-secondary);
      text-decoration: none;

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  &__copy {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    margin: 0;
    width: 100%;

    @include md {
      width: auto;
      text-align: right;
    }
  }
}
</style>
