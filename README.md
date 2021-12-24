
# Оглавление

- [Оглавление](#оглавление)
- [Введение](#введение)
- [Установка и запуск](#установка-и-запуск)
- [Структура каталогов](#структура-каталогов)
- [Подключение компонентов](#подключение-компонентов)
  - [Подключение стилей](#подключение-стилей)
  - [Подключение скриптов](#подключение-скриптов)
- [Методы](#методы)
  - [Методы действий (html(), eq(), index(), find(), closest(), siblings())](#методы-действий-html-eq-index-find-closest-siblings)
  - [Методы атрибутов (setAttrib(), removeAttrib(), toggleAttrib(), getAttrib(), hasAttrib())](#методы-атрибутов-setattrib-removeattrib-toggleattrib-getattrib-hasattrib)
  - [Методы классов (addClass(), removeClass(), toggleClass(), containsClass())](#методы-классов-addclass-removeclass-toggleclass-containsclass)
  - [Методы обработчики (on(), off(), click())](#методы-обработчики-on-off-click)
  - [Прокрутка страницы по пунктам меню или до верха](#прокрутка-страницы-по-пунктам-меню-или-до-верха)
    - [Разметка скролла](#разметка-скролла)
    - [Вызов скролла](#вызов-скролла)
- [Компоненты](#компоненты)
  - [Аккордеон (accordion)](#аккордеон-accordion)
    - [Разметка аккордиона](#разметка-аккордиона)
    - [Вызов аккордиона](#вызов-аккордиона)
  - [Бургер меню (navbar-burger)](#бургер-меню-navbar-burger)
    - [Разметка бургера](#разметка-бургера)
    - [Вызов бургер меню](#вызов-бургер-меню)
  - [Выпадающий список (Dropdown)](#выпадающий-список-dropdown)
    - [Разметка выпадающего списка](#разметка-выпадающего-списка)
    - [Вызов dropdown](#вызов-dropdown)
  - [Модальные окна (modal)](#модальные-окна-modal)
    - [Разметка modal](#разметка-modal)
    - [Вызов modal](#вызов-modal)
  - [Капча](#капча)
    - [Разметка капчи](#разметка-капчи)
    - [Вызов капчи](#вызов-капчи)
  - [Вкладки (tabs)](#вкладки-tabs)
    - [Разметка tabs](#разметка-tabs)
    - [Вызов tabs](#вызов-tabs)

---
[:arrow_heading_up:](#оглавление)

---
# Введение
Библиотека для frontend разработки выполнена на базе библиотеки из курса <a href="https://www.udemy.com/share/102HLq3@__qZ8C3oqK1BqZvc3BRdwNkyHXYFS_TvnQNPjDxuvm-awO2Ze8yy5DXhJoqj9t1o5w==/" target="_blank">Ивана Петриченко</a>. 
В библиотеке используются следующие компоненты:  
 - css фреймворк <a href="https://bulma.io" target="_blank">Bulma</a>; 
 - слайдер <a href="https://github.com/ganlanyuan/tiny-slider" target="_blank">Tiny Slider</a>;
 - библиотека <a href="https://animejs.com" target="_blank">Anime.js</a>; 
 - библиотека <a href="https://github.com/horprogs/Just-validate" target="_blank">JustValidate</a>.

Демонстрационная страница библиотеки https://re-vl.github.io/lib-bulma-ui-demo/

---
[:arrow_heading_up:](#оглавление)

---

# Установка и запуск

Скопируйте архив и распакуйте в папку проекта, запустите команду npm install. После установки пакетов, для начала работы с проектом запустите команду gulp, планировщик собирает рабочий вариант проекта из исходников папки src в рабочую папку проекта dist. При запуске команды gulp prod планировщик производит минификацию файлов проекта из папки dist и записывает их в папку prod.

---
[:arrow_heading_up:](#оглавление)

---

# Структура каталогов

Папки src
```
+---css
+---fonts
+---icons
+---img
+---js
|   \---lib
|       +---components
|       +---modules
|       \---services
\---sass
    +---base
    +---components
    +---elements
    +---form
    +---grid
    +---helpers
    +---layout
    \---utilities

```
папки dist
```
+---base
+---icons
+---img
+---PHPcaptcha
+---PHPMailer
```

---
[:arrow_heading_up:](#оглавление)

---

# Подключение компонентов
## Подключение стилей
Производится в файле \src\sass\style.sass
```
@import "utilities/_all"
@import "base/_all"
@import "elements/_all"
@import "form/_all"
@import "components/_all"
@import "grid/_all"
@import "helpers/_all"
@import "layout/_all"
```
Если какой-то стиль не используетя в проекте его можно отключить закоментировав в файлах сбора.

## Подключение скриптов

Производится в файле \src\js\lib\lib.js
```
import "./components/burger";
import "./components/dropdown";
import "./components/modal";
import "./components/tab";
import "./components/accordion";

import "./services/requests";
import "./modules/scroll";
```
Отключается любой компонет скрипта аналогично стилям.

---
[:arrow_heading_up:](#оглавление)

---

# Методы

(файл \src\js\lib\core.js)

$() - базовая функция выбора, позволяет производить выбор элементов по селектору, $("selector"). Производит выбор как одного элемента так и множества с одним и тем же селектором.

---
[:arrow_heading_up:](#оглавление)

---

## Методы действий (html(), eq(), index(), find(), closest(), siblings())

( файл \src\js\lib\modules\actions.js)

**.html("contens")** - изменение или получение содержания html элемента $("selector").html("contens")
если content не передан получаем содержимое $("selector").html()

**.eq(num)** - получение элемента по номеру $("selector").eq(num) где (num 1,2,3, ...)

**.index()** - получение номера элемента по порядку, до одного общего родителя $("child_selector").index()

**.find("selector")** - получение элемента по селектору в пределах родителя $("parent_selector").find("finding_elem_selector")

**.closest("selector")** - получение ближайшего родительского элемента по селектору $("child_selector").closest("finding_parent_selector")

**.siblings()** - получение содедних элементов внутри родительского блока исключая сам блок вызова $("selector").siblings()

**.getElems()** - Получение массива элементов по селектору $("selector").getElems()

---
[:arrow_heading_up:](#оглавление)

---

## Методы атрибутов (setAttrib(), removeAttrib(), toggleAttrib(), getAttrib(), hasAttrib())

(файл \src\js\lib\modules\attributes.js )

**.setAttrib("attribut")** - установка атрибута

**.removeAttrib("attribut")** - удаление атрибута

**.toggleAttrib("attribut")** - переключение атрибута

**.getAttrib("attribut")** - получение атрибута

**.hasAttrib("attribut")** - наличие атрибута

---
[:arrow_heading_up:](#оглавление)

---

## Методы классов (addClass(), removeClass(), toggleClass(), containsClass())

(файл \src\js\lib\modules\classes.js )

**.addClass()** - добавление классов

**.removeClass()** - удаление классов

**.toggleClass()** - переключение классов

**.containsClass()** - проверка наличия класса
 
формат вызова $("selector").addClass("class1", "class2", …)

---
[:arrow_heading_up:](#оглавление)

---

## Методы обработчики (on(), off(), click())

(файл \src\js\lib\modules\handlers.js)

**.on(eventName, callback)** - назначение обработчика события

**.off(eventName, callback)** - удаление обработчика события

**.click(handler)** - назначение обработчика события клик

формат вызова $("selector").on("eventName", callbackFunctionName);

---
[:arrow_heading_up:](#оглавление)

---

## Прокрутка страницы по пунктам меню или до верха
(файл \src\js\lib\modules\scroll.js)

### Разметка скролла

Для пунктов меню добавляем класс refer
```
<div class="navbar-end">
    <a class="navbar-item refer" href="#refer1"> Title refer1 </a>
    <a class="navbar-item refer" href="#refer2"> Title refer2 </a>
    ***
</div>
```
Для элементов к которым преминяем скролл добавляем соответствующий id - refer1, refer2 ...
```
<section class="hero scroll" id="refer1">
</section>
<section class="hero scroll" id="refer2">
</section>
```
При отсутствии меню или для скролла до верха страницы установить вверху страницы id="scrollUp"
```
<nav class="navbar is-transparent is-fixed-top" role="navigation" aria-label="main navigation" id="scrollUp">
```
Элемент при нажатии на который производится скролл с классом up внизу страницы
```
<div class="content up">
    <a href="#"><span class="icon"> <i class="fas fa-angle-up"></i> </span></a>
</div>
```

### Вызов скролла
Осуществляется непосредственно из \src\js\lib\modules\scroll.js при помощи $(".navbar").scrolling();
Скрипт перебирает ссылки меню с классом refer извлекает из них id и при клике на пункт производит скролл страницы к соответствующему элементу

Для случая scroll-Up вызов $(".up").scrolling(); 
Кнопка скролаа скрыта и покаывается после 1250px прокрутки (условие в скрипте window.pageYOffset > 1250)

---
[:arrow_heading_up:](#оглавление)

---


# Компоненты

## Аккордеон (accordion)
(файл \src\js\lib\components\accordion.js)

### Разметка аккордиона
```
<div class="accordion column is-three-fifths-desktop is-offset-one-fifth-desktop">
    <header class="accordion-header button box is-large mb-0 is-shadowless is-flex is-justify-content-space-between">
      <span>Accordion title 1</span>
      <span class="icon">
          <i class="fas fa-angle-down"></i>
      </span>
    </header>
    <div class="accordion-content box">
      <div class="accordion-inner is-size-4 is-hidden">
        Dropdown content
        ***
      </div>
    </div>

    <header class="accordion-header button box is-large mb-0 is-shadowless is-flex is-justify-content-space-between">
      <span>Accordion title 2</span>
      <span class="icon">
          <i class="fas fa-angle-down"></i>
      </span>
    </header>
    <div class="accordion-content box">
      <div class="accordion-inner is-size-4 is-hidden">
        Dropdown content 2
        ***
      </div>
    </div>

    ***
</div> 
```

### Вызов аккордиона

Осуществляется непосредственно из \src\js\lib\components\accordion.js при помощи $(".accordion").accordion();

---
[:arrow_heading_up:](#оглавление)

---

## Бургер меню (navbar-burger)
(файл \src\js\lib\components\burger.js)
### Разметка бургера

```
<div class="navbar-brand">
  <p class="navbar-item is-size-4 has-text-weight-bold ml-6">Title burger</p>
  <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="#nav-menu-burger">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
  </a>
</div>
<div class="navbar-menu has-text-centered is-hidden-desktop" id="nav-menu-burger" style="position: absolute; width: 100%>
  <a class="navbar-item refer" href="#IB1">  Item burger 1</a>
  <a class="navbar-item refer" href="#IB2"> Item burger 2 </a>
  ***
</div>
```
### Вызов бургер меню

Осуществляется непосредственно из \src\js\lib\components\burger.js при помощи $(".navbar-burger").burger();

---
[:arrow_heading_up:](#оглавление)

---

## Выпадающий список (Dropdown)
(файл \src\js\lib\components\dropdown.js)
### Разметка выпадающего списка
```
<div class="dropdown mr-6" id="dropdown-1">
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>Dropdown title</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu-1" role="menu">
      <div class="dropdown-content">
          <a href="#" class="dropdown-item"> Dropdown item 1</a>
          <a href="#" class="dropdown-item"> Dropdown item 2 </a>
          ***
          <hr class="dropdown-divider" />
          <a href="#" class="dropdown-item"> Dropdown item 2_1 </a>
          ***
      </div>
    </div>
</div>
```
### Вызов dropdown
Осуществляется непосредственно из \src\js\lib\components\dropdown.js при помощи $("#dropdown-1").dropdown();

---
[:arrow_heading_up:](#оглавление)

---

## Модальные окна (modal)
(файл \src\js\lib\components\modal.js)<br/>
В обработчике модального окна используются PHPcaptcha, для проверки на бота, и PHPmailer для отправки формы по электронной почте. Соответствующие папки расположенны в каталоге dist и должны быть скопированны в корень сайта. Настройки php обработчиков подробно расписаны в коде mail.php и captcha.php
### Разметка modal
```
<div class="modal" id="modal_target">
    <div class="modal-background"></div>
    <div class="modal-content has-background-white p-6">
      <button class="delete is-medium" data-close></button>
      <h3 class="title mb-6">Header modal</h3>
      <form class="form">
          <div class="field">
            <label class="label">Name</label>
            <div class="control has-icons-left has-icons-right">
                <input class="input" type="text" name="name" placeholder="Name" />
                <span class="icon is-small is-left">
                  <i class="fas fa-user"></i>
                </span>
                <span class="icon is-small is-right">
                  <i class="fas fa-check has-text-primary is-hidden"></i>
                  <i class="fas fa-exclamation-triangle has-text-danger is-hidden"></i>
                </span>
            </div>
          </div>
          <div class="field">
            <label class="label">Email</label>
            <p class="control has-icons-left has-icons-right">
                <input class="input" data-validate-field="email" type="email" name="email" placeholder="Email"/>
                <span class="icon is-small is-left">
                  <i class="fas fa-envelope"></i>
                </span>
                <span class="icon is-small is-right">
                  <i class="fas fa-check has-text-primary is-hidden"></i>
                  <i class="fas fa-exclamation-triangle has-text-danger is-hidden"></i>
                </span>
            </p>
          </div>
          <div class="mt-6 has-text-centered">
            <button class="button is-link" data-thanks data-target="#modal_thanks">
                Send
            </button>
          </div>
      </form>
    </div>
</div>
```
### Вызов modal
Осуществляется непосредственно из \src\js\lib\components\modal.js при помощи $("[data-modal]").modal();

Разметка на элементе страницы для вызова окна modal должна включать data-modal data-target="#modal_target" соответствующий вызываемому окну
```
<button class="button custom-btn is-info is-large" data-modal data-target="#modal_target">
  Subscribe
</button>
```
В примере вызов скрипта $("[data-modal]").modal(), находит [data-modal] извлекает data-target="#modal_target" и работает с модальным окном с id="modal_target"
По завершении обработки модального окна вызывается окно "спасибо" при помощи data-thanks data-target="#modal_thanks"

Пример разметки окна "спасибо"
```
<div class="modal" id="modal_thanks">
    <div class="modal-background"></div>
    <div class="modal-content">
      <section class="modal-card-body">
          <p class="is-size-3 has-text-centered">Thank you for ...</p>
          <div class="has-text-centered mt-5">
            <button class="button is-info" data-close>Close</button>
          </div>
      </section>
    </div>
</div>
```

---
[:arrow_heading_up:](#оглавление)

---

## Капча
В библиотеке используется php каптча от <a href="https://github.com/itchief/captcha" target="_blank">itchief</a>   
### Разметка капчи
Разметка должна быть помещана внутрь формы в которой используется капча.
<br/><br/>
```
<div class="captcha">
  <div class="captcha__image-reload is-flex is-align-items-center is-justify-content-end my-3">
      <img class="captcha__image" src="/PHPcaptcha/captcha.php" width="132" alt="captcha"/>
      <figure class="captcha__refresh button is-clickable ml-5">
        <span class="icon">
            <i class="fas fa-sync fa-lg"></i>
        </span>
      </figure>
  </div>
  <div class="captcha__group">
      <label for="captcha">Код, изображенный на картинке</label>
      <p class="control has-icons-right">
        <input class="input is-inline-block" type="text" name="captcha" id="captcha"/>
        <span class="icon is-small is-right">
            <i class="fas fa-check has-text-primary is-hidden"></i>
            <i class="fas fa-exclamation-triangle has-text-danger is-hidden"></i>
        </span>
      </p>
  </div>
</div>
```
### Вызов капчи

Производится совместно с функцией validate(captcha) и соответственно captcha() /строки 108 и 125 метода modal/, при наличии капчи в форме.

---
[:arrow_heading_up:](#оглавление)

---

## Вкладки (tabs)
(файл \src\js\lib\components\tab.js)
### Разметка tabs
```
<div class="container tab-panel" id="tabs1">
  <div class="tabs is-toggle is-large is-centered my-6">
    <ul>
      <li class="tab-item is-active">
          <a>
            <span class="icon is-normal"><i class="fas fa-coins"></i></span>
            <span>Header tab 1</span>
          </a>
      </li>

      <li class="tab-item">
          <a>
            <span class="icon is-normal"><i class="fas fa-coins"></i></span>
            <span>Header tab 2</span>
          </a>
      </li>

      ***
    </ul>
  </div>

  <div class="columns tab-content">
    <div class="column">
      <div class="card has-text-centered pb-6">
        <header class="card-header has-background-danger p-6">
          <p class="card-header-title is-size-3 is-justify-content-center">Header card 1</p>
        </header>
        <div class="card-content">
          Content card 1
        </div>
        <button class="button is-large is-info is-outlined">Button card 1</button>
      </div>
    </div>

    <div class="column">
      <div class="card has-text-centered pb-6">
        <header class="card-header has-background-danger p-6">
          <p class="card-header-title is-size-3 is-justify-content-center">Header card 2</p>
        </header>
        <div class="card-content">
          Content card 2
        </div>
        <button class="button is-large is-info is-outlined">Button card 2</button>
      </div>
    </div>

    ***
  </div>
</div>
```
### Вызов tabs
Осуществляется непосредственно из \src\js\lib\components\tab.js при помощи $("#tabs1").tab();

---
[:arrow_heading_up:](#оглавление)

---