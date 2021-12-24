const $ = function (selector) {
   return new $.prototype.init(selector);
};

$.prototype.init = function (selector) {
   if (!selector) {
      return this; // возвращаем пустой объект {}
   }
   // проверяем есть ли элемент на странице через tagName
   if (selector.tagName) {
      this[0] = selector;
      this.length = 1;
      return this;
   }
   // добавляем свойства в объект
   Object.assign(this, document.querySelectorAll(selector));
   this.length = document.querySelectorAll(selector).length;
   return this;
};
// добовляем в прототип возвращаемой функции init, прототип главной функции
$.prototype.init.prototype = $.prototype;

window.$ = $;

export default $;
