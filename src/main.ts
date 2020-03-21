import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueCompositionApi from "@vue/composition-api";
import * as AV from "leancloud-storage";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

AV.init({
  appId: "1vrLSxhVS6DqUox0scqmyhCt-gzGzoHsz",
  appKey: "ywrEEUSG5sE0OyMuXXvW7w8M",
  serverURLs: "https://timebarrier.api.hearfresh.cn"
});

Vue.config.productionTip = false;

Vue.use(VueCompositionApi);
Vue.use(ElementUI);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
