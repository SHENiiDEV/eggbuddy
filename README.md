# EggBuddy — ретро-тамагочи на Laravel 13 + Inertia + React + Tailwind

Виртуальный питомец в стиле Tamagotchi из 90-х: вылупление из яйца, уход в реальном времени,
эволюция, мини-игра «Left or Right?», скины питомцев и корпусов, монеты, пополнение (top-up)
с PDF-инвойсами, welcome/top-up письма с PDF-вложениями и полный набор legal-документов.

**Стек:** Laravel 13 · Inertia.js v3 · React 19 · Tailwind CSS v4 · dompdf · SQLite/MySQL

---

## Быстрый старт

Нужны PHP 8.3+, Composer, Node 20+ (подойдёт Laravel Herd).

**Самый простой способ на Mac:** двойной клик по `start.command` в папке проекта — он сам
установит зависимости, подготовит базу, соберёт фронт и запустит сайт на http://localhost:1929.

Или вручную:

```bash
composer run setup   # composer install, .env, ключ, SQLite, миграции + демо-аккаунт, npm install, build
composer run dev     # php artisan serve + vite
```

Открыть http://localhost:8000

Демо-аккаунт (создаётся только не в production): `demo@eggbuddy.test` / `password1`

Тесты: `composer test` (36 тестов: регистрация, оплата, вебхуки, инвойсы, игра, legal).

Ускорить время в игре для проверки: `GAME_SPEED=60` в `.env` (1 реальная минута = 1 игровой час).

---

## Что внутри

| Раздел | Где |
|---|---|
| Лендинг | `resources/js/pages/Home.jsx` |
| Регистрация / логин / сброс пароля | `app/Http/Controllers/Auth`, `resources/js/pages/Auth` |
| Игра (питомец) | `app/Game/PetEngine.php`, `resources/js/pages/Play.jsx` |
| Мини-игра Left or Right | `app/Game/Minigame.php` (результат считает сервер) |
| Магазин скинов и угощений | `app/Game/Shop.php`, `resources/js/pages/Shop.jsx` |
| Пиксель-арт питомцев и корпусов | `resources/js/game/` (`sprites.js`, `skins.js`, `Device.jsx`, `LcdScreen.jsx`) |
| Пополнение (top-up) | `app/Http/Controllers/TopUpController.php`, `app/Payments/` |
| Инвойсы PDF | `app/Billing/InvoiceService.php`, `resources/views/pdf/invoice.blade.php` |
| Письма | `app/Mail/`, `resources/views/mail/` |
| Legal-документы | `resources/legal/*.md`, страница `resources/js/pages/Legal/Show.jsx` |
| Cookie-баннер | `resources/js/components/CookieBanner.jsx` |
| Монеты (баланс + журнал) | `app/Billing/Wallet.php`, таблица `coin_transactions` |

### Регистрация
Поля: Email, Password (+ повтор), Name, Surname, Phone number, Date of birth, адрес из 4 частей
(Street/house/apartment, City, Country, Post code) и обязательный чекбокс
«I agree to the Terms & Conditions and Privacy Policy» со ссылками на документы.

- Телефон нормализуется и проверяется в международном формате (`+371…`, `00371…` тоже принимается).
- Возраст 18+ (`REGISTRATION_MIN_AGE`).
- Страны: полный список ISO 3166 минус исключённые. Список исключений — `config/countries.php`
  (Sudan, DR Congo, Iran, Mali, Myanmar, North Korea, South Sudan, Syria, Yemen, Afghanistan,
  Belarus, CAR, Cuba, Haiti, Iraq, Russia, Somalia, Venezuela, Zimbabwe). Проверяется и на сервере.
- Сохраняется факт принятия: дата/время, версия документов, IP.

### Пополнение и платежи
1. Игрок выбирает пакет (4 пакета или своя сумма €5–€500), видит свои платёжные данные
   и отмечает два согласия: Terms + Refund Policy и **немедленная поставка цифрового контента
   с потерей права на отказ** (требование ЕС для цифровых товаров).
2. Создаётся `Payment` со снимком всех данных плательщика и согласий → редирект на страницу шлюза.
3. Успех (вебхук или возврат) → монеты начисляются **один раз** (идемпотентно, с блокировкой),
   выпускается инвойс с последовательным номером `EB-2026-000001`, уходит письмо с PDF.
4. Поддерживаются статусы failed / cancelled / refunded (при рефанде монеты списываются).

Сейчас включён встроенный **Demo-шлюз**: страница с пометкой TEST MODE, кнопки «Approve / Decline /
Cancel», данные карт не собираются, деньги не двигаются.

### Письма
- **Welcome** — после регистрации, вложения: `account-confirmation.pdf` (данные аккаунта + запись
  о принятии условий) и `terms-and-conditions-v1.0.pdf` (копия принятых Terms).
- **Top-up receipt** — после оплаты, вложение: `Invoice-EB-2026-000001.pdf`. В тексте письма
  подтверждение заказа и согласия на немедленную поставку (durable medium).

