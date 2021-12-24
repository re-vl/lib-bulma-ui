import $ from "../core";

// изменение или получение содержания html элемента $("selector").html("contens")
// если  content не передан получаем содержимое $("selector").html()

$.prototype.html = function (content) {
   for (let i = 0; i < this.length; i++) {
      if (content) {
         this[i].innerHTML = content;
      } else {
         return this[i].innerHTML;
      }
   }

   return this;
};

// получение элемента по номеру $("selector").eq(num) (num 1,2,3, ...)
$.prototype.eq = function (num) {
   const swap = this[num];
   const objLength = Object.keys(this).length;

   for (let i = 0; i < objLength; i++) {
      delete this[i];
   }

   this[0] = swap;
   this.length = 1;
   return this;
};

// получение номера элемента по порядку, до одного общего родителя
//$("child_selector").index()
$.prototype.index = function () {
   const parent = this[0].parentNode;
   const childs = [...parent.children];

   const findMyIndex = (item) => {
      return item == this[0];
   };

   return childs.findIndex(findMyIndex);
};

// получение элемента по селектору в пределах родителя
//$("parent_selector").find("finding_elem_selector")
$.prototype.find = function (selector) {
   let numberOfItems = 0,
      counter = 0;

   const copyObj = Object.assign({}, this);

   for (let i = 0; i < copyObj.length; i++) {
      const arr = copyObj[i].querySelectorAll(selector);
      if (arr.length == 0) {
         continue;
      }

      for (let j = 0; j < arr.length; j++) {
         this[counter] = arr[j];
         counter++;
      }

      numberOfItems += arr.length;
   }

   this.length = numberOfItems;

   const objLength = Object.keys(this).length;
   for (; numberOfItems < objLength; numberOfItems++) {
      delete this[numberOfItems];
   }

   return this;
};

// получение ближайшего родительского элемента по селектору
//$("child_selector").closest("finding_parent_selector")
$.prototype.closest = function (selector) {
   let counter = 0;

   for (let i = 0; i < this.length; i++) {
      if (this[i].closest(selector) === null) {
         this[i].classList.add("Parent-not-found!");
      } else {
         this[i] = this[i].closest(selector);
         counter++;
      }
   }

   const objLength = Object.keys(this).length;
   for (; counter < objLength; counter++) {
      delete this[counter];
   }

   return this;
};

// получение содедних элементов внутри родительского блока
// исключая сам блок вызова $("selector").siblings()
$.prototype.siblings = function () {
   let numberOfItems = 0;
   let counter = 0;

   const copyObj = Object.assign({}, this);

   for (let i = 0; i < copyObj.length; i++) {
      const arr = copyObj[i].parentNode.children;

      for (let j = 0; j < arr.length; j++) {
         if (copyObj[i] === arr[j]) {
            continue;
         }

         this[counter] = arr[j];
         counter++;
      }

      numberOfItems += arr.length - 1;
   }

   this.length = numberOfItems;

   const objLength = Object.keys(this).length;
   for (; numberOfItems < objLength; numberOfItems++) {
      delete this[numberOfItems];
   }

   return this;
};

// Получение массива элементов по селектору
$.prototype.getElems = function (selector) {
   let elems = [];
   for (let i = 0; i < this.length; i++) {
      elems[i] = document.querySelector(this[i].getAttribute(selector));
   }
   return elems;
};
