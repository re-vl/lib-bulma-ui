import $ from "../core";

/* формат вызова функций
   $("selector").toggleAttrib("data-one", "111", "data-two", "");
*/
//  Установка атрибута
$.prototype.setAttrib = function (...attr) {
   for (let i = 0; i < this.length; i++) {
      if (!attr) {
         return this;
      } else {
         for (let j = 0; j < attr.length; j = j + 2) {
            this[i].setAttribute(attr[j], attr[j + 1]);
         }
      }
   }
   return this;
};

//  Удаление атрибута
$.prototype.removeAttrib = function (...attr) {
   for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < attr.length; j = j + 2) {
         this[i].setAttribute(attr[j], attr[j + 1]);
      }
   }
   return this;
};

//  Переключение атрибута
$.prototype.toggleAttrib = function (...attr) {
   for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < attr.length; j = j + 2) {
         if (this[i].hasAttribute(attr[j])) {
            this[i].removeAttribute(attr[j]);
         } else if (!this[i].hasAttribute(attr[j])) {
            this[i].setAttribute(attr[j], attr[j + 1]);
         }
      }
   }
   return this;
};

// Получение атрибутa
$.prototype.getAttrib = function (attribName) {
   return this[0].getAttribute(attribName);
};

// Проверка наличия атрибутов
$.prototype.hasAttrib = function (attribName) {
   return this[0].hasAttribute(attribName);
};
