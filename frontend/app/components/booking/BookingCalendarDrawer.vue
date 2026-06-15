<template>
  <AppDrawer
    :open="open"
    :title="panelTitle"
    :show-back="panel !== 'main'"
    wide
    @close="$emit('close')"
    @back="panel = 'main'"
  >
    <template v-if="panel === 'main'">
      <DateRangeField
        :label="bookingType === 'daily' ? 'Даты проживания' : 'Дата'"
        :value="dateLabel"
        @click="panel = 'dates'"
      />
      <DateRangeField
        v-if="bookingType === 'hourly'"
        label="Время"
        :value="timeLabel"
        class="booking-drawer__time-field"
        @click="panel = 'time'"
      />
    </template>

    <DateRangePanel
      v-else-if="panel === 'dates'"
      :mode="bookingType === 'hourly' ? 'single' : 'range'"
      :initial-start="startDate"
      :initial-end="endDate"
      :min-date="minDate"
      :blocked-dates="blockedDates"
      @change="onDateChange"
    />

    <TimeRangePanel
      v-else-if="panel === 'time'"
      :start-time="startTime"
      :end-time="endTime"
      :blocked-slots="blockedSlotsForDate"
      @change="onTimeChange"
    />

    <template #footer>
      <div class="booking-drawer__footer">
        <AppButton variant="secondary" @click="$emit('close')">Отмена</AppButton>
        <AppButton :disabled="!canApply" @click="apply">Применить</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script setup lang="ts">
import type { BookingType, Availability } from '~/types';
import { formatRange, formatTimeRange } from '~/utils/calendar';

const props = defineProps<{
  open: boolean;
  bookingType: BookingType;
  availability?: Availability;
  initialStart?: string;
  initialEnd?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}>();

const emit = defineEmits<{
  close: [];
  apply: [payload: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  }];
}>();

type Panel = 'main' | 'dates' | 'time';
const panel = ref<Panel>('main');

const startDate = ref(props.initialStart);
const endDate = ref(props.initialEnd);
const startTime = ref(props.initialStartTime);
const endTime = ref(props.initialEndTime);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      panel.value = 'main';
      startDate.value = props.initialStart;
      endDate.value = props.initialEnd;
      startTime.value = props.initialStartTime;
      endTime.value = props.initialEndTime;
    }
  },
);

const minDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
});

const blockedDates = computed(() => props.availability?.blockedDates ?? []);

const blockedSlotsForDate = computed(() => {
  if (!startDate.value || !props.availability) return [];
  return props.availability.blockedSlots
    .filter((s) => s.date === startDate.value)
    .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
});

const panelTitle = computed(() => {
  if (panel.value === 'dates') return 'Даты';
  if (panel.value === 'time') return 'Время';
  return 'Бронирование';
});

const dateLabel = computed(() => {
  if (props.bookingType === 'hourly') {
    return startDate.value ? formatRange(startDate.value, startDate.value) : 'Выберите дату';
  }
  return formatRange(startDate.value, endDate.value);
});

const timeLabel = computed(() => formatTimeRange(startTime.value, endTime.value));

const canApply = computed(() => {
  if (!startDate.value) return false;
  if (props.bookingType === 'daily') return Boolean(startDate.value && endDate.value);
  return Boolean(startDate.value && startTime.value && endTime.value);
});

function onDateChange(start?: string, end?: string) {
  startDate.value = start;
  if (props.bookingType === 'hourly') {
    endDate.value = start;
  } else {
    endDate.value = end;
  }
}

function onTimeChange(start?: string, end?: string) {
  startTime.value = start;
  endTime.value = end;
}

function apply() {
  if (!canApply.value || !startDate.value) return;
  emit('apply', {
    startDate: startDate.value,
    endDate: endDate.value ?? startDate.value,
    startTime: startTime.value,
    endTime: endTime.value,
  });
  emit('close');
}
</script>

<style scoped lang="scss">
.booking-drawer {
  &__time-field {
    margin-top: $space-4;
  }

  &__footer {
    display: flex;
    gap: $space-3;
    justify-content: flex-end;
  }
}
</style>
