<template>
  <div class="admin-entities">
    <div class="admin-entities__header">
      <h2 class="admin-entities__title">Объекты</h2>
      <AppButton size="md" @click="openCreate"><Plus :size="16" />Добавить объект</AppButton>
    </div>

    <AppAlert v-if="removeError" variant="error" :message="removeError" />

    <div v-if="loading" class="admin-skeleton">
      <AppSkeleton v-for="n in 4" :key="n" height="68px" />
    </div>

    <div v-else class="admin-entities__list">
      <article v-for="entity in entities" :key="entity.id" class="entity-row">
        <span class="entity-row__thumb" aria-hidden="true" />
        <div class="entity-row__info">
          <span class="entity-row__name">{{ entity.name }}</span>
          <span class="entity-row__meta">
            {{ entity.bookingType === 'daily' ? 'Посуточно' : 'Почасово' }} ·
            {{ priceLabel(entity) }} · до {{ entity.capacity }} чел.
          </span>
        </div>
        <span class="status-badge" :class="entity.isActive ? 'status-badge--confirmed' : 'status-badge--cancelled'">
          {{ entity.isActive ? 'Активен' : 'Скрыт' }}
        </span>
        <button type="button" class="icon-btn" aria-label="Изменить" @click="openEdit(entity)">
          <Pencil :size="16" />
        </button>
        <button type="button" class="icon-btn icon-btn--danger" aria-label="Удалить" @click="remove(entity.id)">
          <Trash2 :size="16" />
        </button>
      </article>
    </div>

    <AppDrawer
      :open="drawerOpen"
      :title="editingId ? 'Редактировать объект' : 'Новый объект'"
      wide
      @close="drawerOpen = false"
    >
      <form id="entity-form" class="entity-form" @submit.prevent="save">
        <AppInput v-model="form.name" label="Название" />
        <AppInput v-model="form.slug" label="Slug" />
        <AppInput v-model="form.imageUrl" label="URL изображения" placeholder="/entity-cottage.png" />
        <label class="field">
          <span class="field__label">Описание</span>
          <textarea v-model="form.description" rows="4" class="field__control" />
        </label>
        <label class="field">
          <span class="field__label">Тип бронирования</span>
          <select v-model="form.bookingType" class="field__control">
            <option value="daily">Посуточно</option>
            <option value="hourly">Почасово</option>
          </select>
        </label>
        <div class="entity-form__row">
          <AppInput v-model.number="form.pricePerDay" label="Цена за сутки" type="number" />
          <AppInput
            v-if="form.bookingType === 'hourly'"
            v-model.number="form.pricePerHour"
            label="Цена за час"
            type="number"
          />
          <AppInput v-model.number="form.capacity" label="Вместимость" type="number" />
        </div>
        <AppInput v-model="amenitiesText" label="Удобства (через запятую)" />
        <label class="checkbox">
          <input v-model="form.isActive" type="checkbox" />
          <span class="checkbox__box"><Check :size="14" /></span>
          Активен
        </label>
        <AppAlert v-if="error" variant="error" :message="error" />
      </form>
      <template #footer>
        <AppButton type="submit" form="entity-form" block :loading="saving">Сохранить</AppButton>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2, Check } from 'lucide-vue-next';
import type { BookableEntity, BookingType } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'Объекты — Админка' });

const { request, formatApiError } = useApi();
const entities = ref<BookableEntity[]>([]);
const loading = ref(true);
const drawerOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const error = ref<string | null>(null);
const removeError = ref<string | null>(null);

const form = reactive({
  name: '',
  slug: '',
  imageUrl: '',
  description: '',
  bookingType: 'daily' as BookingType,
  pricePerDay: 0,
  pricePerHour: 0,
  capacity: 1,
  isActive: true,
});

const amenitiesText = ref('');

function priceLabel(entity: BookableEntity) {
  return entity.bookingType === 'hourly'
    ? `${(entity.pricePerHour ?? 0).toLocaleString('ru-RU')} ₽/ч`
    : `${entity.pricePerDay.toLocaleString('ru-RU')} ₽/сут`;
}

onMounted(load);

async function load() {
  loading.value = true;
  try {
    entities.value = await request<BookableEntity[]>('/entities?all=true');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.name = '';
  form.slug = '';
  form.imageUrl = '';
  form.description = '';
  form.bookingType = 'daily';
  form.pricePerDay = 0;
  form.pricePerHour = 0;
  form.capacity = 1;
  form.isActive = true;
  amenitiesText.value = '';
  editingId.value = null;
  error.value = null;
}

function openCreate() {
  resetForm();
  drawerOpen.value = true;
}

function openEdit(entity: BookableEntity) {
  editingId.value = entity.id;
  form.name = entity.name;
  form.slug = entity.slug;
  form.imageUrl = entity.imageUrl ?? '';
  form.description = entity.description;
  form.bookingType = entity.bookingType;
  form.pricePerDay = entity.pricePerDay;
  form.pricePerHour = entity.pricePerHour ?? 0;
  form.capacity = entity.capacity;
  form.isActive = entity.isActive;
  amenitiesText.value = entity.amenities.join(', ');
  error.value = null;
  drawerOpen.value = true;
}

async function save() {
  saving.value = true;
  error.value = null;
  const payload = {
    ...form,
    amenities: amenitiesText.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };

  try {
    if (editingId.value) {
      await request(`/entities/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await request('/entities', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    drawerOpen.value = false;
    await load();
  } catch (e) {
    error.value = formatApiError(e);
  } finally {
    saving.value = false;
  }
}

async function remove(id: string) {
  if (!confirm('Удалить объект?')) return;
  removeError.value = null;
  try {
    await request(`/entities/${id}`, { method: 'DELETE' });
    await load();
  } catch (e) {
    removeError.value = formatApiError(e);
  }
}
</script>

<style scoped lang="scss">
.admin-entities {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $space-3;
  }

  &__title {
    margin: 0;
    font-size: var(--font-2xl);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-2 + 2px;
  }
}

.entity-row {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  &__thumb {
    @include photo-placeholder;
    width: 52px;
    height: 52px;
    flex: none;
    border-radius: var(--radius-md);

    @media (max-width: 480px) {
      display: none;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: var(--font-base);
    font-weight: 700;
  }

  &__meta {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }
}

.status-badge {
  @include status-badge;
  flex: none;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: none;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    border-color $transition,
    color $transition;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &--danger {
    color: var(--color-danger);

    &:hover {
      border-color: var(--color-danger);
      color: var(--color-danger);
    }
  }
}

.entity-form {
  display: flex;
  flex-direction: column;
  gap: $space-3 + 2px;

  &__row {
    display: flex;
    gap: $space-3;

    > * {
      flex: 1;
    }
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: $space-1 + 2px;

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__control {
    padding: $space-2 + 2px $space-3 + 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
    font-size: $font-size-base;
    outline: none;
    resize: vertical;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-tint);
    }
  }
}

.checkbox {
  display: flex;
  align-items: center;
  gap: $space-2 + 2px;
  font-size: var(--font-base);
  font-weight: 500;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    color: transparent;
    transition:
      background $transition,
      border-color $transition,
      color $transition;
  }

  input:checked + &__box {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-primary-contrast);
  }
}
</style>
