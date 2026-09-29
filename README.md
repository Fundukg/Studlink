
# 🎓 StudLink («ВКурсе») — Панель управления и Bot-платформа

**StudLink** — веб-платформа для управления коммуникациями и рассылками через мессенджеры и социальные сети (Telegram, ВКонтакте, Одноклассники).

---

## 🛠 Технологический стек

- **Языки и среда:** TypeScript, Node.js / Bun[cite: 1]
- **Frontend:** React 19, Vite, React Router DOM v7, Tailwind CSS, Shadcn UI, TanStack Query (React Query)[cite: 1]
- **Backend & API:** Express, tRPC, Prisma ORM, Zod, JWT Authentication[cite: 1]
- **База данных:** PostgreSQL[cite: 1]
- **Интеграции:** Telegraf (Telegram API), vk-io (VK API), Axios (OK Graph API)[cite: 1, 2]

---

## 📋 Предварительные требования

Перед началом работы убедитесь, что на вашей локальной машине установлены:

1. **Node.js** (версия `20.x` или выше) или **Bun** (`>= 1.x`)[cite: 1]
2. **PostgreSQL** (`>= 14`) или запущенный Docker-контейнер с PostgreSQL[cite: 1]
3. **Git**

---

## 🚀 Быстрый старт (Локальный запуск)

### 1. Клонирование репозитория

```bash
git clone [https://github.com/your-username/studlink.git](https://github.com/your-username/studlink.git)
cd studlink

```

---

### 2. Настройка базы данных и переменных окружения

Создайте файл `.env` в корневом каталоге проекта (или в папке `backend/`, в зависимости от структуры) на основе шаблона ниже:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studlink_db?schema=public"

# Authentication (JWT Secret)
JWT_SECRET="your-super-secret-jwt-key-change-me"

# Bot Tokens & API Keys
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
VK_GROUP_TOKEN="your_vk_group_token"
VK_GROUP_ID="your_vk_group_id"
OK_ACCESS_TOKEN="your_ok_access_token"
OK_PUBLIC_KEY="your_ok_public_key"
OK_SECRET_KEY="your_ok_secret_key"

```

---

### 3. Установка зависимостей

Установите зависимости для бэкенда и фронтенда.

#### Использование Bun (Рекомендуется):

```bash
# Установка всех зависимостей
bun install

```

#### Использование npm / pnpm:

```bash
npm install

```

---

### 4. Настройка базы данных и Prisma ORM

1. Убедитесь, что служба PostgreSQL запущенa и база данных `studlink_db` создана.


2. Генерация Prisma Client и проведение миграций схемы БД:



```bash
# Генерация Prisma Client
npx prisma generate

# Применение миграций к БД
npx prisma migrate dev --name init

# (Опционально) Заполнение БД начальными данными / сидами
npx prisma db seed

```

---

### 5. Запуск в режиме разработки (Development)

Для работы приложения необходимо одновременно запустить бэкенд (Express + tRPC) и фронтенд (Vite Dev Server).

#### Запуск Бэкенда (Backend)

Сервер запустится по умолчанию на `http://localhost:3000`:

```bash
# Используя Bun
bun run dev:backend

# Или через npm
npm run dev:backend

```

#### Запуск Фронтенда (Frontend)

Клиентская часть запустится по умолчанию на `http://localhost:5173`:

```bash
# Используя Bun
bun run dev:frontend

# Или через npm
npm run dev:frontend

```

---

## 🏗 Сборка для Продакшна (Production Build)

Чтобы собрать проект перед деплоем на сервер (Nginx / PM2):

```bash
# 1. Сборка фронтенда (создает дистрибутив в /dist)
bun run build

# 2. Проверка локальной сборки
bun run preview

```

---

## 🔍 Утилиты и полезные команды

* **Интерфейс управления БД (Prisma Studio):**
```bash
npx prisma studio

```


Открывает визуальный веб-интерфейс просмотра данных по адресу `http://localhost:5555`.
* **Проверка типов TypeScript:**
```bash
npm run typecheck

```



---

## 📁 Структура проекта

```text
studlink/
├── prisma/               # Схема Prisma и миграции PostgreSQL
├── src/
│   ├── bots/             # Логика ботов Telegram, VK, OK
│   ├── components/       # UI-компоненты (Shadcn / React)
│   ├── pages/            # Страницы админ-панели
│   ├── server/           # tRPC роутеры и Express контроллеры
│   └── utils/            # Вспомогательные функции (роли, форматирование)
├── dist/                 # Скомпилированный статический фронтенд (после build)
├── .env                  # Переменные окружения
├── package.json          # Зависимости и скрипты
└── vite.config.ts        # Конфигурация Vite

```

```

```