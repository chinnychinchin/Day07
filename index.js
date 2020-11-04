const express = require('express');
const handlebars = require('express-handlebars');
const mysql = require('mysql2/promise');
const tv_shows_router = require('./routers/tv_shows_router');

//Configure port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

//Initiate express and handlebars
const app = express();
app.engine('hbs',handlebars({defaultLayout:'default.hbs'}));
app.set('view engine','hbs');


//configure connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'leisure',
    connectionLimit: 4,
    timezone: '+08:00'
})

app.use(tv_shows_router(pool));


//Make queries
const mkQUery = (sqlStmt,pool) => {

    const f = async (params) => {
        const conn = await pool.getConnection();
        const [result,_] = conn.query(sqlStmt,[params]);
        return result
    }
    return
}

//Start server 
pool.getConnection().then(conn => {
    const p0 = conn.ping() // returns promise
    console.log('Pinging server...');
    const p1 = Promise.resolve(conn);
    app.listen(PORT, () => {console.log(`Your tv app has started on port ${PORT} at ${new Date()}`)})
    return Promise.all([p0,p1])
}).then(result => {
    const conn = result[1];
    conn.release();
}).catch((e) =>
    console.error('Cannot ping database: ', e)
);

//Configure routes
app.use(express.static(__dirname + '/static'));