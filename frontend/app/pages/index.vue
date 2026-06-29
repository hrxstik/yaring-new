<template>
  <section class="hero">
    <div class="hero__inner">
      <div class="hero__media" aria-hidden="true" />
      <div class="hero__copy">
        <h1 class="hero__title">База отдыха «Яринг»</h1>
        <p class="hero__subtitle">
          Отдыхайте на природе в окружении леса и живописного озера вдали от городской суеты.
        </p>
        <div class="hero__actions">
          <AppButton size="lg" block @click="navigateTo('/booking')">Забронировать</AppButton>
          <AppButton variant="secondary" size="lg" block @click="navigateTo('/booking')">
            Смотреть объекты
          </AppButton>
        </div>
      </div>
    </div>
  </section>

  <section class="stats">
    <div class="stats__inner">
      <div v-for="stat in stats" :key="stat.label" class="stats__item">
        <span class="stats__icon"><component :is="stat.icon" :size="28" /></span>
        <div class="stats__text">
          <span class="stats__value">{{ stat.value }}</span>
          <span class="stats__label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="advantages">
    <div class="page-content">
      <h2 class="advantages__title">Почему «Яринг»</h2>
      <div class="advantages__grid">
        <article v-for="item in features" :key="item.title" class="advantages__card">
          <span class="advantages__icon"><component :is="item.icon" :size="24" /></span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="entities">
    <div class="page-content">
      <h2 class="entities__title">Объекты для отдыха</h2>
      <EntityCardSkeleton v-if="entitiesLoading" :count="3" />
      <div v-else class="entities__grid">
        <EntityCard
          v-for="entity in featuredEntities"
          :key="entity.id"
          :entity="entity"
          @book="goBooking"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CalendarCheck, House, Shield, Leaf, Map as MapIcon, Trees, Users } from 'lucide-vue-next';
import type { BookableEntity } from '~/types';

useHead({ title: 'База отдыха «Яринг»' });
useSeoMeta({
  description: 'База отдыха Яринг — уютные домики, баня и беседки у озера и леса. Онлайн-бронирование 24/7.',
  ogTitle: 'База отдыха «Яринг»',
  ogDescription: 'Домики, баня и беседки у озера. Бронируйте онлайн без выходных.',
  ogType: 'website',
});

const { request } = useApi();
const entities = ref<BookableEntity[]>([]);
const entitiesLoading = ref(true);

const stats = [
  { icon: House, value: '3+', label: 'объектов для отдыха' },
  { icon: CalendarCheck, value: '24/7', label: 'онлайн-бронирование' },
  { icon: MapIcon, value: '15 га', label: 'благоустроенной территории' },
];

const features = [
  { icon: Trees, title: 'Природа рядом', text: 'Лес, озеро и чистый воздух круглый год' },
  { icon: Shield, title: 'Комфорт и уют', text: 'Продуманные условия для отдыха и релаксации' },
  { icon: Leaf, title: 'Чистая территория', text: 'Ухоженная территория и экологичный подход' },
  { icon: Users, title: 'Для компаний и семей', text: 'Идеально для отдыха с семьёй и друзьями' },
];

const fallbackEntities: BookableEntity[] = [
  {
    id: 'fallback-cottage',
    name: 'Коттедж «Лесной»',
    slug: 'domik-u-ozera',
    description: 'Просторный деревянный коттедж у леса для семейного отдыха.',
    bookingType: 'daily',
    pricePerDay: 9000,
    capacity: 6,
    amenities: ['6 гостей', '3 спальни', 'Кухня, гостиная, терраса'],
    isActive: true,
  },
  {
    id: 'fallback-sauna',
    name: 'Баня на дровах',
    slug: 'banya',
    description: 'Тёплая баня с парной и комнатой отдыха.',
    bookingType: 'hourly',
    pricePerDay: 0,
    pricePerHour: 2000,
    capacity: 6,
    amenities: ['6 гостей', 'Парная, комната отдыха', 'Душевая, терраса'],
    isActive: true,
  },
  {
    id: 'fallback-gazebo',
    name: 'Беседка у озера',
    slug: 'besedka',
    description: 'Беседка у воды для компании и отдыха с мангалом.',
    bookingType: 'hourly',
    pricePerDay: 0,
    pricePerHour: 833,
    capacity: 10,
    amenities: ['10 гостей', 'Мангал, стол, освещение', 'Вид на озеро'],
    isActive: true,
  },
];

