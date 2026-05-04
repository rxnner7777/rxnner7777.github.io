# rXnner Portfolio

## Как открыть сайт
Открой файл `index.html` в браузере.

## Где добавлять новые работы
Все работы добавляются в файле:

`index.html`

### Для СНГ
Найди комментарий:

`<!-- СНГ РАБОТЫ ДОБАВЛЯТЬ СЮДА -->`

И вставляй новый блок рядом с уже существующими карточками.

### Для International
Найди комментарий:

`<!-- INTERNATIONAL РАБОТЫ ДОБАВЛЯТЬ СЮДА -->`

И вставляй новый блок рядом с уже существующими карточками.

## Как добавить новую работу

1. Закинь новое превью в папку:

`assets/images/`

Например:

`new-work.jpg`

2. Скопируй этот блок:

```html
<article class="work-card" data-title="НАЗВАНИЕ РОЛИКА" data-link="ССЫЛКА НА РОЛИК" data-img="assets/images/new-work.jpg">
  <button class="thumb-button" type="button" aria-label="Open thumbnail">
    <img src="assets/images/new-work.jpg" alt="НАЗВАНИЕ РОЛИКА">
  </button>
  <a class="video-title" href="ССЫЛКА НА РОЛИК" target="_blank" rel="noopener">НАЗВАНИЕ РОЛИКА</a>
</article>
```

3. Замени:
- `НАЗВАНИЕ РОЛИКА`
- `ССЫЛКА НА РОЛИК`
- `assets/images/new-work.jpg`

4. Сохрани файл и загрузи изменения на GitHub.


## Как включить автоматические просмотры YouTube

В файле `index.html` найди:

```html
window.YOUTUBE_API_KEY = "";
```

Вставь свой YouTube Data API ключ между кавычками:

```html
window.YOUTUBE_API_KEY = "ТВОЙ_API_KEY";
```

После этого сайт будет автоматически получать просмотры роликов с YouTube и показывать их справа от названия ролика.

Важно: если сайт статический на GitHub Pages, API key будет виден в коде сайта. Для портфолио это нормально как быстрый вариант, но позже лучше перенести запросы на backend/serverless.
