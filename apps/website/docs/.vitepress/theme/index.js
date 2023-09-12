import DefaultTheme from 'vitepress/theme';
import LiveDemo from './LiveDemo.vue';

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ctx.app.component('LiveDemo', LiveDemo);
  },
};
