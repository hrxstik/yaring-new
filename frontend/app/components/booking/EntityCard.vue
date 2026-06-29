<template>
  <article class="entity-card">
    <div class="entity-card__image">
      <img
        v-if="imageSrc && !broken"
        :src="imageSrc"
        :alt="entity.name"
        loading="lazy"
        @error="broken = true"
      />
      <div v-else class="entity-card__placeholder">
        <span class="entity-card__placeholder-label">фото · {{ entity.name }}</span>
      </div>
    </div>
    <div class="entity-card__body">
      <h3 class="entity-card__title">{{ entity.name }}</h3>
      <ul v-if="entity.amenities.length" class="entity-card__amenities">
        <li v-for="item in entity.amenities" :key="item">
          <component :is="amenityIcon(item)" :size="15" />
          {{ item }}
        </li>
      </ul>
      <p class="entity-card__price">
        <span class="entity-card__amount">{{ priceAmount }}</span>
        <span class="entity-card__unit">{{ priceUnit }}</span>
      </p>
      <AppButton block @click="$emit('book', entity)">Забронировать</AppButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  BedDouble,
  Car,
  DoorOpen,
  Flame,
  Lamp,
  ShowerHead,
  TreePine,
  Users,
  Utensils,
  Wifi,
} from 'lucide-vue-next';
import type { BookableEntity } from '~/types';

const props = defineProps<{ entity: BookableEntity }>();
defineEmits<{ book: [entity: BookableEntity] }>();

const placeholders: Record<string, string> = {
  'domik-u-ozera': '/entity-cottage.png',
  banya: '/entity-sauna.png',
  besedka: '/entity-gazebo.png',
};

const broken = ref(false);

const imageSrc = computed(() => {
  const url = props.entity.imageUrl;
  if (url && (url.startsWith('http') || url.startsWith('/'))) return url;
  return placeholders[props.entity.slug] ?? null;
});

// Reset the broken flag if the entity (and thus its image) changes.
watch(imageSrc, () => { broken.value = false; });

const priceAmount = computed(() => {
  const value =
    props.entity.bookingType === 'hourly'
      ? props.entity.pricePerHour ?? 0
      : props.entity.pricePerDay;
  return `${value.toLocaleString('ru-RU')} ₽`;
});

const priceUnit = computed(() =>
  props.entity.bookingType === 'hourly' ? '/ час' : '/ сутки',
);

function amenityIcon(item: string) {
  const value = item.toLowerCase();
  if (value.includes('гост')) return Users;
  if (value.includes('спаль')) return BedDouble;
  if (value.includes('кух')) return Utensils;
  if (value.includes('wi-fi') || value.includes('wifi')) return Wifi;
  if (value.includes('парков')) return Car;
  if (value.includes('мангал')) return Flame;
  if (value.includes('душ')) return ShowerHead;
  if (value.includes('освещ')) return Lamp;
  if (value.includes('террас') || value.includes('вид') || value.includes('озер')) return TreePine;
  return DoorOpen;
}
</script>

<style scoped lang="scss">
.entity-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition:
    transform $transition,
    box-shadow $transition;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-elevated);
  }

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
    @include photo-placeholder;
    height: 100%;
  }

  &__placeholder-label {
    font-family: monospace;
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    background: var(--color-surface);
    padding: $space-1 $space-3;
    border-radius: $radius-full;
  }

  &__body {
    padding: $space-4 + 2px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: $space-3;
  }

  &__title {
    font-size: var(--font-xl);
    font-weight: 700;
    margin: 0;
  }

  &__amenities {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $space-2 - 1px;
    flex: 1;

    li {
      display: flex;
      align-items: center;
      gap: $space-2;
      font-size: var(--font-sm);
      color: var(--color-text-secondary);

      svg {
        color: var(--color-primary);
        flex-shrink: 0;
      }
    }
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: $space-1;
    margin: 0;
  }

  &__amount {
    font-size: var(--font-xl);
    font-weight: 800;
    color: var(--color-primary);
  }

  &__unit {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }
}
</style>
