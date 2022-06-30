import axios from 'axios';
import 'dotenv/config';
import mariadb from 'mariadb'


async function start() {
    const conn = await mariadb.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        connectTimeout: 30000
    });
    try {
        // ace
        const response = await axios.get('https://ace.io/polarisex/oapi/list/tradePrice');
        console.log('get exchange rate');
        // bitpro
        // const response = await axios.get("https://api.bitopro.com/v3/tickers");
        // console.log(response.data);

        // INSERT INTO `bavepay`.`exchange_rate` (`pair`, `rate`) VALUES ('BTC/TWD', '603938.7');
        // UPDATE `bavepay`.`exchange_rate` SET `rate` = '32292.4' WHERE (`pair` = 'ETH/TWD');
        for (let key in response.data) {
            const result = await conn.query({
                dateStrings: true,
                sql: `SELECT pair, rate FROM bavepay.exchange_rate WHERE pair = '${key}'`
            })
            // console.log(key, response.data[key].last_price);
            if (result.length > 0) {
                conn.query({
                    dateStrings: true,
                    sql: `UPDATE bavepay.exchange_rate SET rate = '${response.data[key].last_price}' WHERE (pair = '${key}')`
                })
            } else {
                conn.query({
                    dateStrings: true,
                    sql: `INSERT INTO bavepay.exchange_rate (pair, rate) VALUES ('${key}', '${response.data[key].last_price}')`
                })
            }
        }
        
    } catch (err) {
        console.log(err)
    } finally {
        conn.end();
    }
}

setInterval(start, 10000);
// start()