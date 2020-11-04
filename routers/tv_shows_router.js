const express = require('express');


//SQL queries
const SQL_GET_ALL_SHOWS = "select * from tv_shows Order by name desc limit 15 ";
const SQL_GET_SHOW_BY_ID = "select * from tv_shows where tvid = ?";

module.exports = function(p) {

const tv_shows_router = express.Router(); 
const pool = p;

tv_shows_router.get('/', async (req,res) => {

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

tv_shows_router.get('/shows/:tvid', async(req,res) => {
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

return tv_shows_router

}