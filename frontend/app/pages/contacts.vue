<template>
  <div class="page-content contacts">
    <Breadcrumb current="Контакты" />
    <h1 class="contacts__title">Контакты</h1>

    <div class="contacts__layout">
      <YandexMap height="320px" />

      <div class="contacts__info">
        <div class="contacts__row">
          <span class="contacts__icon"><Phone :size="18" /></span>
          <div class="contacts__field">
            <span class="contacts__label">Телефон</span>
            <a href="tel:+78001234567" class="contacts__value">+7 800 123-45-67</a>
          </div>
        </div>
        <div class="contacts__row">
          <span class="contacts__icon"><MapPin :size="18" /></span>
          <div class="contacts__field">
            <span class="contacts__label">Адрес</span>
            <span class="contacts__value">Ленинградская обл., оз. Яринг</span>
          </div>
        </div>
        <div class="contacts__row">
          <span class="contacts__icon"><Clock :size="18" /></span>
          <div class="contacts__field">
            <span class="contacts__label">Часы заезда</span>
            <span class="contacts__value">Заезд 14:00 · выезд 12:00</span>
          </div>
        </div>
      </div>
    </div>

    <ContentPageView slug="contacts" class="contacts__cms" embedded />
  </div>
</template>

<script setup lang="ts">
import { Phone, MapPin, Clock } from 'lucide-vue-next';

useHead({ title: 'Контакты — Яринг' });
useSeoMeta({ description: 'Контакты базы отдыха Яринг — телефон, адрес и карта проезда.' });
</script>

<style scoped lang="scss">
.contacts {
  &__title {
    margin: 0 0 $space-5;
  }

  &__layout {
    display: grid;
    gap: $space-4;

    @include md {
      grid-template-columns: 1.3fr 1fr;
      gap: $space-6;
      align-items: start;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__row {
    display: flex;
    align-items: flex-start;
    gap: $space-3;

    @include md {
      padding: $space-4;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex: none;
    border-radius: 11px;
    background: var(--color-primary-tint);
    color: var(--color-primary);
  }

  &__field {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }

  &__value {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;
  }

  &__cms {
    display: block;
    margin-top: var(--space-section);
  }
}
</style>
