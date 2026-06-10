# 🎵 Мьюзиканто — Music Platform Client

Веб-клиент музыкальной платформы. Слушай музыку без границ.

Frontend на **Next.js 16 (App Router)** и **React 19** для бэкенда [music-platform-api](https://github.com/DaniilKalts/music-platform-api).

---

### ✨ Возможности

- 🎧 **Каталог и проигрыватель**
    - Главная с подборкой треков и жанрами
    - Глобальный плеер: play/pause, перемотка, очередь, следующий/предыдущий
    - Прослушивание трека с записью в историю
- 🔍 **Поиск**
    - Живой поиск по названию, исполнителю, альбому и жанру
- 📻 **Плейлисты**
    - Создание, переименование, удаление через диалог
    - Добавление и удаление треков из контекстного меню
    - Лимит плейлистов для FREE-подписки
- ❤️ **Избранное и история**
    - Лайк/анлайк трека (лимит для FREE)
    - Лента прослушанного
- 🔐 **Аккаунты и доступ**
    - Регистрация и вход на отдельной странице `/login`
    - JWT (access + refresh) с прозрачным авто-обновлением токена
    - **Гостевой режим:** каталог можно слушать без входа, действия (плейлисты, избранное, профиль) требуют авторизации
- 🛡️ **Админ-панель (роль ADMIN)**
    - Загрузка треков (`multipart/form-data`)
    - Редактирование и удаление треков
    - Управление подпиской пользователей
- 🎨 **Интерфейс**
    - Тёмная тема с бирюзовым акцентом
    - Адаптивная вёрстка: десктоп-сайдбары и мобильная нижняя навигация
    - Тосты-уведомления

---

### 🛠 Технологический стек

| Категория | Технологии |
|---|---|
| **Язык** | TypeScript 5 |
| **Фреймворк** | Next.js 16 (App Router, standalone output) |
| **UI** | React 19, React DOM 19 |
| **Стили** | Tailwind CSS 4 (`@tailwindcss/postcss`), PostCSS, Autoprefixer |
| **Состояние** | Zustand 5 |
| **Иконки** | lucide-react |
| **Шрифты** | `@fontsource/inter` |
| **Утилиты** | clsx, tailwind-merge |
| **Линтинг** | ESLint 9 (`eslint-config-next`) |
| **Контейнеризация** | Docker (multi-stage, standalone) |

---

### 🏗 Архитектура

Проект следует методологии **Feature-Sliced Design (FSD)** — код разделён на слои по зоне ответственности, зависимости направлены сверху вниз (`app → widgets → features → entities → shared`).

```
.
├── public/                                  # Статика (иконки, изображения)
├── src/
│   ├── app/                                 # Слой роутинга (Next.js App Router)
│   │   ├── layout.tsx                       #   Корневой layout (метаданные, шрифты, AppShell)
│   │   ├── page.tsx                         #   Главная — каталог
│   │   ├── search/                          #   Поиск
│   │   ├── library/                         #   Библиотека / плейлисты
│   │   ├── playlist/[id]/                   #   Страница плейлиста
│   │   ├── favorites/                       #   Избранное
│   │   ├── history/                         #   История прослушиваний
│   │   ├── profile/                         #   Профиль пользователя
│   │   ├── admin/                           #   Админ-панель
│   │   ├── login/                           #   Вход и регистрация
│   │   └── styles/globals.css               #   Глобальные стили и тема (CSS-переменные)
│   ├── widgets/                             # Композиционные блоки страниц
│   │   ├── AppShell/                        #   Каркас приложения
│   │   ├── Sidebar/ RightSidebar/           #   Десктоп-сайдбары
│   │   ├── TopNav/                          #   Верхняя навигация
│   │   └── MobileNav/                       #   Мобильная нижняя навигация
│   ├── features/                            # Пользовательские сценарии
│   │   ├── auth/                            #   Стор + AuthGate / AuthInit / AuthRedirect
│   │   ├── player/                          #   Стор плеера + PlayerBar
│   │   └── playlists/                       #   Стор + диалог управления плейлистами
│   ├── entities/                            # Бизнес-сущности
│   │   ├── track/                           #   TrackRow, TrackMenu
│   │   └── types.ts                         #   Track, User, Genre, Playlist, History…
│   └── shared/                              # Переиспользуемый код без бизнес-логики
│       ├── api/                             #   api.ts (fetch + токены + refresh), services.ts
│       ├── lib/                             #   cn (clsx+merge), limits (лимиты FREE)
│       └── ui/                              #   Logo, Toaster, toast
├── next.config.ts                           # Конфиг Next.js (output: "standalone")
├── Dockerfile                               # Multi-stage сборка
├── .dockerignore
└── package.json
```

#### Ключевые принципы

- **Feature-Sliced Design.** Каждый слой знает только о нижележащих: `widgets` собирают `features`, `features` оперируют `entities`, всё опирается на `shared`. Никаких импортов «вверх» или вбок между фичами.
- **Тонкий слой API.** Вся работа с сетью изолирована в `shared/api`: `api.ts` — низкоуровневый `apiFetch` (заголовки, авторизация, парсинг), `services.ts` — типизированные методы по доменам (`authApi`, `trackApi`, `playlistApi` …).
- **Прозрачный refresh токенов.** При `401` клиент один раз пытается обновить пару токенов через `/auth/refresh` и повторяет запрос; параллельные запросы ждут единый промис обновления. Токены хранятся в `localStorage`.
- **Состояние на Zustand.** Глобальное состояние (текущий пользователь, плеер, плейлисты) — в маленьких сторах внутри соответствующих `features`, без проп-дриллинга.
- **Auth-гейтинг.** Гость видит и слушает каталог; защищённые действия обёрнуты в `AuthGate` / `AuthRedirect` и ведут на `/login`.
- **Конфигурация через окружение.** Адрес бэкенда и лимиты FREE задаются `NEXT_PUBLIC_*` переменными и инлайнятся в бандл при сборке.

---

### ⚙️ Конфигурация

Клиент настраивается через переменные окружения. Переменные с префиксом `NEXT_PUBLIC_` попадают в браузерный бандл **во время сборки** — задавайте их до `npm run build` (или как `--build-arg` в Docker).

Создайте файл `.env.local` в корне проекта:

```bash
# ─── Бэкенд ───────────────────────────────────────────────────
# Базовый URL music-platform-api (с префиксом /api/v1)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# ─── Лимиты FREE-подписки (для подсказок в UI) ───────────────
# Должны совпадать со значениями на бэкенде
NEXT_PUBLIC_FREE_PLAYLIST_LIMIT=3      # Максимум плейлистов
NEXT_PUBLIC_FREE_FAVORITES_LIMIT=20    # Максимум треков в избранном
```

| Переменная | По умолчанию | Описание |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Базовый URL REST API бэкенда |
| `NEXT_PUBLIC_FREE_PLAYLIST_LIMIT` | `3` | Лимит плейлистов для FREE (подсказки в UI) |
| `NEXT_PUBLIC_FREE_FAVORITES_LIMIT` | `20` | Лимит избранного для FREE (подсказки в UI) |

> **Важно:** клиентские лимиты — только для удобства интерфейса. Источник истины и реальное применение лимитов — на стороне бэкенда.

---

### 🚀 Установка и запуск

#### Требования

- [Node.js 20+](https://nodejs.org/) (рекомендуется 22/24 LTS)
- Запущенный [music-platform-api](https://github.com/DaniilKalts/music-platform-api) на `http://localhost:8080`

#### 1. Клонировать репозиторий

```bash
git clone https://github.com/DaniilKalts/music-platform-client.git
cd music-platform-client
```

#### 2. Установить зависимости

```bash
npm install
```

#### 3. Настроить окружение

```bash
# создайте .env.local и при необходимости поправьте NEXT_PUBLIC_API_URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1" > .env.local
```

#### 4. Запустить дев-сервер

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

#### 5. Продакшен-сборка (без Docker)

```bash
npm run build
npm run start
```

---

### 🐳 Запуск через Docker (пошагово)

Самый простой способ. Node.js ставить **не нужно** — всё собирается внутри контейнера. Нужен только установленный Docker.

#### Шаг 0. Проверить, что Docker установлен

```bash
docker --version
```

Если команда выдала версию (например `Docker version 27.x`) — всё ок. Если «command not found» — сначала [установите Docker](https://docs.docker.com/engine/install/) и запустите его.

#### Шаг 1. Перейти в папку проекта

Откройте терминал в корне проекта (там, где лежит файл `Dockerfile`):

```bash
cd music-platform-client
```

Проверить, что вы в нужной папке:

```bash
ls Dockerfile
```

Должно вывести `Dockerfile`. Если «No such file» — вы не в той папке.

#### Шаг 2. Собрать образ

Скопируйте и выполните команду целиком (одной строкой или с переносами `\`):

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 \
  -t music-platform-client .
```

- `--build-arg NEXT_PUBLIC_API_URL=...` — адрес бэкенда. Меняется **только здесь, на этапе сборки** (см. ⚠️ ниже).
- `-t music-platform-client` — имя образа.
- `.` (точка в конце) — обязательна, означает «собирай из текущей папки». **Не забудьте её.**

Сборка идёт 1–3 минуты. Успех — последняя строка вида `naming to ... music-platform-client`.

#### Шаг 3. Запустить контейнер

```bash
docker run --rm -p 3000:3000 music-platform-client
```

- `-p 3000:3000` — пробрасывает порт наружу.
- `--rm` — удалит контейнер после остановки (чтобы не копились).

Когда в логах появится `Ready` — откройте в браузере 👉 **[http://localhost:3000](http://localhost:3000)**.

#### Шаг 4. Остановить

Нажмите `Ctrl + C` в терминале, где запущен контейнер.

---

#### ⚠️ Важно: про адрес бэкенда

1. **Бэкенд должен быть запущен.** Клиент сам по себе ничего не играет — он ходит в [music-platform-api](https://github.com/DaniilKalts/music-platform-api). Если API не поднят, страницы откроются, но данные не загрузятся (сетевая ошибка). Сначала поднимите API на `http://localhost:8080`.

2. **Адрес API вшивается при сборке, а не при запуске.** Поэтому он передаётся через `--build-arg` на Шаге 2, а **не** через `-e` на Шаге 3. Если поменяли адрес — **пересоберите образ** (повторите Шаг 2).

3. **Если API запущен в Docker (а не напрямую на компьютере),** то `localhost` внутри контейнера клиента указывает на сам контейнер, а не на ваш компьютер. В этом случае на Шаге 2 укажите вместо `localhost`:
   - `http://host.docker.internal:8080/api/v1` — если API крутится на вашей машине / в другом контейнере:
     ```bash
     docker build \
       --build-arg NEXT_PUBLIC_API_URL=http://host.docker.internal:8080/api/v1 \
       -t music-platform-client .
     ```

---

#### 🧰 Если что-то пошло не так

| Симптом | Что делать |
|---|---|
| `docker: command not found` | Docker не установлен — см. Шаг 0 |
| `Cannot connect to the Docker daemon` | Docker установлен, но не запущен — запустите Docker Desktop / `sudo systemctl start docker` |
| Сборка падает на `npm ci` | Проверьте интернет; перезапустите Шаг 2 |
| `port is already allocated` | Порт 3000 занят. Запустите на другом порту: `docker run --rm -p 3001:3000 music-platform-client` → откройте `http://localhost:3001` |
| Страница открылась, но пусто / ошибки | Не запущен бэкенд, либо неверный `NEXT_PUBLIC_API_URL` — см. блок «⚠️ Важно» выше |

> 💡 **Совет.** Для разовой проверки без Docker проще запустить дев-режим: `npm install && npm run dev`. Docker нужен для «как в проде» / деплоя.

---

### 📜 Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск дев-сервера (`http://localhost:3000`) |
| `npm run build` | Продакшен-сборка (standalone) |
| `npm run start` | Запуск собранного приложения |
| `npm run lint` | Проверка кода ESLint |

---

### 🔗 Бэкенд

Клиент работает с REST API [music-platform-api](https://github.com/DaniilKalts/music-platform-api). Перед запуском убедитесь, что бэкенд поднят и доступен по адресу из `NEXT_PUBLIC_API_URL` — иначе запросы завершатся сетевой ошибкой.

Интерактивная документация API: `http://localhost:8080/swagger`.
