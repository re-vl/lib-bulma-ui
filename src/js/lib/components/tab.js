import $ from "../core";
import anime from "animejs/lib/anime.es.js";

$.prototype.tab = function () {
   // получаем селекторы меню и карт табов
   const tabsItem = $(this[0]).find(".tab-item");
   const tabsContent = $(this[0]).find(".tab-content .card");

   for (let i = 0; i < tabsItem.length; i++) {
      $(tabsItem[i]).click((e) => {
         const tabsItemI = $(e.currentTarget); //получаем элемент таб меню

         //добавляем "активный" текущему пункту таб-меню и удаляем у остальных
         tabsItemI.addClass("is-active").siblings().removeClass("is-active");
         //запускаем анимацию подъема карты
         animeTab([0, "-110%"], function () {
            //после подъема
            //находим карты и дабовляем всем "скрытый"
            tabsItemI.closest(".tab-panel").find(".tab-content").addClass("is-hidden");
            //находим текущую карту и убираем "скрытый"
            tabsItemI
               .closest(".tab-panel")
               .find(".tab-content")
               .eq($(tabsItem[i]).index())
               .removeClass("is-hidden");
            animeTab(["-110%", 0], () => {}); //запускае анимацию опускания
         });
      });
   }

   function animeTab(translateY, callback) {
      const duration = 500;

      for (let i = 0; i < tabsContent.length; i++) {
         //проверяем что это экран компьютера
         if (document.documentElement.clientWidth > 768) {
            //анимация подъема - опуска
            anime({
               targets: tabsContent[i],
               duration: duration,
               translateY: translateY,
               easing: "easeInOutBack",
            });
         } else if (translateY[0] == 0) {
            //если не компьютер
            //анимация затухания
            anime({
               targets: tabsContent[i],
               duration: duration,
               opacity: 0,
               easing: "easeInOutBack",
            });
         } else if (translateY[0] == "-110%") {
            //если не компьютер
            //анимация проявления
            anime({
               targets: tabsContent[i],
               duration: duration,
               opacity: 1,
               easing: "easeInOutBack",
            });
         }
      }
      setTimeout(() => {
         callback();
      }, duration);
   }
};

$("#tabs1").tab();
