const express = require('express');
const hbs = require('express-handlebars');
const request = require('request');
const keys = require('./keys.json')

//assign PORT
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

const app = express();


app.engine('hbs', hbs());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views')

const db = [];

//Route handling
app.get(/.*/, express.static(__dirname + '/public'));

app.get('/weather', (req,res) => {
    const cityName = req.query.cityName;
    const uCityName = cityName.toUpperCase();
    res.status(200);
    res.type('text/html');
    //res.render('weather', { city:uCityName, layout: false })

    const params = {
        q : uCityName,
        units : "metric",
        APPID : keys.weather_keys
    }
    console.log(params);

    request.get('https://api.openweathermap.org/data/2.5/weather',
    { qs:params },
    (err, weaRes, body) => {
        if(err) {
            res.status(400);
            res.type('text/plain');
            res.send(err);
            return;
        }
        res.status(200);
        res.type('text/html')
        const results = JSON.parse(body);
        res.format({
            'text/html': () => {
                res.render('weather', {
                    layout : false,
                    city : uCityName,
                    weather : results.weather,
                    temperature : results.main
                })
            },
            'application/json': () => {
                const respond = {
                    temperature: results.main,
                    coord: results.coord,
                    city: cityName,
                    weather: results.weather.map( v => {
                        return {
                            main : v.main,
                            description : v.description,
                            icon : `http://openweathermap.org/img/w/${v.icon}.png`
                        } 
                    })
                }
                res.json(respond)
            },
            'default' : () => {
                res.status(406);
                res.type('text/plain')
                res.send(`Unable to return weather`)
            }
        })
    })
})


app.listen(PORT,()=>{
    console.info(`Weather application started on ${new Date()} at port ${PORT}`);
})