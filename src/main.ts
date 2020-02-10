import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueCompositionApi from "@vue/composition-api";
import * as AV from "leancloud-storage";

AV.init({
  appId: "1vrLSxhVS6DqUox0scqmyhCt-gzGzoHsz",
  appKey: "ywrEEUSG5sE0OyMuXXvW7w8M",
  serverURLs: "https://timebarrier.api.hearfresh.cn"
});

Vue.config.productionTip = false;

Vue.use(VueCompositionApi);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
