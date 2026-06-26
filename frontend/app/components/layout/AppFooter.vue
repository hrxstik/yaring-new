<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__grid">
        <div class="footer__brand">
          <NuxtLink to="/" class="footer__logo">
            <span class="footer__logo-mark"><Trees :size="18" /></span>
            <span>Яринг</span>
          </NuxtLink>
          <p class="footer__desc">
            Экологичный загородный отдых в лесу у озера — домики, баня и беседки.
          </p>
          <div class="footer__social">
            <a href="https://vk.com/yaring_base" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте">
              <MessageCircle :size="18" />
            </a>
            <a href="https://t.me/yaring_base" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <Send :size="18" />
            </a>
          </div>
        </div>

        <nav class="footer__col">
          <h4>Навигация</h4>
          <NuxtLink to="/">Главная</NuxtLink>
          <NuxtLink to="/booking">Бронирование</NuxtLink>
        </nav>

        <nav class="footer__col">
          <h4>Информация</h4>
          <NuxtLink to="/rules">Правила проживания</NuxtLink>
          <NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink>
          <NuxtLink to="/contacts">Контакты</NuxtLink>
        </nav>

        <div class="footer__col footer__contacts">
          <h4>Контакты</h4>
          <a href="tel:+78001234567" class="footer__contact">
            <Phone :size="16" />+7 800 123-45-67
          </a>
          <span class="footer__contact footer__contact--muted">
            <MapPin :size="16" />Ленинградская обл., оз. Яринг
          </span>
        </div>
      </div>

      <p class="footer__copy">© {{ year }} База отдыха «Яринг»</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Trees, Phone, MapPin, Send, MessageCircle } from 'lucide-vue-next';

const year = new Date().getFullYear();
</script>

<style scoped lang="scss">
.footer {
  margin-top: auto;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);

  &__inner {
    @include container;
    padding-block: $space-7;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: $space-6;

    @include sm {
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
      gap: $space-5;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    gap: $space-2 + 1px;
    font-weight: 800;
    font-size: var(--font-lg);
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      text-decoration: none;
    }
  }

  &__logo-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: var(--color-primary);
    color: var(--color-primary-contrast);
  }

  &__desc {
    margin: 0;
    font-size: $font-size-sm;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  &__social {
    display: flex;
    gap: $space-2;

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition:
        color $transition,
        border-color $transition;

      &:hover {
        color: var(--color-primary);
        border-color: var(--color-primary);
      }
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    h4 {
      margin: 0 0 $space-1;
      font-size: $font-size-sm;
      font-weight: 700;
      color: var(--color-text);
    }

    a {
      font-size: $font-size-sm;
      color: var(--color-text-secondary);
      text-decoration: none;

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  &__contact {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-base;
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;

    svg {
      color: var(--color-primary);
      flex: none;
    }

    &--muted {
      font-size: $font-size-sm;
      font-weight: 400;
      color: var(--color-text-secondary);
    }
  }

  &__copy {
    margin: $space-6 0 0;
    padding-top: $space-4;
    border-top: 1px solid var(--color-border);
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }
}
</style>
