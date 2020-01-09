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
var privateKey  = fs.readFileSync('./path/itse.key', 'utf8');
var certificate = fs.readFileSync('./path/itse.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


app.get("/", (req, res) => {
    res.send("server is start")
})

app.get("/me", (req, res) => {
    conn.query("select text from blog", (err, data) => {
        if (err) {
            res.json({
                code: '400',
                msg: err
            })
        }
        res.json({
            code: '200',
            msg: data
        })

    })
})
    app.post("/me", (req, res) => {
        if (req.body.msg != 'm1107') return
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
    // app.listen('8901', () => {
    //     console.log("server into run http://127.0.0.1:8901");

    // })

    httpsServer.listen('8901',() => {
        console.log("server into run http://127.0.0.1:8901");

    })