
### Документация по API

Этот API предоставляет функционал для управления студентами, отслеживания реферальных приглашений, регистрации пользователей, обработки платежей и статистики по приглашённым студентам.

---

## Базовый URL:
```
http://<ваш_домен_или_localhost>:3000
```

### Аутентификация:
- API использует **JWT аутентификацию** для защищённых маршрутов. Необходимо включить токен в заголовок Authorization для доступа к защищённым эндпоинтам.

### Переменные окружения:
- **SECRET_KEY**: Используется для подписывания JWT токенов.
- **SITE_ADDRESS**: Базовый URL для генерации реферальных ссылок.

---

## Эндпоинты:

### 1. **Генерация реферального приглашения**
   Генерирует ссылку для приглашения, привязанную к рефереру.

   **URL:** `/api/generateInvite`  
   **Метод:** `GET`  
   **Ответ:**
   - **200 OK:** Возвращает JSON с реферальной ссылкой.
     ```json
     {
       "link": "http://example.com/registration?ref=1"
     }
     ```
   - **500 Внутренняя ошибка сервера:** Произошла ошибка при генерации ссылки.

---

### 2. **Форма регистрации пользователя**
   Отображает HTML-форму для регистрации нового пользователя, включая ID реферера.

   **URL:** `/registration`  
   **Метод:** `GET`  
   **Параметры запроса:**  
   - `ref`: ID реферера, передаваемый в URL (например, `/registration?ref=1`).

   **Ответ:**
   - **200 OK:** Возвращает HTML-форму для регистрации.
   - **500 Внутренняя ошибка сервера:** Произошла ошибка при загрузке формы регистрации.

---

### 3. **Отправка формы регистрации**
   Регистрирует нового пользователя и генерирует для него JWT токен.

   **URL:** `/registration`  
   **Метод:** `POST`  
   **Тело запроса:**
   ```json
   {
     "firstName": "Иван",
     "secondName": "Иванов",
     "patronymic": "Иванович",
     "phone": "+123456789",
     "email": "ivan.ivanov@example.com",
     "referrerId": 1
   }
   ```
   - `firstName`: Имя пользователя.
   - `secondName`: Фамилия пользователя.
   - `patronymic`: Отчество пользователя (опционально).
   - `phone`: Номер телефона пользователя.
   - `email`: Электронная почта пользователя.
   - `referrerId`: ID реферера (если доступно).

   **Ответ:**
   - **200 OK:** Пользователь успешно зарегистрирован, возвращает JWT токен.
     ```json
     {
       "token": "eyJhbGciOi..."
     }
     ```
   - **406 Not Acceptable:** Пользователь уже существует.
   - **500 Внутренняя ошибка сервера:** Произошла ошибка при регистрации.

---

### 4. **Обработка платежа**
   Обрабатывает успешный платёж, начисляет уроки студенту и вознаграждает реферера.

   **URL:** `/api/successPayment`  
   **Метод:** `POST`  
   **Аутентификация:** Требуется JWT токен в заголовке `Authorization`.
   
   **Тело запроса:**
   ```json
   {
     "studentId": 1,
     "referrerId": 2
   }
   ```
   - `studentId`: ID студента, который совершил платёж.
   - `referrerId`: ID реферера, которого нужно вознаградить за приглашение.

   **Ответ:**
   - **200 OK:** Платёж успешно обработан, уроки начислены.
   - **500 Внутренняя ошибка сервера:** Произошла ошибка при обработке платежа.

---

### 5. **Статистика по рефералам**
   Возвращает количество студентов, приглашённых каждым реферером.

   **URL:** `/api/statInvitedStudents`  
   **Метод:** `GET`

   **Ответ:**
   - **200 OK:** Возвращает статистику по приглашённым студентам.
     ```json
     {
       "stats": [
         {
           "name": "Владимир",
           "amount": 5
         },
         {
           "name": "Тест",
           "amount": 3
         }
       ]
     }
     ```
   - **500 Внутренняя ошибка сервера:** Произошла ошибка при получении статистики.

---

### Обработка ошибок:
- **500 Внутренняя ошибка сервера:** Возвращается в случае необработанных исключений, проблем с сервером или ошибках обработки.
- **406 Not Acceptable:** Возвращается, если попытка зарегистрировать уже существующего пользователя.

---

### Логирование:
- Все ключевые действия, такие как успешная/неуспешная регистрация, обработка платежей и генерация статистики по рефералам, логируются с использованием кастомного модуля логирования (`logger`).

### Безопасность:
- Все защищённые маршруты защищены JWT аутентификацией (`/api/successPayment`).
- JWT токены подписываются секретным ключом из переменных окружения и истекают через 1 час.

---

### Как запустить API:
1. Убедитесь, что у вас установлен Node.js.
2. Установите необходимые зависимости:
   ```bash
   npm install
   ```
3. Создайте файл `.env` со следующим содержимым:
   ```
   SECRET_KEY=your_secret_key
   SITE_ADDRESS=http://localhost:3000
   ```
4. Запустите сервер:
   ```bash
   node app.js
   ```
5. Сервер будет запущен по адресу `http://localhost:3000`.
