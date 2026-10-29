import { Router } from 'express';
import { requiereSesion, requiereAdmin } from '../servicios/verificacion.js';
import { crearEvento, listarEventos, listarUsuarios, banearUsuario, eliminarEvento, eliminarComentario, listarComentarios, fijarComentario } from '../controladores/controlador admin.js';

const router = Router();
router.use(requiereSesion, requiereAdmin);
router.get('/eventos', listarEventos);
router.post('/eventos', crearEvento);
router.delete('/eventos/:id', eliminarEvento);
router.delete('/comentarios/:id', eliminarComentario);
router.patch('/comentarios/:id/fijado', fijarComentario);
router.get('/comentarios', listarComentarios);
router.get('/usuarios', listarUsuarios);
router.patch('/usuarios/:id/baneo', banearUsuario);
export default router;
