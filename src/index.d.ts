/**
 * 为了可以在项目中使用 import 导入图片素材，所以声明图片格式为模块
 */
declare module "*.svg" {
  const content: any;
  export default content;
}
