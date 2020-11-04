const { query } = require('express');
const express = require('express');


//SQL queries
const SQL_GET_ALL_SHOWS = "select * from tv_shows Order by name desc limit ? offset ?";
const SQL_GET_COUNT_ALL_SHOWS = "select count(*) as total from tv_shows";
const SQL_GET_SHOW_BY_ID = "select * from tv_shows where tvid = ?";

module.exports = function(p) {

const tv_shows_router = express.Router(); 
const pool = p;

tv_shows_router.get('/', async (req,res) => {

    let tv_shows;
    let total_shows;
    const pageNum = parseInt(req.query.pageNum) || 1;
    const offset = parseInt(req.query.offset) || 0;
    const limit = 8;
    const conn = await pool.getConnection();
    try{
        
        const [results,_] = await conn.query(SQL_GET_ALL_SHOWS, [limit, offset]);
        tv_shows = results;
        const [count,__] = await conn.query(SQL_GET_COUNT_ALL_SHOWS);
        total_shows = count[0].total
        console.log(total_shows)
        const numOfPages = total_shows/limit;
        //const tv_show_names = tv_shows.map(show => show['name'])
        //const tv_show_ids = tv_shows.map(show => show['tvid'])
        res.status(200);
        res.type('text/html');
        res.render('index',{noShows:!tv_shows.length,tv_shows, prevOffset: Math.max(0,offset-limit), nextOffset: Math.min(total_shows,offset+limit),pageNum, numOfPages, nextPageNum: Math.min(numOfPages, pageNum+1), prevPageNum: Math.max(1, pageNum -1)})
    }catch(e){
        res.status(500);
        res.type('text/html');
        res.send(`Error: 500 ${e}`);
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