# 📦 Тестовая задача для работы с API DummyJSON

[![DummyJSON](https://img.shields.io/badge/API-DummyJSON-21BCDD?style=for-the-badge&logo=JSON)](https://dummyjson.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

## 🚀 Основные функции

- **function  getAllData(url)**: функция для получение данных.
- **function createDynamicTableSQL(client, tableName, data) 2**:функция для создание динамической таблицы по столбцам из json.
- **function filterData(substring,data)**: функция сортировки данных по ключевому слову.
- **function insertData(client, tableName, product)**: функция добавления полученных данных в таблицу.


## 🖥 Пример основного кода

```javascript
// 📁 main.js
const { Client } = require('pg');

/**
 * 🚀 Основная функция приложения
 * @async
 */
async function main() {
    // 🔐 Настройки подключения к БД
    const client = new Client({
        host: 'localhost',
        user: 'postgres',
        password: '123456',
        port: '5432',
        database: 'test'
    });

    try {
        // 🔌 Подключаемся к базе данных
        await client.connect();
        console.log('🔑 Успешное подключение к БД');

        // 🛠 Параметры работы
        const tableName = 'products';
        const API_URL = 'https://dummyjson.com/products/search?q=phone';
        const SEARCH_QUERY = 'iphone';

        // 📥 Получаем данные с API
        const products = await getAllData(API_URL);
        console.log(`📦 Получено ${products.products.length} товаров`);

        // 🏗 Создаем таблицу на основе структуры первого товара
        await createDynamicTableSQL(client, tableName, products.products[0]);
        console.log('✅ Таблица успешно создана');

        // 🔍 Фильтруем товары по ключевому слову
        const filteredProducts = filterData(SEARCH_QUERY, products.products);
        console.log(`🔎 Найдено ${filteredProducts.products.length} совпадений`);

        // 📝 Вставляем данные в БД
        if (filteredProducts.products.length > 0) {
            for (const product of filteredProducts.products) {
                await insertData(client, tableName, product);
            }
            console.log('💾 Данные успешно сохранены в БД');
        }
        
    } catch (error) {
        console.error('⛔ Ошибка:', error);
    } finally {
        // 🔒 Закрываем подключение
        await client.end();
        console.log('🔌 Соединение с БД закрыто');
    }
}

// 🚨 Запуск приложения
main().catch(console.error);
