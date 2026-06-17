<template>
  <div class="yandex-map" :style="{ height }">
    <iframe
      v-if="useIframe"
      class="yandex-map__iframe"
      :src="iframeSrc"
      title="Карта — Яринг"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    />
    <template v-else>
      <div ref="mapEl" class="yandex-map__canvas" />
      <div v-if="!ready && !failed" class="yandex-map__state">
        <AppSkeleton variant="block" height="100%" />
      </div>
      <div v-if="failed" class="yandex-map__state yandex-map__state--error">
        <MapPin :size="24" />
        <span>Карта временно недоступна</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { MapPin } from 'lucide-vue-next';
import { YARING_MAP_CENTER, YARING_MAP_ZOOM } from '~/utils/map';

const props = withDefaults(
  defineProps<{
    height?: string;
    center?: [number, number];
    zoom?: number;
    hint?: string;
  }>(),
  {
    height: '220px',
    center: () => YARING_MAP_CENTER,
    zoom: YARING_MAP_ZOOM,
    hint: 'База отдыха «Яринг»',
  },
);

const config = useRuntimeConfig();
const mapEl = ref<HTMLElement | null>(null);
const ready = ref(false);
const failed = ref(false);

const apiKey = computed(() => config.public.yandexMapsKey as string);
const useIframe = computed(() => !apiKey.value);

const iframeSrc = computed(() => {
  const [lat, lng] = props.center;
  return `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=${props.zoom}&pt=${lng},${lat},pm2gnm`;
});

onMounted(async () => {
  if (useIframe.value || !mapEl.value) return;

  try {
    await loadYandexMaps(apiKey.value);
    const ymaps = window.ymaps!;
    const map = new ymaps.Map(mapEl.value, {
      center: props.center,
      zoom: props.zoom,
      controls: ['zoomControl'],
    });

    map.behaviors.disable('scrollZoom');

    const placemark = new ymaps.Placemark(
      props.center,
      { hintContent: props.hint, balloonContent: props.hint },
      { preset: 'islands#darkGreenDotIcon' },
    );
    map.geoObjects.add(placemark);
    ready.value = true;
  } catch {
    failed.value = true;
  }
});

function loadYandexMaps(apiKey: string): Promise<void> {
  if (window.ymaps) {
    return new Promise((resolve) => window.ymaps!.ready(resolve));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => window.ymaps!.ready(resolve);
    script.onerror = () => reject(new Error('Yandex Maps load failed'));
    document.head.appendChild(script);
  });
}
</script>

<script lang="ts">
declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void;
      Map: new (
        el: HTMLElement,
        opts: { center: number[]; zoom: number; controls: string[] },
      ) => {
        behaviors: { disable: (b: string) => void };
        geoObjects: { add: (o: unknown) => void };
      };
      Placemark: new (
        coords: number[],
        props: Record<string, string>,
        opts: Record<string, string>,
      ) => unknown;
    };
  }
}
</script>

<style scoped lang="scss">
.yandex-map {
  position: relative;
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);

  &__canvas {
    width: 100%;
    height: 100%;
  }

  &__iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  &__state {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    color: var(--color-text-muted);
    font-size: var(--font-sm);
    background: var(--color-surface-elevated);

    &--error {
      padding: $space-4;
      text-align: center;
    }
  }
}
</style>
