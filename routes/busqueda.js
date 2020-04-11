var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



//==================================
// BUSQUEDA POR COLECCION
//==================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla.toLocaleLowerCase();
    var regex = new RegExp(busqueda, 'i');
    switch (tabla) {
        case 'hospitales':
            var valores = buscarHospitales(busqueda, regex);
            break;
        case 'usuarios':
            var valores = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            var valores = buscarMedicos(busqueda, regex);
            break;

        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son: hospitales, usuarios o medicos',
                error: { message: 'La tabla/colección no existe' }
            });
            break;
    }
    valores.then(respuestas => {
        res.status(200).json({
            ok: true,
            [tabla]: respuestas

        });
    });



});



//==================================
// BUSQUEDA GENERAL
//==================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });



});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error en la busqueda de hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });


    })
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('Hospital')

        .exec((err, medicos) => {
            if (err) {
                reject('Error en la busqueda de medicos', err);
            } else {
                resolve(medicos);
            }
        });


    })
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al buscar en usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    })
}


module.exports = app;