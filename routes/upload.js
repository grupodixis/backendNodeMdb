var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    //Validar tipo de colección
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Coleccion no valida'
        })
    }
    //Validar si hay archivo adjunto.
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'Debe adjuntar una imagen' + tiposValidos.join(', ')
        })
    }

    //Identificar extensión
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Archivo no valido',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        });

    }

    //Nombre del archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ extensionArchivo }`;
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    //Mover archivo a la carpeta correspondiente
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

    });

    subirPorTipos(tipo, id, nombreArchivo, res);
    /* 
     */
});


function subirPorTipos(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: err
                });
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe elimina la imagen anterior.

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, () => {


                });
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'medico no existe',
                    errors: err
                });
            }


            var pathViejo = './uploads/medicos/' + medico.img;
            // Si existe elimina la imagen anterior.

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, () => {


                });
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });


    }
    if (tipo === 'hospitales') {


        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: err
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // Si existe elimina la imagen anterior.

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, () => {


                });
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });

        });


    }

}


module.exports = app;