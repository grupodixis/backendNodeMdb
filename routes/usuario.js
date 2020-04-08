var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middleware/autenticacion');

//==================================
// OBTENER USURIOS
//==================================

app.get('/', (req, res, next) => {

    Usuario.find({}, (err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            });
        }
        console.log(usuarios);

        res.status(200).json({
            ok: true,
            usuarios: usuarios
        });

    })
});


//==================================
// ACTUALIZAR USUARIO
//==================================


app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error a buscar el usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el usuario con el id: ' + id,
                errors: { message: 'No existe un usuario con la id especificada' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = '******';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });


    });




});



//==================================
// CREAR USURIOS
//==================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });


})

//==================================
// BORRAR USUARIO
//==================================



app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el usuario con el id: ' + id,
                errors: { message: 'No existe un usuario con la id especificada' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });



    })
})



module.exports = app;