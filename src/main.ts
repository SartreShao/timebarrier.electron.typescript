import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueCompositionApi from "@vue/composition-api";
import * as AV from "leancloud-storage";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Api from "./lib/api";
import { useDirective } from "./lib/custom-directive";

useDirective();

Api.init();

Vue.config.productionTip = false;

Vue.use(VueCompositionApi);
Vue.use(ElementUI);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
