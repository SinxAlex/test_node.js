

function  getAllData(url){
return  fetch(url)
        .then(res => {return res.json();});
}


async function createDynamicTableSQL(client, tableName, data) {
    // Убрали connect/end из функции, управление подключением снаружи
    if (!data || typeof data !== 'object') {
        console.error('Ошибка: некорректные данные для создания таблицы.');
        return;
    }

    const columns = Object.keys(data).map(key => {
        if (key === 'id') key = 'id_product';
        let columnType;

        if (Array.isArray(data[key])) columnType = 'TEXT[]';
        else if (typeof data[key] === 'object') columnType = 'JSON';
        else if (typeof data[key] === 'string') columnType = 'VARCHAR';
        else if (typeof data[key] === 'number') columnType = 'FLOAT';
        else columnType = 'TEXT';

        return `${key} ${columnType}`;
    });

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            ${columns.join(', ')}
        );`;

    try {
        await client.query(createTableQuery);
        console.log('Таблица создана или уже существует.');
    } catch (error) {
        console.error('Ошибка при создании таблицы:', error);
        throw error; // Пробрасываем ошибку выше
    }
}

/** если все таки имелось ввиду отфильтровать данные, а не просто выбрать категорию */

function filterData(substring,data){
    console.log(data);
    const arr={ products: [] };
    for (let i = 0; i < data.length; i++) {
        //фильтруем в столбце title, переводим в нижний регистр,чтобы не пропустить данные если iphone Написан заглавными.
        const isFound = data[i]['title'].toLowerCase().includes(substring);
        if (isFound) {
               arr['products'].push(data[i]);
        }
    }

    return arr;

}

async function insertData(client, tableName, product) {
    try {
        const keys = Object.keys(product).map(key =>
            key === 'id' ? 'id_product' : key
        );
        const values = Object.values(product);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO ${tableName} (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *`;

        const res = await client.query(query, values);
        console.log('Inserted product:', res.rows[0]);
    } catch (err) {
        console.error('Error inserting product:', err.stack);
        throw err; // Пробрасываем ошибку выше
    }
}
// Вызываем функцию вставки данных

async  function  main(){
    const {Client} = require('pg');
    const tableName='products';
// Настройки подключения
    const client = new Client({
        host: 'localhost',             // Хост, обычно localhost
        user: 'postgres',             // Ваше имя пользователя
        password:'123456',     // Ваш пароль
        port: '5432',
        database:'test'
    });
    /** url api Products
     * В заданий говорилось чтобы выбрать все продукты "iphone"
     * не совсем понятно это категория, если подразумевается категория?
     * то надо исполльзовать url ='https://dummyjson.com/products/search?q=phone';
     * если же из общей url='https://dummyjson.com/products';
     * если  нет то надо отфильтровать из всех данных элементы которые содержат слово iphone
     *
     * */
    try {
        await client.connect();
        const tableName = 'products';
        const url = 'https://dummyjson.com/products/search?q=phone';

        const products = await getAllData(url);
        const sampleProduct = products.products[0];

        // Создаем таблицу
        await createDynamicTableSQL(client, tableName, sampleProduct);

        // Фильтруем и вставляем данные
        const filtered = filterData('iphone', products.products);

        if (filtered.products.length > 0) {
            for (const product of filtered.products) {
                await insertData(client, tableName, product);
            }
        }
    } catch (error) {
        console.error('Main error:', error);
    } finally {
        await client.end();
        console.log('Connection closed');
    }

}


main();