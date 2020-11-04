const e = require('express');
const express = require('express');
const handlebars = require('express-handlebars');
const mysql = require('mysql2/promise');

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

//SQL queries
const SQL_GET_ALL_SHOWS = "select * from tv_shows Order by name desc limit 15 ";
const SQL_GET_SHOW_BY_ID = "select * from tv_shows where tvid = ?";

//Start server 
pool.getConnection().then(conn => {
    const p0 = conn.ping() // returns promise
    console.log('Pinging server...');
    const p1 = Promise.resolve(conn);
    app.listen(PORT, () => {`Your tv app has started on port ${PORT} at ${new Date()}`})
    return Promise.all([p0,p1])
}).then(result => {
    const conn = result[1];
    conn.release();
}).catch((e) =>
    console.error('Cannot ping database: ', e)
);

//Configure routes
app.use(express.static(__dirname + '/static'));

app.get('/', async (req,res) => {

    let tv_shows;
    const conn = await pool.getConnection();
    try{
        
        const [results,_] = await conn.query(SQL_GET_ALL_SHOWS);
        tv_shows = results;
        //const tv_show_names = tv_shows.map(show => show['name'])
        //const tv_show_ids = tv_shows.map(show => show['tvid'])
        res.status(200);
        res.type('text/html');
        res.render('index',{tv_shows})
    }catch(e){
        res.status(500);
        res.type('text/html');
        res.error(`Error: 500 ${e}`);
    }finally{
        conn.release();
    }
})

app.get('/shows/:tvid', async(req,res) => {
    const tvid = req.params.tvid;
    let showDetails;
    const conn = await pool.getConnection();
    
    try{
        const [results,_] = await conn.query(SQL_GET_SHOW_BY_ID,[tvid])
        showDetails = results[0] //showDetails is an object || undefined 
    
        
        if(!showDetails)
        {
            res.status(404);
            res.type('text/html');
            res.send(`<h2>${tvid} does not exist.</h2>`)
            return //return exits the try block
        }
        res.status(200);
        res.type('text/html');
        res.render('detailsPage',{showDetails, hasSite: !!showDetails.official_site})


    }
    catch(e){
        console.log('Error: 500')

    }
    finally{
        conn.release()
    }


})