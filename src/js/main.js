import $ from "./lib/lib";
import anime from "animejs/lib/anime.es.js";
import { tns } from "./lib/components/tiny-slider";

window.addEventListener("DOMContentLoaded", () => {
   // анимация заголовка siction hero
   function textHeroAnim() {
      const text = document.querySelector(".text");
      text.innerHTML = text.textContent.replace(
         /\S/g,
         "<span style ='display: inline-block;'>$&</span>"
      );
      const targets = document.querySelectorAll(".text span");

      let tl = anime.timeline({
         loop: true,
      });

      tl.add({
         targets: targets,
         translateX: [0, -1000],
         scale: [1, 1],
         opacity: [1, 0],
         easing: "easeOutExpo",
         duration: 2000,
         delay: anime.stagger(100),
      }).add({
         targets: targets,
         translateX: [1000, 0],
         scale: [1, 1],
         opacity: [0, 1],
         easing: "easeOutExpo",
         duration: 2000,
         delay: anime.stagger(100),
         endDelay: 5000,
      });
   }
   textHeroAnim();

   //анимация контента при скролле страницы
   const animItems = $(".anime");

   for (let i = 0; i < animItems.length; i++) {
      new IntersectionObserver(
         (entries) => {
            let direct,
               d = Math.round(Math.random());

            if (entries[0].isIntersecting === true) {
               if (entries[0].intersectionRatio === 1) {
                  //("Target is fully visible in the screen");
               } else if (entries[0].intersectionRatio > 0.3) {
                  //("More than 30% of target is visible in the screen");
               } else {
                  //("Less than 30% of target is visible in the screen");
                  if (d > 0) {
                     direct = ["99%", 0];
                  } else {
                     direct = ["-99%", 0];
                  }

                  if (!animItems[i].classList.contains("shownd")) {
                     anime({
                        targets: animItems[i],
                        translateX: direct,
                        opacity: [0, 1],
                        duration: 3000,
                        easing: "easeOutElastic(1, 1.5)",
                     });
                  }
                  animItems[i].classList.add("shownd");
               }
            } else {
               //("Target is not visible in the screen");
               if (animItems[i].classList.contains("shownd")) {
                  animItems[i].classList.remove("shownd");
               }
            }
         },
         {
            threshold: [0, 0.3, 1],
         }
      ).observe(animItems[i]);
   }

   //карусель
   let slider = tns({
      container: ".my-slider",
      items: 2, //количество для отображения
      gutter: 20, //расстояние между слайдами px
      slideBy: 2, //количество слайдов перекл за клик
      navPosition: "bottom", //расположение точек снизу
      mouseDrag: true, //смана слайдов перетаскиванием
      autoplay: true, //автолистание
      autoplayTimeout: 10000, //время между автолистанием
      autoplayButtonOutput: false, //кнопка autoplay, если autoplay=true не работает
      mode: "carousel", //режимы "carousel" | "gallery"
      speed: 1500, //скорость анимации слайдов (в "мс").
      controlsContainer: "#custom-control", //контейнер кнопок prev/next.
      //controls: false, //Управляет отображением и возможностями компонентов управления  prev/next
      //controlsPosition: "bottom",//положение элементов управления
      // nav: false,//отображение и возможности точек навигации
      edgePadding: 20, //пространство снаружи (в "px").
      loop: true, //зацикливание перемещения по слайдам
      /*    responsive: {
      0: {
         items: 1,
         nav: false,
      },
      768: {
         items: 2,
         nav: true,
      },
      1440: {
         items: 3,
      },
   }, */
   });

   //сдвиг карточек services
   function cardShift() {
      const fronts = document.querySelectorAll("#services .card-inner"),
         backs = document.querySelectorAll("#services .card-back"),
         duration = 500;

      fronts.forEach((front, i) => {
         front.querySelector("img").addEventListener("click", () => {
            //front.classList.add("is-hidden");
            //backs[i].classList.remove("is-hidden");
            pushUp(front, backs[i], duration);
         });
      });

      backs.forEach((back, i) => {
         back.addEventListener("click", () => {
            //fronts[i].classList.remove("is-hidden");
            //back.classList.add("is-hidden");
            pushDown(fronts[i], back, duration);
         });
      });
   }
   cardShift();
   function pushUp(target, targetBack, duration) {
      targetBack.classList.remove("is-hidden");
      var tl = anime.timeline({
         targets: target,
         translateY: "-100%",
         opacity: [1, 0],
         duration: duration,
         easing: "easeInOutBack",
      });
      tl.add({
         targets: targetBack,
         translateY: "-100%",
         opacity: [0, 1],
         duration: duration,
         easing: "easeInOutBack",
      });
   }
   function pushDown(target, targetBack, duration) {
      target.querySelector("img").style.pointerEvents = "none";
      var tl = anime.timeline({
         targets: target,
         translateY: "0%",
         opacity: [0, 1],
         duration: duration,
         easing: "easeInOutBack",
      });
      tl.add({
         targets: targetBack,
         translateY: "0%",
         opacity: [1, 0],
         duration: duration,
         easing: "easeInOutBack",
      });
      tl.add({
         complete: function () {
            targetBack.classList.add("is-hidden");
            target.querySelector("img").style.pointerEvents = "";
         },
      });
   }

   //поворот карточек features
   function cardRotate() {
      const cards = document.querySelectorAll("#features .card");
      cards.forEach((card) => {
         const btn = card.querySelector("button");
         btn.addEventListener("click", () => {
            roteteCard(card, 1000);
         });
      });
   }
   cardRotate();
   function roteteCard(target, duration) {
      var tl = anime.timeline({
         duration: duration,
         easing: "easeOutBounce",
      });
      tl.add({
         targets: target,
         rotateY: 180,
      });
      tl.add({
         targets: target,
         rotateY: 0,
      });
   }

   //анимация надписей цены
   function priceAnim() {
      const prices = document.querySelectorAll("#pricing .card");
      prices.forEach((price) => {
         const btn = price.querySelector("button");
         btn.addEventListener("click", () => {
            animePrice(price, 1000);
         });
      });
   }
   priceAnim();
   function animePrice(target, duration) {
      const targets = target.querySelectorAll("p");
      var tl = anime.timeline({
         duration: duration,
         easing: "easeOutBounce",
      });
      tl.add({
         targets: targets,
         translateX: ["-100%", "0"],
         scale: [1, 1],
         opacity: [0, 1],
         easing: "easeOutExpo",
         duration: 2000,
         delay: anime.stagger(200),
      });
   }
});
