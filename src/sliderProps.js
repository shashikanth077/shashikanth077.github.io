import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
SwiperCore.use([Pagination, Navigation, EffectFade, Autoplay]);

const SLIDE_GAP_PX = 25;
const AUTOPLAY_DELAY_MS = 6000;
const TABLET_BREAKPOINT_PX = 768;
const DESKTOP_BREAKPOINT_PX = 1200;

export const testimonialsSlider = {
  slidesPerView: 1,
  spaceBetween: SLIDE_GAP_PX,
  loop: true,
  autoplay: {
    delay: AUTOPLAY_DELAY_MS,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".owl-dots",
    clickable: true,
  },
  breakpoints: {
    0: { slidesPerView: 1 },
    [TABLET_BREAKPOINT_PX]: { slidesPerView: 2, spaceBetween: SLIDE_GAP_PX },
    [DESKTOP_BREAKPOINT_PX]: { slidesPerView: 3, spaceBetween: SLIDE_GAP_PX },
  },
};
