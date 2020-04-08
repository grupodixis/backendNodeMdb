// REQUIRES
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


//Inicializar variables

var app = express();
var verde = '\x1b[32m%s\x1b[0m';
var colores = require('./colores').colores;

//Body Parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


//Conexion a la base de datos

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log(colores.FgMagenta + 'Base de datos' + colores.FgGreen, ' online');


})

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);

app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log(colores.FgMagenta + 'Express ok on port: ' + colores.FgBlue, '3000');

});