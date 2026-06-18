<template>
  <section class="hero">
    <div class="hero__container">
      <div class="hero__layout">
        <div class="hero__copy">
          <div class="hero__content">
            <h1 class="hero__title">База отдыха «Яринг»</h1>
            <p class="hero__subtitle">
              Отдыхайте на природе в окружении леса и живописного озера вдали от городской суеты
            </p>
            <div class="hero__actions">
              <AppButton @click="navigateTo('/booking')">Забронировать</AppButton>
              <AppButton variant="secondary" @click="navigateTo('/booking')">
                Смотреть объекты
              </AppButton>
            </div>
          </div>

        </div>

        <div class="hero__media" aria-hidden="true" />
      </div>
    </div>
  </section>

  <section class="section-block section-block--alt features">
    <div class="page-content">
      <h2 class="section-block__title">Почему выбирают Яринг</h2>
      <div class="features__stats" aria-label="Ключевые преимущества">
        <article v-for="stat in stats" :key="stat.label" class="features__stat">
          <span class="features__stat-icon">
            <component :is="stat.icon" :size="34" :stroke-width="1.75" />
          </span>
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </article>
      </div>
      <div class="features__grid">
        <article v-for="item in features" :key="item.title" class="features__item">
          <div class="features__icon-wrap">
            <component :is="item.icon" :size="26" />
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section-block entities-preview">
    <div class="page-content">
      <h2 class="section-block__title">Объекты для бронирования</h2>

      <EntityCardSkeleton v-if="entitiesLoading" :count="3" />

      <div v-else class="entities-preview__grid">
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
import { CalendarCheck, House, Shield, Leaf, Map, Trees, Users } from 'lucide-vue-next';
import type { BookableEntity } from '~/types';

useHead({ title: 'База отдыха «Яринг»' });

const { request } = useApi();
const entities = ref<BookableEntity[]>([]);
const entitiesLoading = ref(true);

const stats = [
  { icon: House, value: '3+', label: 'объектов для комфортного отдыха' },
  { icon: CalendarCheck, value: '24/7', label: 'онлайн-бронирование без выходных' },
  { icon: Map, value: '15 га', label: 'благоустроенной территории' },
];

const features = [
  { icon: Trees, title: 'Природа рядом', text: 'Лес, озеро и чистый воздух круглый год' },
  {
    icon: Shield,
    title: 'Комфорт и уют',
    text: 'Продуманные условия для отдыха и релаксации',
  },
  {
    icon: Leaf,
    title: 'Чистая территория',
    text: 'Ухоженная территория и экологичный подход',
  },
  {
    icon: Users,
    title: 'Для компаний и семей',
    text: 'Идеально для отдыха с семьей и друзьями',
  },
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
  navigateTo({
    path: '/booking',
    query: { entity: entity.slug },
  });
}
</script>

<style scoped lang="scss">
.hero {
  min-height: 460px;
  background: var(--color-bg);

  @include md {
    min-height: 520px;
  }

  &__container {
    @include container;
    position: relative;
    min-height: inherit;
    padding-block: var(--space-section);
  }

  &__layout {
    position: relative;
    min-height: inherit;
    display: grid;
    align-items: center;
    overflow: hidden;
    border-radius: var(--radius-xl);

    @include md {
      grid-template-columns: minmax(0, 0.95fr) minmax(420px, 1.05fr);
    }
  }

  &__copy {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $space-6;
    padding: $space-8 0;

    @include md {
      min-height: 440px;
      padding: $space-8 0 $space-8 $space-2;
    }
  }

  &__media {
    display: none;

    @include md {
      position: relative;
      display: block;
      align-self: stretch;
      min-height: 440px;
      background-image: var(--hero-image);
      background-size: cover;
      background-position: center right;
      border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
    }

    &::before {
      @include md {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: 48%;
        background: linear-gradient(
          90deg,
          var(--color-bg) 0%,
          rgba(244, 247, 245, 0.94) 28%,
          rgba(244, 247, 245, 0.62) 58%,
          rgba(244, 247, 245, 0) 100%
        );

        [data-theme='dark'] & {
          background: linear-gradient(
            90deg,
            var(--color-bg) 0%,
            rgba(15, 22, 18, 0.94) 28%,
            rgba(15, 22, 18, 0.62) 58%,
            rgba(15, 22, 18, 0) 100%
          );
        }
      }
    }
  }

  &__content {
    max-width: 560px;
  }

  &__title {
    font-size: var(--font-hero);
    line-height: 1.05;
    color: var(--color-text);
    margin-bottom: $space-4;
    font-weight: 800;
  }

  &__subtitle {
    font-size: var(--font-lg);
    color: var(--color-text-secondary);
    margin-bottom: $space-5;
    line-height: 1.6;
    max-width: 500px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
  }

}

.section-block--alt {
  background: var(--color-section-alt);
}

.features {
  &__stats {
    display: grid;
    gap: $space-4;
    margin: 0 auto $space-8;
    max-width: 1040px;

    @include sm {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__stat {
    min-height: 184px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-3;
    padding: $space-6 $space-5;
    text-align: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-card);

    strong {
      display: block;
      font-size: clamp(28px, 3.2vw, 42px);
      line-height: 1;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--color-text);
    }

    span:not(.features__stat-icon) {
      max-width: 220px;
      font-size: var(--font-base);
      line-height: 1.45;
      color: var(--color-text-secondary);
    }
  }

  &__stat-icon {
    width: 72px;
    height: 72px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    background:
      linear-gradient(145deg, rgba(106, 171, 122, 0.2), rgba(61, 107, 79, 0.08)),
      var(--color-surface-elevated);
    border: 1px solid rgba(61, 107, 79, 0.16);
    border-radius: 24px;
  }

  &__grid {
    display: grid;
    gap: $space-4;

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include md {
      grid-template-columns: repeat(4, 1fr);
      gap: $space-5;
    }
  }

  &__item {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: $space-6 $space-5;
    text-align: center;

    h3 {
      font-size: var(--font-base);
      font-weight: 700;
      margin-bottom: $space-2;
      color: var(--color-text);
    }

    p {
      font-size: var(--font-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.55;
    }
  }

  &__icon-wrap {
    width: 48px;
    height: 48px;
    margin: 0 auto $space-4;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: rgba(61, 107, 79, 0.1);
    color: var(--color-primary);
  }
}

.entities-preview {
  &__grid {
    display: grid;
    gap: $space-5;
    max-width: 1120px;
    margin: 0 auto;

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include md {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}
</style>
