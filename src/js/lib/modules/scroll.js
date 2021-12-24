import $ from "../core";
import anime from "animejs/lib/anime.es.js";

$.prototype.scrolling = function () {
   //получам селекторы меню и ссылок на секции
   const nav = this[0];
   const sections = $(this[0]).find(".refer").getElems("href");
   const links = Array.from($(this[0]).find(".refer"));

   //если секций несколько обрабатываем как меню
   if (sections.length > 1) {
      const navHeight = nav.scrollHeight;

      // подсветка пунктов меню при прокрутке
      const loop = () => {
         links.forEach((link, i) => {
            const { top, bottom } = sections[i].getBoundingClientRect();
            const navHeight = nav.scrollHeight;

            top - navHeight <= 0 && bottom - navHeight > 0
               ? link.classList.add("has-text-info")
               : link.classList.remove("has-text-info");
         });
         window.requestAnimationFrame(loop);
      };
      loop();

      // обработка переходов прокрутки
      const scrollToSection = (evt, i) => {
         evt.preventDefault();

         const { top } = sections[i].getBoundingClientRect();
         const scroolTo = top + window.pageYOffset - navHeight + 1;
         const scrollCoords = {
            y: window.pageYOffset,
         };

         scroolHandler(scrollCoords, scroolTo);
      };

      links.forEach((link, i) =>
         link.addEventListener("click", (evt) => scrollToSection(evt, i))
      );
   } else {
      //если секция 1 обрабатываем как прокрутка вверх до конца
      const scrollUp = $(this[0])[0];

      window.addEventListener("scroll", () => {
         //показываем кнопку скролла при велечене более 1250px
         window.pageYOffset > 1250
            ? $(this[0]).removeClass("is-hidden")
            : $(this[0]).addClass("is-hidden");
      });

      scrollUp.addEventListener("click", (e) => {
         e.preventDefault();

         const scrollCoords = {
            y: window.pageYOffset,
         };

         scroolHandler(scrollCoords, 0);
      });
   }

   // скроллинг
   function scroolHandler(from, to) {
      anime({
         targets: from,
         y: to,
         duration: 1000,
         easing: "easeInOutCubic",
         update: () => window.scroll(0, from.y),
      });
   }
};

//вызов если есть меню
$(".navbar").scrolling();

//вызов если элемент up
//$(".up").scrolling();
