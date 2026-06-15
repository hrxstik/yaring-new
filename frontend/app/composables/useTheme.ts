const THEME_KEY = 'yaring-theme';

export function useTheme() {
  const theme = useState<'light' | 'dark'>('theme', () => 'light');

  const apply = (value: 'light' | 'dark') => {
    theme.value = value;
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem(THEME_KEY, value);
    }
  };

  const toggle = () => {
    apply(theme.value === 'dark' ? 'light' : 'dark');
  };

  onMounted(() => {
    const saved = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved ?? (prefersDark ? 'dark' : 'light'));
  });

  return { theme, toggle, apply };
}
