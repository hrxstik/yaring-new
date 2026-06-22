<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__grid">
        <div class="footer__col footer__brand">
          <NuxtLink to="/" class="footer__logo">
            <Trees :size="24" />
            <span>Яринг</span>
          </NuxtLink>
          <p class="footer__desc">
            База отдыха в лесу у озера. Уютные домики, баня и беседки для семейного
            и корпоративного отдыха.
          </p>
          <div class="footer__social">
            <a
              href="https://vk.com/yaring_base"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ВКонтакте"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M13.19 17.25c-5.47 0-8.59-3.75-8.72-9.99h2.74c.09 4.58 2.11 6.52 3.71 6.92V7.26h2.58v3.95c1.58-.17 3.24-1.97 3.8-3.95h2.58c-.43 2.44-2.23 4.24-3.51 4.98 1.28.6 3.33 2.17 4.11 5.01h-2.84c-.61-1.9-2.13-3.37-4.14-3.57v3.57h-.31Z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a
              href="https://t.me/yaring_base"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <Send :size="18" />
            </a>
          </div>
        </div>

        <div class="footer__col">
          <h4>Навигация</h4>
          <nav class="footer__links">
            <NuxtLink to="/">Главная</NuxtLink>
            <NuxtLink to="/booking">Бронирование</NuxtLink>
          </nav>
        </div>

        <div class="footer__col">
          <h4>Информация</h4>
          <nav class="footer__links">
            <NuxtLink to="/rules">Правила проживания</NuxtLink>
            <NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink>
            <NuxtLink to="/contacts">Контакты</NuxtLink>
          </nav>
        </div>

        <div class="footer__col">
          <h4>Контакты</h4>
          <ul class="footer__contacts">
            <li>
              <Phone :size="16" />
              <a href="tel:+79000000000">+7 (900) 000-00-00</a>
            </li>
            <li>
              <MapPin :size="16" />
              <NuxtLink to="/contacts">Яринг, координаты на карте</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="footer__col footer__map">
          <YandexMap height="180px" />
        </div>
      </div>

      <p class="footer__copy">© {{ year }} Яринг. Все права защищены.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Trees, Phone, MapPin, Send } from 'lucide-vue-next';

const year = new Date().getFullYear();
</script>

<style scoped lang="scss">
.footer {
  margin-top: auto;
  background: var(--color-surface-elevated);
  border-top: 1px solid var(--color-border);
  padding: var(--space-section) 0 $space-6;

  &__inner {
    @include container;
  }

  &__grid {
    display: grid;
    gap: $space-6;

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include md {
      grid-template-columns: 1.4fr 1fr 1fr 1.2fr 1fr;
      gap: $space-5;
    }
  }

  &__col {
    h4 {
      font-size: var(--font-sm);
      font-weight: 700;
      margin-bottom: $space-4;
      color: var(--color-text);
    }
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    font-size: var(--font-lg);
    font-weight: 800;
    color: var(--color-primary);
    text-decoration: none;
    margin-bottom: $space-3;

    &:hover {
      text-decoration: none;
    }
  }

  &__desc {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.55;
    margin-bottom: $space-4;
  }

  &__social {
    display: flex;
    gap: $space-3;

    a {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      font-size: var(--font-xs);
      font-weight: 700;
      color: var(--color-text-secondary);
      text-decoration: none;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        color: var(--color-primary);
        border-color: var(--color-primary);
        text-decoration: none;
      }
    }
  }

  &__links {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    a {
      font-size: var(--font-sm);
      color: var(--color-text-secondary);
      text-decoration: none;

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  &__contacts {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $space-3;

    li {
      display: flex;
      align-items: center;
      gap: $space-2;
      font-size: var(--font-sm);
      color: var(--color-text-secondary);
    }
  }

  &__map-placeholder {
    aspect-ratio: 4 / 3;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    color: var(--color-text-muted);
    font-size: var(--font-sm);
  }

  &__copy {
    margin: $space-8 0 0;
    padding-top: $space-5;
    border-top: 1px solid var(--color-border);
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    text-align: center;

    @include md {
      text-align: left;
    }
  }
}
</style>
