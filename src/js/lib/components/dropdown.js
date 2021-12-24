import $ from "../core";
import anime from "animejs/lib/anime.es.js";

$.prototype.dropdown = function () {
   for (let i = 0; i < this.length; i++) {
      const dropItem = $(this[i]),
         dropContent = $(dropItem[0]).find(".dropdown-content")[0];
      //устанавливаем выпадающее меню в начальную позицию
      dropContent.style.transform = "translateY(-50%) scaleY(0)";

      $(this[i]).click(() => {
         if (!dropItem[0].classList.contains("is-active")) {
            dropItem.addClass("is-active"); //активируем меню дропдавн
            animeDrop(dropContent, ["-50%", 0], 1, () => {});
         } else {
            animeDrop(dropContent, [0, "-50%"], 0, () => {
               dropItem.removeClass("is-active"); //деактивируем меню дропдавн
            });
         }
      });
   }
   function animeDrop(target, translateY, scaleY, callback) {
      const duration = 500;

      anime({
         targets: target,
         duration: duration,
         translateY: translateY,
         scaleY: scaleY,
         easing: "easeInOutSine",
      });
      setTimeout(() => {
         callback();
      }, duration);
   }
};

$("#dropdown-1").dropdown();