Оба письма — `ShouldQueue`. С `QUEUE_CONNECTION=sync` отправляются сразу; в production
поставьте `QUEUE_CONNECTION=database` и запустите `php artisan queue:work`.

### Legal
`resources/legal/terms.md`, `privacy.md`, `cookies.md`, `refunds.md`. Реквизиты компании,
юрисдикция, дескриптор, список запрещённых стран и т.п. подставляются автоматически
из `.env`/конфигов (плейсхолдеры `{{company_name}}` и др.). Каждый документ доступен как
страница `/legal/{doc}` и как PDF `/legal/{doc}/pdf`. Версия и дата — `LEGAL_VERSION`,
`LEGAL_EFFECTIVE_DATE`.

Покрыто то, что эквайеры/Visa/Mastercard проверяют на сайте мерчанта: полное юр. название,
рег. номер, адрес, страна, контакты поддержки, описание товара, валюта и цены с налогами,
политика доставки (мгновенно, цифровой товар), refund/cancellation policy, право отказа и его
утрата для цифрового контента, отсутствие подписок/рекуррентов, безопасность платежей (PCI DSS,
3-D Secure, карты не хранятся), billing descriptor, chargebacks, ограничения по странам
и санкциям, 18+, GDPR (правовые основания, сроки хранения, права, DPA), cookies.

> Перед запуском дайте тексты посмотреть юристу в вашей юрисдикции — это сильная основа,
> но не юридическая консультация.

### Скины
- 7 питомцев (Mochi, Pipi, Bunbun, Neko, Kumo, Boo, Drako) и 9 корпусов.
- Цены/редкость — `config/skins.php`; внешний вид — `resources/js/game/skins.js` и `sprites.js`.
- Новый питомец: добавить ключ в `config/skins.php`, палитру в `PALETTES` и маски `child`/`adult`
  в `SPRITES` (контур, тени и лицо дорисовываются автоматически).

---

## Настройка `.env` перед запуском

```dotenv
APP_NAME=EggBuddy
APP_URL=https://your-domain.com

COMPANY_NAME="Your Company Ltd"
COMPANY_NUMBER="000000000"
COMPANY_VAT_NUMBER=
COMPANY_ADDRESS="Street 1, City, Postcode"
COMPANY_COUNTRY="Country"
COMPANY_EMAIL="support@your-domain.com"
COMPANY_PHONE="+000 0000 0000"
COMPANY_JURISDICTION="the Republic of Latvia"
COMPANY_DPA="Data State Inspectorate of Latvia (www.dvi.gov.lv)"
COMPANY_DESCRIPTOR="EGGBUDDY"        # согласуйте с эквайером

PAYMENT_CURRENCY=EUR
INVOICE_PREFIX=EB
INVOICE_VAT_RATE=0                   # например 21 — тогда в инвойсе будет разбивка НДС
```

Почта (например Namecheap Private Email):

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=mail.privateemail.com
MAIL_PORT=465
MAIL_SCHEME=smtps
MAIL_USERNAME=hello@your-domain.com
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=hello@your-domain.com
```

## Подключение реального платёжного провайдера (PSP)

1. Создайте `app/Payments/Gateways/AcmeGateway.php`, реализующий
   `App\Payments\Contracts\PaymentGateway`:
   - `createCheckout(Payment $payment)` — создать платёж у провайдера (в `$payment` уже есть
     имя, фамилия, email, телефон, дата рождения, адрес, страна, индекс, сумма в центах,
     валюта, IP) и вернуть `new CheckoutSession($redirectUrl, $pspReference)`.
     URL возврата: `route('payments.show', $payment)`, вебхук: `route('webhooks', 'acme')`.
   - `parseWebhook(Request $request)` — проверить подпись и вернуть `WebhookResult`
     (`paid` / `failed` / `cancelled` / `refunded`).
   - `fetchStatus(Payment $payment)` — опционально, запрос статуса при возврате клиента.
2. Зарегистрируйте в `config/payments.php` → `gateways.acme`.
3. `.env`: `PAYMENT_GATEWAY=acme`, `PAYMENT_DEMO_ENABLED=false`.

Начисление монет, инвойсы, письма и защита от двойного зачисления уже работают — менять
ничего больше не нужно.

## Чек-лист перед продакшеном
- [ ] Реальные реквизиты компании в `.env`, проверенные юристом legal-тексты
- [ ] `PAYMENT_DEMO_ENABLED=false` и подключённый PSP
- [ ] SMTP настроен, `QUEUE_CONNECTION=database` + `php artisan queue:work` (supervisor)
- [ ] HTTPS, `APP_ENV=production`, `APP_DEBUG=false`
- [ ] SQLite на проде: PHP 8.4+ (тогда транзакции идут в режиме IMMEDIATE), права на запись
      у `www-data` на папку `database/` и ежедневный бэкап базы (инвойсы хранятся до 10 лет).
      WAL и ожидание блокировок уже настроены в `config/database.php`
