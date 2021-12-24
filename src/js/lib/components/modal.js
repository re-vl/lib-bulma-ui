import $ from "../core";
import maskPhone from "../services/maskPhone.js";
import "../services/just-validate.js";
import anime from "animejs/lib/anime.es.js";

$.prototype.modal = function () {
   const html = document.querySelector("html"),
      body = document.body,
      nav = document.querySelector("nav");

   // рассчитываем ширину полосы скролла
   function calcScrool() {
      let div = document.createElement("div");

      div.style.width = "100%";
      div.style.height = "50px";
      div.style.overflowY = "scroll";
      div.style.visibility = "hidden";
      document.body.appendChild(div);

      let scrollWidth = div.offsetWidth - div.clientWidth;
      div.remove();

      return scrollWidth;
   }
   let scroll = calcScrool();
   //перебираем модальные окна
   for (let i = 0; i < this.length; i++) {
      const dataTarget = this[i].getAttribute("data-target"),
         modalCont = document.querySelector(`${dataTarget} .modal-content`),
         thanksTarget = $(dataTarget).find("[data-thanks]")[0].getAttribute("data-target"),
         thanksCont = document.querySelector(`${thanksTarget} .modal-content`);
      let thanks = false,
         formValid = false;
      const duration = 500;

      // коррекция смещения при погашении полосы скролла
      const offsetCorrection = function () {
         html.classList.add("is-clipped");
         modalCont.style.transform = `translateX(${scroll / 2}px)`;
         thanksCont.style.transform = `translateX(${scroll / 2}px)`;
         body.style.marginRight = `${scroll}px`;
         nav.style.marginRight = `${scroll}px`;
      };

      // при клике на кнопку с data-target показываем модальное окно
      if (dataTarget && !thanks) {
         this[i].addEventListener("click", (e) => {
            e.preventDefault();

            $(dataTarget).addClass("is-active");
            animeModal(
               $(dataTarget)[0].querySelector(".modal-content"),
               $(dataTarget)[0].querySelector(".modal-background"),
               1
            );
            offsetCorrection();
         });
      }

      // открываем окно thanks
      function showThanks() {
         setTimeout(() => {
            $(thanksTarget).addClass("is-active");
            animeModal(
               $(thanksTarget)[0].querySelector(".modal-content"),
               $(thanksTarget)[0].querySelector(".modal-background"),
               1
            );
            offsetCorrection();

            thanks = true;
         }, duration);
         setTimeout(() => {
            closeModal();
         }, duration * 15); //закрытие окна спасибо по таймауту
      }
      //обработка формы
      if (!thanks) {
         function validate(callback) {
            //выводим маску телефона в поле, и проводим валидацию
            maskPhone(`${dataTarget} [type="tel"]`);

            //валидация формы
            new window.JustValidate(`${dataTarget} form`, {
               rules: {
                  //настройка параметров валидации
                  email: { required: true, email: true },
                  tel: { required: true },
                  checkbox: {
                     required: true,
                  },
               },
               submitHandler: function () {
                  //обработчик кнопки подтверждения
                  formValid = true;
                  //отправляем форму если капчи нет
                  if (!$(`${dataTarget} form .captcha`).length) {
                     sendForm($(`${dataTarget} form`)[0]);
                  }
               },
            });

            callback();
         }
         //проверяем наличие капчи в форме
         if ($(`${dataTarget} form .captcha`).length) {
            validate(captcha);
         } else {
            validate(() => {});
         }
      }

      //обновление картинки капчи
      const refreshCaptcha = (target) => {
         const captchaImage = target
            .closest(".captcha__image-reload")
            .querySelector(".captcha__image");
         captchaImage.src = "/PHPcaptcha/captcha.php?r=" + new Date().getUTCMilliseconds();
      };
      const captchaBtn = $(modalCont).find(".captcha__refresh");
      captchaBtn.click((e) => refreshCaptcha(e.target));

      //обработка капчи
      function captcha() {
         const form = modalCont.querySelector(`form`); //получаем форму
         form.addEventListener("submit", (e) => {
            e.preventDefault();
            try {
               //запрос на сервер
               fetch("/PHPcaptcha/process-form.php", {
                  method: "POST",
                  body: new FormData(form),
               })
                  .then((response) => {
                     //получаем ответ конвертируем json
                     return response.json();
                  })
                  .then((data) => {
                     //получаем значение input если не прошли валидацию капчи
                     const inpInv = $(modalCont).find("input.is-invalid");
                     inpInv.removeClass("is-invalid"); //удаляем класс капчи не-валидно
                     inpInv
                        .siblings(".control")
                        .find(".fa-exclamation-triangle")
                        .addClass("is-hidden"); //скрываем индикатор предупреждения
                     inpInv.siblings(".control").find(".fa-check").removeClass("is-hidden"); //показваем индикатор валидно
                     //проверяем что нет валидности
                     if (!data.success) {
                        refreshCaptcha(form.querySelector(".captcha__refresh")); //обновляем картинку капчи
                        //обрабатываем какая ошибка пришла с сервера
                        data.errors.forEach((error) => {
                           const input = form.querySelector(`[name="${error[0]}"]`);
                           if (input) {
                              input.classList.add("is-invalid"); //добовляем класс капчи не-валидно
                              input.parentNode
                                 .querySelector(".fa-exclamation-triangle")
                                 .classList.remove("is-hidden");
                              input.parentNode
                                 .querySelector(".fa-check")
                                 .classList.add("is-hidden");
                              //input.nextElementSibling.textContent = error[1]; // при показе ошибки строкой текста
                           }
                        });
                     } else if (formValid) {
                        //капча прошла валидацию
                        //проверяем что форма прошла общую валидацию
                        $(form).find(".captcha__refresh").addClass("is-invisible"); //скрываем кнопку обновления капчи
                        sendForm(form); // отправляем форму
                        //document.querySelector(".form-result").classList.remove("is-hidden"); // при показе результата строкой текста
                     }
                  });
            } catch (error) {
               console.error("Ошибка:", error);
            }
         });
      }

      function sendForm(form) {
         try {
            fetch("/PHPMailer/mail.php", {
               method: "POST",
               body: new FormData(form),
            });
         } catch (error) {
            console.error("Ошибка:", error);
         }
         $(form).find(".fa-check", ".fa-exclamation-triangle").addClass("is-hidden"); //скрываем значки
         $(form).find(".captcha__refresh").removeClass("is-invisible"); //открываем кнопку обновления
         form.reset();
         closeModal();
         showThanks();
         formValid = false;
      }

      function closeModal() {
         switch (thanks) {
            //закрываем модалку
            case false:
               setTimeout(() => {
                  $(dataTarget).removeClass("is-active");
               }, duration);
               document.querySelector(`${dataTarget} form`).reset();
               animeModal(
                  $(dataTarget)[0].querySelector(".modal-content"),
                  $(dataTarget)[0].querySelector(".modal-background"),
                  0
               );
               break;
            //закрываем модалку спасибо
            case true:
               setTimeout(() => {
                  $(thanksTarget).removeClass("is-active");
               }, duration);
               animeModal(
                  $(thanksTarget)[0].querySelector(".modal-content"),
                  $(thanksTarget)[0].querySelector(".modal-background"),
                  0
               );
               thanks = false;
               break;
         }

         //компенсация смещени
         modalCont.style.transform = `translateX(${scroll}px)`;
         thanksCont.style.transform = `translateX(${scroll}px)`;

         html.classList.remove("is-clipped"); //разрешаем скролл
         body.style.marginRight = `0px`;
         nav.style.marginRight = `0px`;
      }

      const closeElements = document.querySelectorAll(`${dataTarget} [data-close]`),
         closeThanks = document.querySelectorAll(`${thanksTarget} [data-close]`);

      function closeHandler(closeElem, background) {
         // закрываем модальное окно при клике на элемент закрытия
         closeElem.forEach((elem) => {
            $(elem).click((e) => {
               e.preventDefault();
               closeModal();
            });
         });

         // закрываем окно при клике на подложку
         $(background).click((e) => {
            if (e.target.classList.contains("modal-background")) {
               closeModal();
            }
         });
      }
      closeHandler(closeElements, dataTarget);
      closeHandler(closeThanks, thanksTarget);

      //анимация окон
      function animeModal(target, targetBackground, action) {
         if (action == 1) {
            anime({
               targets: target,
               scale: [0, 1],
               opacity: [0, 1],
               easing: "linear",
               duration: duration,
            });
            anime({
               targets: targetBackground,
               opacity: [0, 1],
               easing: "linear",
               duration: duration,
            });
         } else {
            anime({
               targets: target,
               scale: [1, 0],
               opacity: [0, 1],
               easing: "linear",
               duration: duration,
            });
            anime({
               targets: targetBackground,
               opacity: [1, 0],
               easing: "linear",
               duration: duration,
            });
         }
      }
   }
};

$("[data-modal]").modal();
