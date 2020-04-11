var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middleware/autenticacion');
var Hospital = require('../models/hospital');


//==================================
// OBTENER HOSPITALES 
//==================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }

            Hospital.count((err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospital: hospitales,
                    total: conteo
                });

            });
        });
});



//==================================
// INSERTAR NUEVO HOSPITAL
//==================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: req.usuario
        });
    });

});



//==================================
// ACTUALIZAR HOSPITALES
//==================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error a buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el hospital con el id: ' + id,
                errors: { message: 'No existe un hospital con la id especificada' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        })


    });
});



//==================================
// BORRAR  HOSPITAL
//==================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el hospital con el id: ' + id,
                errors: { message: 'No existe un hospital con la id especificada' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });



    });
});

module.exports = app;