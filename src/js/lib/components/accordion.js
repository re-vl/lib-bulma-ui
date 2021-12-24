import $ from "../core";
import anime from "animejs/lib/anime.es.js";

$.prototype.accordion = function () {
   for (let i = 0; i < this.length; i++) {
      //получаем элементы и заносим в массивы
      const headers = Array.from($(this[i]).find(".accordion-header")),
         contents = Array.from($(this[i]).find(".accordion-content")),
         inner = Array.from($(this[i]).find(".accordion-content .accordion-inner")),
         icons = Array.from($(this[i]).find(".accordion-header .icon"));

      //устанавливаем доп стили на выпадающий элемент
      contents.forEach((content) => {
         content.style.cssText = "overflow: hidden; max-height: auto; margin: 0; padding: 0 32px";
      });
      //перебираем заголовки навещиваем слушатель клика на заголовок
      headers.forEach((header, j) => {
         header.addEventListener("click", () => {
            header.classList.toggle("has-text-info");
            //проверяем скрыт ли внутрунний выпадающий элемент
            if (inner[j].classList.contains("is-hidden")) {
               animeAccordion(inner[j], contents[j], "down"); //анимируем открытие элемента
               animeAccordion(icons[j], "", "", [0, 180]); //анимируем разворот индикатоар
            } else {
               animeAccordion(inner[j], contents[j], "up"); //анимируем закрытие элемента
               animeAccordion(icons[j], "", "", [180, 360]); //анимируем разворот индикатоар
            }
         });
      });

      function animeAccordion(target, content, dir, angel) {
         const duration = 400;
         let maxHeight, py, mb;

         //проверяем направление движения элемента
         if (dir == "down") {
            target.classList.toggle("is-hidden"); //переключаем на видимость
            maxHeight = ["0px", `${$(target)[0].scrollHeight + "px"}`]; //задаем нач и конечную высоту элемента
            py = "32px"; //задаем отступы по вертикали внутри
            mb = "32px"; //задаем отступ снизу снаружи
         } else if (dir == "up") {
            maxHeight = [`${$(target)[0].scrollHeight + "px"}`, "0px"]; //задаем нач и конечную высоту элемента
            py = "0px"; //обнуляем отступы по вертикали внутри
            mb = "0px"; //обнуляем отступ по вертикали снизу снаружи
            setTimeout(() => {
               target.classList.toggle("is-hidden");
            }, duration); //убираем видимость по завершении анимации
         }

         if (!angel) {
            //анимируем движение элемента
            anime({
               targets: target,
               duration: duration,
               maxHeight: maxHeight,
               easing: "linear",
            });
            //анимируем стилизацию
            anime({
               targets: content,
               duration: duration,
               paddingTop: py,
               paddingBottom: py,
               marginBottom: mb,
               easing: "linear",
            });
         }
         //анимируем поворот стрелки
         if (angel) {
            anime({
               targets: target,
               duration: duration,
               rotateZ: angel,
               easing: "easeInOutSine",
            });
         }
      }
   }
};

$(".accordion").accordion();
