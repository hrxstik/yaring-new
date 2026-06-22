<template>
  <div class="admin-entities">
    <div class="admin-entities__header">
      <h1>Объекты (CMS)</h1>
      <AppButton size="sm" @click="openCreate">Добавить</AppButton>
    </div>

    <AppAlert v-if="removeError" :message="removeError" class="admin-entities__error" />

    <div v-if="loading" class="admin-skeleton">
      <AppSkeleton v-for="n in 5" :key="n" height="48px" />
    </div>

    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Тип</th>
          <th>Цена</th>
          <th>Статус</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="entity in entities" :key="entity.id">
          <td>{{ entity.name }}</td>
          <td>{{ entity.bookingType === 'daily' ? 'Посуточно' : 'Почасово' }}</td>
          <td>
            {{
              entity.bookingType === 'hourly'
                ? `${entity.pricePerHour} ₽/ч`
                : `${entity.pricePerDay} ₽/сут`
            }}
          </td>
          <td>{{ entity.isActive ? 'Активен' : 'Скрыт' }}</td>
          <td class="admin-table__actions">
            <AppButton size="sm" variant="ghost" @click="openEdit(entity)">Изменить</AppButton>
            <AppButton size="sm" variant="danger" @click="remove(entity.id)">Удалить</AppButton>
          </td>
        </tr>
      </tbody>
    </table>

    <AppDrawer
      :open="drawerOpen"
      :title="editingId ? 'Редактирование' : 'Новый объект'"
      @close="drawerOpen = false"
    >
      <form class="entity-form" @submit.prevent="save">
        <AppInput v-model="form.name" label="Название" />
        <AppInput v-model="form.slug" label="Slug" />
        <AppInput v-model="form.imageUrl" label="URL изображения" placeholder="/entity-cottage.png" />
        <label class="entity-form__field">
          <span>Описание</span>
          <textarea v-model="form.description" rows="4" />
        </label>
        <label class="entity-form__field">
          <span>Тип бронирования</span>
          <select v-model="form.bookingType">
            <option value="daily">Посуточно</option>
            <option value="hourly">Почасово</option>
          </select>
        </label>
        <AppInput v-model.number="form.pricePerDay" label="Цена за сутки" type="number" />
        <AppInput
          v-if="form.bookingType === 'hourly'"
          v-model.number="form.pricePerHour"
          label="Цена за час"
          type="number"
        />
        <AppInput v-model.number="form.capacity" label="Вместимость" type="number" />
        <AppInput v-model="amenitiesText" label="Удобства (через запятую)" />
        <label class="entity-form__checkbox">
          <input v-model="form.isActive" type="checkbox" />
          Активен
        </label>
        <p v-if="error" class="entity-form__error">{{ error }}</p>
        <AppButton type="submit" block :loading="saving">Сохранить</AppButton>
      </form>
    </AppDrawer>
  </div>
</template>

<script setup lang="ts">
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
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-4;
  }

  &__error {
    margin-bottom: $space-4;
  }
}

.admin-table {
  @include admin-table;
}

.entity-form {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);

    textarea,
    select {
      padding: $space-3;
      border: 1px solid var(--color-border);
      border-radius: $radius-md;
      background: var(--color-surface);
      color: var(--color-text);
    }
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-sm;
  }

  &__error {
    color: #c0392b;
    font-size: $font-size-sm;
  }
}
</style>
