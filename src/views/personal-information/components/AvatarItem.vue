<template>
  <div class="avatar-container">
    <input
      class="input-image"
      type="file"
      accept="image/*"
      @change="upload_avatar"
      ref="input"
    />
    <span>头像</span>
    <img class="avatar" v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
    <svg
      class="avatar"
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="116"
      height="116"
      viewBox="0 0 116 116"
    >
      <g id="组_1837" data-name="组 1837" transform="translate(-227 -923)">
        <rect
          id="矩形_1744"
          data-name="矩形 1744"
          width="116"
          height="116"
          rx="11"
          transform="translate(227 923)"
          fill="#f7f7f7"
        />
        <g
          id="组_1837-2"
          data-name="组 1837"
          transform="translate(225.108 908.977)"
        >
          <path
            id="路径_622"
            data-name="路径 622"
            d="M327.6,271.744c-7.223,4.508-26.162-2.012-31.79-11.951-5.248,9.206-14.141,17.36-22.784,11.967a27.3,27.3,0,0,0,54.574-.016ZM311.723,246.05a29.538,29.538,0,0,1,6.5,4.2A27.32,27.32,0,0,0,311.723,246.05Zm-10.56-2.477c-.283-.008-.564-.021-.849-.021-.3,0-.6.013-.9.023.287.006.574.012.856.031C300.566,243.585,300.865,243.578,301.163,243.573Z"
            transform="translate(-240.418 -215.946)"
            fill="#fce9ea"
          />
          <path
            id="路径_623"
            data-name="路径 623"
            d="M246.692,727.6c.136-.029.275-.054.412-.082-.137.027-.276.053-.412.082ZM248.231,727.311Zm11.143-.3c.159.018.315.04.473.06-.158-.02-.314-.042-.472-.06ZM260.962,727.228Zm-17.6,1.238c.108-.034.216-.069.325-.1C243.581,728.4,243.474,728.432,243.365,728.466Zm19.221-.949c.142.028.285.055.425.084C262.871,727.572,262.729,727.545,262.586,727.517Zm3.414.845c.117.035.233.073.35.11C266.233,728.435,266.118,728.4,266,728.362Zm1.456.473.242.086a13.536,13.536,0,0,1-1.187,2.51c1.942,2.991,1.455,16.035-1.464,13.973l-5.111-3.586-5.1-3.586.334-.236c-.112,0-.222.009-.334.009s-.232-.006-.348-.009l.334.236-5.1,3.586-5.111,3.586c-2.936,2.065-3.422-11.026-1.46-13.988a13.546,13.546,0,0,1-1.176-2.49l.249-.088a31.669,31.669,0,0,0-20.487,21.45,58,58,0,0,0,66.21-.012A31.69,31.69,0,0,0,267.456,728.835Zm-17.6-1.763c.156-.02.312-.041.468-.059-.157.018-.312.04-.468.06Z"
            transform="translate(-194.942 -644.634)"
            fill="#222a36"
          />
          <path
            id="路径_624"
            data-name="路径 624"
            d="M401.563,730.212c.39-.589.876-.779,1.46-.369l5.111,3.586,4.763,3.363c.116,0,.231.009.348.009s.222-.006.334-.008l4.764-3.364,5.111-3.586c.586-.414,1.073-.217,1.464.384a13.535,13.535,0,0,0,1.187-2.51l-.242-.086q-.55-.19-1.106-.363c-.117-.036-.233-.074-.35-.11q-1.478-.442-2.989-.76c-.141-.03-.284-.056-.425-.084q-.809-.162-1.625-.289-.556-.086-1.115-.156c-.158-.02-.314-.042-.472-.06q-.795-.093-1.593-.154h-3.131a4.781,4.781,0,0,1-.629,0h-2.1q-.8.061-1.6.154c-.157.018-.312.04-.468.059q-.816.1-1.627.239-.568.1-1.127.208c-.137.027-.275.053-.412.082q-1.516.319-3,.764c-.109.033-.216.068-.325.1q-.7.216-1.385.46a13.518,13.518,0,0,0,1.175,2.49Z"
            transform="translate(-353.35 -643.43)"
            fill="#fefefe"
          />
          <path
            id="路径_625"
            data-name="路径 625"
            d="M423.423,760.91l-5.111,3.586-4.764,3.364-.334.236,5.1,3.586,5.111,3.586c2.919,2.061,3.407-10.982,1.464-13.973-.39-.6-.878-.8-1.464-.384Zm-20.432,0c-.583-.41-1.07-.22-1.46.369-1.962,2.961-1.476,16.053,1.46,13.988l5.111-3.586,5.1-3.586-.334-.236L408.1,764.5l-5.112-3.586Z"
            transform="translate(-353.318 -674.497)"
            fill="#00bcae"
          />
          <path
            id="路径_626"
            data-name="路径 626"
            d="M474.136,259.938c5.628,9.939,24.567,16.459,31.79,11.951l.022-.013a25.936,25.936,0,0,0-9.4-21.48,29.516,29.516,0,0,0-6.5-4.2,24.228,24.228,0,0,0-10.56-2.477c-.3.005-.6.012-.889.032C479.544,247.1,477.662,253.754,474.136,259.938Z"
            transform="translate(-418.743 -216.091)"
            fill="#222a36"
          />
          <path
            id="路径_627"
            data-name="路径 627"
            d="M295.108,259.941c3.526-6.184,5.408-12.842,4.463-16.188q-.427-.026-.856-.031c-11.51-.217-27.38,10.585-26.441,28.157l.049.029C280.968,277.3,289.86,269.147,295.108,259.941Z"
            transform="translate(-239.715 -216.094)"
            fill="#222a36"
          />
        </g>
      </g>
    </svg>

    <svg
      class="arrow"
      xmlns="http://www.w3.org/2000/svg"
      width="8.477"
      height="16.951"
      viewBox="0 0 8.477 16.951"
    >
      <path
        id="路径_273"
        data-name="路径 273"
        d="M256.115,15.911l7-7.436-7-7.433a.641.641,0,0,1,0-.862.548.548,0,0,1,.811,0l7.328,7.787a.634.634,0,0,1,.161.5.627.627,0,0,1-.161.52l-7.328,7.788a.553.553,0,0,1-.811,0,.635.635,0,0,1,0-.861Z"
        transform="translate(-255.947 0)"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from "@vue/composition-api";
