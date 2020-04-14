import Vue from "vue";

export function useDirective() {
  /**
   * 创建「长按事件」
   */
  Vue.directive("longclick", {
    bind: function(el, binding) {
      // Make sure expression provided is a function
      if (typeof binding.value !== "function") {
        // pass warning to console
        let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be`;

        console.warn(warn);
      }

      // Define variable
      let pressTimer: NodeJS.Timeout | null = null;

      // Define funtion handlers
      // Create timeout ( run function after 1s )
      let start = (e: MouseEvent | TouchEvent) => {
        // 如果不是鼠标左键点击，就直接返回
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
}
