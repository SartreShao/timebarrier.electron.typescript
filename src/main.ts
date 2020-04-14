import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueCompositionApi from "@vue/composition-api";
import * as AV from "leancloud-storage";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.directive("longpress", {
  bind: function(el, binding, vNode) {
    console.log(binding.value, typeof binding.value);
    // Make sure expression provided is a function
    if (typeof binding.value !== "function" && vNode.context !== undefined) {
      // pass warning to console
      let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be`;

      console.warn(warn);
    }

    // Define variable
    let pressTimer: NodeJS.Timeout | null = null;

    // Define funtion handlers
    // Create timeout ( run function after 1s )
    let start = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent && e.type === "click" && e.button !== 0) {
        return;
      }

      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          // Run function
          handler(e);
        }, 1000);
      }
    };

    // Cancel Timeout
    let cancel = () => {
      // Check if timer has a value or not
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    // Run Function
    const handler = (e: MouseEvent | TouchEvent) => {
      binding.value(e);
    };

    // Add Event listeners
    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start);
    // Cancel timeouts if this events happen
    el.addEventListener("click", cancel);
    el.addEventListener("mouseout", cancel);
    el.addEventListener("touchend", cancel);
    el.addEventListener("touchcancel", cancel);
  }
});
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
