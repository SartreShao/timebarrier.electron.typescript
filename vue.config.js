module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        appId: "cn.hearfresh.timebarrier.app",
        productName: "时间壁垒"
        // directories: {
        //   buildResources: "./public"
        // },
        // mac: {
        //   icon: "build/logo.ico"
        // }
        // icon: "logo.ico"
      }
    }
  }
};
