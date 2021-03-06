const app = require('express')();
const config = require('./config')
app.use(require('cors')())


const mysql = require("mysql");
const conn = mysql.createPool(config.db)

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('./path/itsse.key', 'utf8');
var certificate = fs.readFileSync('./path/itsse.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);



var redisPool = require('redis-connection-pool')('myRedisPool', config.redis);
let defalutSql = `
    select name,artist,url,cover from muisc;
    select text from blog;
    select routerName,routerPath from routers where canRouter = 0;
    select text,author from lickdog;
    select routerName,routerPath,icon from itsseRouters where canRouter = 0;
    `
conn.query(defalutSql, (err, data) => {
    if (err) {
        console.log('defalut_Redis' + err.message);
    } else {
        // 0 music, 1 blog, 2 routers;
        redisPool.set('music', JSON.stringify(data[0]))
        redisPool.set('blog', JSON.stringify(data[1]))
        redisPool.set('routers', JSON.stringify(data[2]))
        redisPool.set('tg', JSON.stringify(data[3]))
        redisPool.set('itsseRouter', JSON.stringify(data[4]))
    }
})


app.get('/reloadRedis',(req,res)=>{
    conn.query(defalutSql, (err, data) => {
        if (err) {
            console.log('defalut_Redis' + err.message);
            res.json({
                code:400,
                msg:"数据库错误！！"
            })
        } else {
            // 0 music, 1 blog, 2 routers;
            redisPool.set('music', JSON.stringify(data[0]))
            redisPool.set('blog', JSON.stringify(data[1]))
            redisPool.set('routers', JSON.stringify(data[2]))
            redisPool.set('tg', JSON.stringify(data[3]))
            redisPool.set('itsseRouter', JSON.stringify(data[4]))
            res.json({
                code:200,
                msg:"更新成功"
            })
        }
    })
})

app.get("/", (req, res) => {
    res.send("server is start")
})

app.get("/me", (req, res) => {
    redisPool.get('blog',(err,data)=>{
        if (err) {
            res.json({
                code: '400',
                msg: err
            })
            return;
        }
        res.json({
            code: '200',
            msg: JSON.parse(data)
        })
    })
})
app.post("/me", (req, res) => {
    if (req.body.msg != 'm1107') {
        res.json({
            code: "400",
            msg: "校验码错误！！！"
        })
        return
    }
    // console.log(req.body);
    let time = parseInt(new Date().getTime() / 100)
    // console.log(time);
    let data = {
        text: req.body.text,
        time
    }
    conn.query('insert into blog set ?', [data], (err, data) => {
        if (err) {
            res.json({
                code: "400",
                msg: err
            })
            return
        }
        res.json({
            code: '200',
            msg: "success"
        })
    })
})

app.get('/music', (req, res) => {
    redisPool.get('music',(err,data)=>{
        if (err) {
            res.json({
                code: "400",
                msg: "服务器错误"
            })
        } else {
            res.json(JSON.parse(data))
        }
    })
})

app.get('/routers', (req, res) => {
    redisPool.get('routers',(err,data)=>{
        if (err) {
            res.json({
                code: "400",
                msg: "服务器错误"
            })
        } else {
            res.json({
                code: 200,
                msg: "获取成功",
                data:JSON.parse(data)
            })
        }
    })
})

app.get('/tg', (req, res) => {
    redisPool.get('tg',(err,data)=>{
        if (err) {
            res.json({
                code: "400",
                msg: "服务器错误"
            })
        } else {
            res.json({
                code: 200,
                msg: "获取成功",
                data:JSON.parse(data)
            })
        }
    })
})

app.get('/itsseRouters', (req, res) => {
    redisPool.get('itsseRouter',(err,data)=>{
        if (err) {
            res.json({
                code: "400",
                msg: "服务器错误"
            })
        } else {
            res.json({
                code: 200,
                msg: "获取成功",
                data:JSON.parse(data)
            })
        }
    })
})

// app.listen('8901', () => {
//     console.log("server into run http://127.0.0.1:8901");

// })

httpsServer.listen('8901', () => {
    console.log("server into run http://127.0.0.1:8901");

})