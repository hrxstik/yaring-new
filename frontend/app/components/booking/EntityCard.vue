<template>
  <article class="entity-card">
    <div class="entity-card__image">
      <img v-if="entity.imageUrl" :src="entity.imageUrl" :alt="entity.name" />
      <div v-else class="entity-card__placeholder">
        <Home :size="48" />
      </div>
    </div>
    <div class="entity-card__body">
      <div class="entity-card__meta">
        <span class="entity-card__type">
          {{ entity.bookingType === 'daily' ? 'Посуточно' : 'Почасово' }}
        </span>
        <span class="entity-card__capacity">
          <Users :size="14" /> до {{ entity.capacity }}
        </span>
      </div>
      <h3 class="entity-card__title">{{ entity.name }}</h3>
      <p class="entity-card__desc">{{ entity.description }}</p>
      <ul v-if="entity.amenities.length" class="entity-card__amenities">
        <li v-for="item in entity.amenities.slice(0, 4)" :key="item">{{ item }}</li>
      </ul>
      <div class="entity-card__footer">
        <span class="entity-card__price">{{ priceLabel }}</span>
        <AppButton size="sm" @click="$emit('book', entity)">Забронировать</AppButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Home, Users } from 'lucide-vue-next';
import type { BookableEntity } from '~/types';

const props = defineProps<{ entity: BookableEntity }>();
defineEmits<{ book: [entity: BookableEntity] }>();

const priceLabel = computed(() => {
  if (props.entity.bookingType === 'hourly') {
    return `от ${props.entity.pricePerHour?.toLocaleString('ru-RU')} ₽/ч`;
  }
  return `от ${props.entity.pricePerDay.toLocaleString('ru-RU')} ₽/сут`;
});
</script>

<style scoped lang="scss">
.entity-card {
  @include card;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;

  &__image {
    aspect-ratio: 16 / 10;
    background: var(--color-surface-elevated);
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
  }

  &__body {
    padding: $space-5;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__meta {
    display: flex;
    gap: $space-3;
    margin-bottom: $space-2;
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }

  &__type {
    color: var(--color-primary);
    font-weight: 500;
  }

  &__capacity {
    display: flex;
    align-items: center;
    gap: $space-1;
  }

  &__title {
    margin-bottom: $space-2;
  }

  &__desc {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__amenities {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    list-style: none;
    padding: 0;
    margin: $space-4 0;

    li {
      font-size: $font-size-xs;
      padding: $space-1 $space-2;
      background: var(--color-surface-elevated);
      border-radius: $radius-full;
      color: var(--color-text-secondary);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    margin-top: auto;
  }

  &__price {
    font-weight: 600;
    color: var(--color-primary);
  }
}
</style>
