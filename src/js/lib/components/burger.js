import $ from "../core";
import anime from "animejs/lib/anime.es.js";

$.prototype.burger = function () {
   for (let i = 0; i < this.length; i++) {
      //проверяем меню на прозрачность
      const transparent = $(this[i]).closest(".navbar")[0].classList.contains("is-transparent");
      //получаем выпадающее меню
      const navMenuBurger = $($(this[i]).getAttrib("data-target"));
      //получаем ссылки из выпадающего меню
      const burgerLinks = Array.from($($(this[i]).getAttrib("data-target")).find(".navbar-item"));

      //задаем стили и устанавливаем выпадающее меню в начальную позицию
      navMenuBurger[0].style.cssText =
         "position: absolute; width: 100%; transform: translateY(-50%) scaleY(0);";

      $(this[i]).click((e) => {
         //получаем nav и событие
         const nav = $(this[i]).closest(".navbar");
         const targetBurger = $(e.target);

         hideShowHandler(targetBurger, navMenuBurger, nav, transparent);
      });

      burgerLinks.forEach((link) => {
         link.addEventListener("click", () => {
            const nav = $(this[i]).closest(".navbar");
            const targetBurger = $(this[i]);

            hideShowHandler(targetBurger, navMenuBurger, nav, transparent);
         });
      });
   }

   function hideShowHandler(targetBurger, navMenuBurger, nav, transparent) {
      if (!targetBurger[0].classList.contains("is-active")) {
         targetBurger.addClass("is-active"); //активируем кнопку бургер
         navMenuBurger.addClass("is-active"); //активируем меню бургер
         if (transparent) nav.removeClass("is-transparent"); //снимаем прозрачность с меню

         animeBurger(navMenuBurger[0], ["-50%", 0], 1, () => {});
      } else {
         animeBurger(navMenuBurger[0], [0, "-50%"], 0, () => {
            targetBurger.removeClass("is-active"); //деактивируем кнопку бургер
            navMenuBurger.removeClass("is-active"); //деактивируем меню бургер
            if (transparent) nav.addClass("is-transparent"); //устанавливаем прозрачность меню
         });
      }
   }

   function animeBurger(target, translateY, scaleY, callback) {
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

$(".navbar-burger").burger();
