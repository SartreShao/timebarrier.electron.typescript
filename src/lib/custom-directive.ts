import Vue from "vue";
import { TimelineMax, Linear } from "gsap";
import { createElement } from "@vue/composition-api";

export function useDirective() {
  /**
   * 创建「长按事件」
   */
  Vue.directive("longclick", {
    bind: function(el, binding) {
      Vue.set(el, "$value", binding.value);
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
        // console.log("start", e);
        // console.log("start type", e.type);

        // 如果不是鼠标左键点击，就直接返回
        if (e instanceof MouseEvent && e.type === "click" && e.button !== 0) {
          return;
        }

        if (pressTimer === null) {
          pressTimer = setTimeout(() => {
            // Run function
            handler(e);
          }, 750);
        }
      };

      // Cancel Timeout
      let cancel = (e: MouseEvent | TouchEvent) => {
        // console.log("cancel", e);
        // console.log("cancel type", e.type);

        // Check if timer has a value or not
        if (pressTimer !== null) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };
      // Run Function
      const handler = (e: MouseEvent | TouchEvent) => {
        // console.log("handler", e);
        // console.log("handler type", e.type);
        (el as any).$value(e);
      };

      // Add Event listeners
      el.addEventListener("mousedown", start);
      el.addEventListener("touchstart", start);
      // Cancel timeouts if this events happen
      el.addEventListener("mouseup", cancel);
      el.addEventListener("mouseout", cancel);
      el.addEventListener("mousemove", cancel);
      el.addEventListener("click", cancel);
      el.addEventListener("touchend", cancel);
      el.addEventListener("touchmove", cancel);
      el.addEventListener("touchcancel", cancel);
    },
    update: function(el, binding) {
      (el as any).$value = binding.value;
    }
  });

  Vue.directive("darked-when-click", {
    bind: function(el, binding) {
      el.style.position = "relative";
      el.style.overflow = "hidden";
      const mask = document.createElement("div");
      mask.style.background = "black";
      mask.style.width = "100%";
      mask.style.height = "100%";
      mask.style.opacity = "0";
      mask.style.position = "absolute";
      mask.style.top = "0";
      mask.style.left = "0";
      el.appendChild(mask);

      const handle = (event: MouseEvent | TouchEvent) => {
        mask.style.opacity = "0.1";
      };

      const cancel = (event: MouseEvent | TouchEvent) => {
        mask.style.opacity = "0";
      };

      // Add Event listeners
      el.addEventListener("mousedown", handle);
      el.addEventListener("touchstart", handle);
      // Cancel timeouts if this events happen
      el.addEventListener("mouseup", cancel);
      el.addEventListener("mouseout", cancel);
      el.addEventListener("click", cancel);
      el.addEventListener("touchend", cancel);
      el.addEventListener("touchmove", cancel);
      el.addEventListener("touchcancel", cancel);
    }
  });

  Vue.directive("splash-when-click", {
    bind: function(el, binding, vnode, oldVnode) {
      // console.log("el`", el);
      // console.log("vnode", vnode.children);
      // 1. 本元素应该有属性 overflow hidden
      el.style.overflow = "hidden";
      el.style.position = "relative";
      const width = "0.15vh";
      const height = "0.15vh";

      // 2. 创建子元素
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttributeNS(null, "width", "55");
      svg.setAttributeNS(null, "height", "55");
      svg.setAttributeNS(null, "viewBox", "0 0 55 55");
      // svg.setAttributeNS(null, "xmlns", "http://www.w3.org/2000/svg");
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = width;
      svg.style.height = height;
      svg.style.zIndex = "0";
      svg.style.opacity = "0";
      svg.style.pointerEvents = "none";
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttributeNS(null, "cx", "27.5");
      circle.setAttributeNS(null, "cy", "27.5");
      circle.setAttributeNS(null, "r", "27.5");
      circle.setAttributeNS(null, "opacity", "0.1");

      svg.appendChild(circle);

      // el.insertBefore(svg, el.childNodes[0]);
      el.appendChild(svg);

      // el.innerHTML =
      //   `
      //   <svg
      //     xmlns="http://www.w3.org/2000/svg"
      //     width="55"
      //     height="55"
      //     viewBox="0 0 55 55"
      //     style="
      //       position:absolute;
      //       top:0;
      //       left:0;
      //       width:${width};
      //       height:${height};
      //       z-index:0;
      //       opacity:0;
      //       pointer-events:none;"
      //   >
      //     <circle cx="27.5" cy="27.5" r="27.5" opacity="0.199" />
      //   </svg>

      //   ` + el.innerHTML;

      // 第一步：创建一个子元素 svg
      // 第二步：创建子元素的样式
      const tl = new TimelineMax();

      const handle = (event: MouseEvent | TouchEvent) => {
        if (event.currentTarget === el) {
          // console.log("event", event);
          // console.log("currentTarget", event.currentTarget);
          // console.log("target", event.target);
          // console.log("el", el);
          // 获取子元素
          // const svg = el.firstElementChild;

          if (svg !== null) {
            let x: number = 0;
            let y: number = 0;

            if (event instanceof MouseEvent) {
              // 相对于带有定位的父盒子的 x, y 坐标
              x = event.offsetX;
              y = event.offsetY;

              const offsetTarget = offset(event.target as HTMLElement);
              const offsetCurrentTarget = offset(
                event.currentTarget as HTMLElement
              );

              x = offsetTarget.l - offsetCurrentTarget.l + x;
              y = offsetTarget.t - offsetCurrentTarget.t + y;
            } else if (event instanceof TouchEvent) {
              x =
                event.targetTouches[0].clientX -
                offset(event.currentTarget as HTMLElement).l;
              y =
                event.targetTouches[0].clientY -
                offset(event.currentTarget as HTMLElement).t;
            }

            const w = (event.currentTarget as HTMLElement).offsetWidth;
            const h = (event.currentTarget as HTMLElement).offsetHeight;

            // console.log("offsetWidth", w);
            // console.log("offsetHeight", h);
            const offsetX = Math.abs(w / 2 - x);
            const offsetY = Math.abs(h / 2 - y);
            const deltaX = w / 2 + offsetX;
            const deltaY = h / 2 + offsetY;
            const scaleRatio =
              2 * Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            tl.fromTo(
              svg,
              0.75,
              {
                x: x,
                y: y,
                transformOrigin: "50% 50%",
                scale: 0,
                opacity: 1,
                ease: Linear.easeIn
              },
              {
                scale: scaleRatio,
                opacity: 0
              }
            );
            // tl.clear();
          }
        }
      };

      const cancel = (event: MouseEvent | TouchEvent) => {
        tl.restart();
        tl.clear();
      };

      // Add Event listeners
      el.addEventListener("mousedown", handle);
      el.addEventListener("touchstart", handle);
      // Cancel timeouts if this events happen
      el.addEventListener("mouseup", cancel);
      el.addEventListener("mouseout", cancel);
      el.addEventListener("mousemove", cancel);
      el.addEventListener("click", cancel);
      el.addEventListener("touchend", cancel);
      el.addEventListener("touchmove", cancel);
      el.addEventListener("touchcancel", cancel);
    }
  });
}

function offset(ele: HTMLElement) {
  const obj: { l: number; t: number } = { l: 0, t: 0 };
  obj.l = ele.offsetLeft;
  obj.t = ele.offsetTop;

  while (ele.offsetParent) {
    //寻找父级，当寻找到 body 往上的时候为 null ，所以循环停止
    ele = ele.offsetParent as HTMLElement; //初始值
    obj.l += ele.offsetLeft;
    obj.t += ele.offsetTop;
    // console.log("object", obj);
  }

  return obj;
}
