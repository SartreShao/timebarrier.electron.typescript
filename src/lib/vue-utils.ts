import VueRouter, { RawLocation } from "vue-router";

const isDev = false;

const Router = {
  replace: (router: VueRouter, location: RawLocation): void => {
    router.replace(location);
  }
};

const Time = {
  sleep: (time: number) => new Promise(resolve => setTimeout(resolve, time))
};

const Log = {
  success: (functionName: string, result: any) => {
    if (isDev) {
      console.log(functionName + " success", result);
    }
  },
  error: (functionName: string, error: Error) => {
    if (isDev) {
      console.log(functionName + " error", error);
    }
  }
};

export { Router, Time, Log };