import { PersonalInformation } from "@/lib/vue-viewmodels";
export default defineComponent({
  setup(props, context) {
    const avatarUrl: Ref<string> = ref("");

    onMounted(() => {
      PersonalInformation.fetchAvatar(context.root, avatarUrl);
    });

    const input: Ref<HTMLInputElement | null> = ref(null);

    const upload_avatar = (e: Event) => {
      PersonalInformation.uploadAvatar(
        context.root,
        e,
        input.value as HTMLInputElement,
        avatarUrl
      );
    };

    return { avatarUrl, upload_avatar, input };
  }
});
</script>

<style lang="stylus" scoped>
.avatar-container {
  width 100vw
  height 10.94vh
  background #fff
  display flex
  align-items center
  cursor pointer
  position relative
  .input-image {
    cursor pointer
    position absolute
    width 100%
    height 100%
    opacity 0
  }
  span {
    font-size 2.25vh
    font-weight normal
    font-stretch normal
    font-style normal
    letter-spacing 0.02vh
    text-align left
    color #222a36
    margin-left 4.8vw
    margin-right 59.33vw
  }
  .avatar {
    width 8.7vh
    height 8.7vh
    border-radius 0.82vh
  }
  .arrow {
    margin-left 6.35vw
    margin-right 4.93vw
    width 1.13vw
    height 1.27vh
  }
}
</style>
