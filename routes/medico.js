var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middleware/autenticacion');
var Medico = require('../models/medico');



//==================================
// OBTENER MEDICO 
//==================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('hospital')
        .populate('usuario', 'nombre email')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Medico',
                    errors: err
                });
            }

            Medico.count((err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medico: medicos,
                    total: conteo
                });

            });
        });
});



//==================================
// INSERTAR NUEVO MEDICO
//==================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });
    });

});



//==================================
// ACTUALIZAR MEDICO
//==================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error a buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el medico con el id: ' + id,
                errors: { message: 'No existe un medico con la id especificada' }
            });
        }
        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.img = body.img;
        medico.usuario = req.usuario
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        })


    });
});




//==================================
// BORRAR MEDICO 
//==================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el medico con el id: ' + id,
                errors: { message: 'No existe un medico con la id especificada' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });



    });
});

module.exports = app;