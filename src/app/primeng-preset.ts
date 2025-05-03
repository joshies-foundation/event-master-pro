import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const preset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          50: '{blue.50}',
          100: '{blue.100}',
          200: '{blue.200}',
          300: '{blue.300}',
          400: '{blue.400}',
          500: '{blue.500}',
          600: '{blue.600}',
          700: '{blue.700}',
          800: '{blue.800}',
          900: '{blue.900}',
          950: '{blue.950}',
        },
      },
      dark: {
        primary: {
          50: '{yellow.50}',
          100: '{yellow.100}',
          200: '{yellow.200}',
          300: '{yellow.300}',
          400: '{yellow.400}',
          500: '{yellow.500}',
          600: '{yellow.600}',
          700: '{yellow.700}',
          800: '{yellow.800}',
          900: '{yellow.900}',
          950: '{yellow.950}',
        },
      },
    },
  },
  components: {
    accordion: {
      header: {
        padding: '1.125rem 0',
      },
      content: {
        padding: '0',
      },
    },
  },
});