const featuredEntities = computed(() => {
  const source = entities.value.length ? entities.value : fallbackEntities;
  const bySlug = new Map(source.map((entity) => [entity.slug, entity]));

  return fallbackEntities.map((fallback) => {
    const fromApi = bySlug.get(fallback.slug);
    return fromApi ? { ...fromApi } : { ...fallback };
  });
});

onMounted(loadEntities);

async function loadEntities() {
  entitiesLoading.value = true;
  try {
    entities.value = await request<BookableEntity[]>('/entities');
  } catch {
    entities.value = fallbackEntities;
  } finally {
    entitiesLoading.value = false;
  }
}

function goBooking(entity: BookableEntity) {
  navigateTo({ path: '/booking', query: { entity: entity.slug } });
}
</script>

<style scoped lang="scss">
.hero {
  &__inner {
    @include container;
    display: grid;
    gap: $space-5;
    padding-block: $space-6;
    align-items: center;

    @include sm {
      grid-template-columns: 1fr 1fr;
      gap: $space-7;
      padding-block: $space-8;
    }

    @include md {
      gap: $space-9;
      padding-block: $space-10;
    }
  }

  &__media {
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-lg);
    background-image: var(--hero-image);
    background-size: cover;
    background-position: center;

    @include sm {
      order: 2;
      aspect-ratio: 4 / 3;
      border-radius: var(--radius-xl);
    }
  }

  &__copy {
    display: flex;
    flex-direction: column;
    gap: $space-4;

    @include sm {
      order: 1;
      gap: $space-5;
    }
  }

  &__title {
    margin: 0;
    font-size: var(--font-hero);
    line-height: 1.05;
    letter-spacing: -0.025em;
  }

  &__subtitle {
    margin: 0;
    font-size: var(--font-lg);
    line-height: 1.55;
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $space-3;

    @include md {
      flex-direction: row;

      :deep(.btn) {
        width: auto;
      }
    }
  }
}

.stats {
  background: var(--color-primary);
  color: var(--color-primary-contrast);

  &__inner {
    @include container;
    display: flex;
    flex-direction: column;
    gap: $space-5;
    padding-block: $space-6;

    @include sm {
      flex-direction: row;
      padding-block: $space-8;
      gap: $space-6;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-4;

    @include sm {
      flex: 1;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    flex: none;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.14);
  }

  &__text {
    display: flex;
    flex-direction: column;
  }

  &__value {
    font-size: var(--font-3xl);
    font-weight: 800;
    line-height: 1;
  }

  &__label {
    font-size: $font-size-sm;
    opacity: 0.85;
  }
}

.advantages {
  &__title {
    margin: 0 0 $space-5;
    text-align: center;
    font-size: var(--font-2xl);
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-4;

    @include md {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: $space-5;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);

    h3 {
      margin: 0;
      font-size: var(--font-base);
      font-weight: 700;
    }

    p {
      margin: 0;
      font-size: $font-size-sm;
      line-height: 1.45;
      color: var(--color-text-secondary);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 13px;
    background: var(--color-primary-tint);
    color: var(--color-primary);
  }
}

.entities {
  padding-bottom: $space-8;

  &__title {
    margin: 0 0 $space-5;
    font-size: var(--font-2xl);
  }

  &__grid {
    display: grid;
    gap: $space-5;

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include md {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}
</style>
