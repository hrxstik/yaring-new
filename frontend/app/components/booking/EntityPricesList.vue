<template>
  <section v-if="entities.length" class="entity-prices">
    <h2>Актуальные тарифы</h2>
    <div class="entity-prices__grid">
      <article v-for="entity in entities" :key="entity.id" class="entity-prices__item">
        <h3>{{ entity.name }}</h3>
        <p class="entity-prices__type">
          {{ entity.bookingType === 'daily' ? 'Посуточно' : 'Почасово' }}
        </p>
        <p class="entity-prices__price">{{ priceLabel(entity) }}</p>
        <NuxtLink to="/booking">
          <AppButton size="sm" variant="secondary">Забронировать</AppButton>
        </NuxtLink>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BookableEntity } from '~/types';

const { request } = useApi();
const entities = ref<BookableEntity[]>([]);

onMounted(async () => {
  try {
    entities.value = await request<BookableEntity[]>('/entities');
  } catch {
    entities.value = [];
  }
});

function priceLabel(entity: BookableEntity) {
  if (entity.bookingType === 'hourly') {
    return `${entity.pricePerHour?.toLocaleString('ru-RU')} ₽ / час`;
  }
  return `${entity.pricePerDay.toLocaleString('ru-RU')} ₽ / сутки`;
}
</script>

<style scoped lang="scss">
.entity-prices {
  margin-top: $space-8;

  &__grid {
    display: grid;
    gap: $space-4;
    margin-top: $space-5;

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include lg {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__item {
    @include card;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__type {
    font-size: $font-size-xs;
    color: var(--color-primary);
    margin: 0;
  }

  &__price {
    font-size: $font-size-lg;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 $space-3;
  }
}
</style>
