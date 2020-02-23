import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import bootstrap from 'bootstrap';

import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueAxios, axios, bootstrap);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
