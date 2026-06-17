<template>
  <div class="page-content contacts-page">
    <ContentPageView slug="contacts" />

    <section class="contacts-page__map">
      <h2>Как нас найти</h2>
      <YandexMap height="360px" />
      <p class="contacts-page__hint">
        Метка стоит на точных координатах базы. Маршрут можно построить прямо на карте.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Контакты — Яринг' });
</script>

<style scoped lang="scss">
.contacts-page {
  &__map {
    margin-top: var(--space-section);

    h2 {
      @include section-title;
      text-align: left;
      margin-bottom: $space-5;
    }
  }

  &__hint {
    margin-top: $space-4;
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }
}
</style>
