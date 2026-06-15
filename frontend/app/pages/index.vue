<template>
  <section class="hero">
    <div class="hero__content">
      <h1>База отдыха «Яринг»</h1>
      <p class="hero__subtitle">
        Тишина леса, чистое озеро и уютные домики — идеальное место для отдыха на природе
      </p>
      <div class="hero__actions">
        <NuxtLink to="/booking">
          <AppButton>Забронировать</AppButton>
        </NuxtLink>
        <NuxtLink to="/prices">
          <AppButton variant="secondary">Смотреть цены</AppButton>
        </NuxtLink>
      </div>
    </div>
  </section>

  <section class="page-content features">
    <h2>Почему Яринг</h2>
    <div class="features__grid">
      <div v-for="item in features" :key="item.title" class="features__item">
        <component :is="item.icon" :size="32" class="features__icon" />
        <h3>{{ item.title }}</h3>
        <p>{{ item.text }}</p>
      </div>
    </div>
  </section>

  <section v-if="entities.length" class="page-content entities-preview">
    <h2>Объекты для бронирования</h2>
    <div class="entities-preview__grid">
      <EntityCard
        v-for="entity in entities.slice(0, 3)"
        :key="entity.id"
        :entity="entity"
        @book="goBooking"
      />
    </div>
    <div class="entities-preview__more">
      <NuxtLink to="/booking">
        <AppButton variant="secondary">Все объекты</AppButton>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Trees, Waves, Flame } from 'lucide-vue-next';
import type { BookableEntity } from '~/types';

const { request } = useApi();
const entities = ref<BookableEntity[]>([]);

const features = [
  {
    icon: Trees,
    title: 'Природа',
    text: 'Сосновый лес, озеро и прогулочные тропы прямо на территории',
  },
  {
    icon: Waves,
    title: 'Комфорт',
    text: 'Домики с кухней, баня и беседки для компании',
  },
  {
    icon: Flame,
    title: 'Активности',
    text: 'Рыбалка, мангал, баня — всё для полноценного отдыха',
  },
];

onMounted(async () => {
  try {
    entities.value = await request<BookableEntity[]>('/entities');
  } catch {
    entities.value = [];
  }
});

function goBooking() {
  navigateTo('/booking');
}
</script>

<style scoped lang="scss">
.hero {
  background: linear-gradient(
    135deg,
    var(--color-surface-elevated) 0%,
    var(--color-bg) 100%
  );
  padding: $space-10 $space-4;

  @include md {
    padding: $space-10 $space-6;
  }

  &__content {
    @include container;
    max-width: 720px;
  }

  &__subtitle {
    font-size: $font-size-lg;
    color: var(--color-text-secondary);
    margin-bottom: $space-6;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
  }
}

.features {
  &__grid {
    display: grid;
    gap: $space-5;
    margin-top: $space-6;

    @include md {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__item {
    @include card;
    text-align: center;
  }

  &__icon {
    color: var(--color-primary);
    margin-bottom: $space-3;
  }

  p {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.entities-preview {
  &__grid {
    display: grid;
    gap: $space-5;
    margin-top: $space-6;

    @include md {
      grid-template-columns: repeat(2, 1fr);
    }

    @include lg {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__more {
    margin-top: $space-6;
    text-align: center;
  }
}
</style>
