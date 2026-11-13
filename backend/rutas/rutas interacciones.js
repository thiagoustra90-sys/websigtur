import { Router } from "express";
import express from "express";
import { requiereSesion, sesionOpcional } from "../servicios/verificacion.js";
import { comentarios, crearComentario, subirMediaComentario, editarComentario, eliminarComentario, reportarComentario, estado, like, guardado, listarGuardados } from "../controladores/controlador interacciones.js";
import { listarComentariosForo, responderComentario, likeComentario, estadoLikeComentario, enviarMensaje, subirAudioMensaje, subirAdjuntoMensaje, listarMensajes, listarUsuariosParaMensajes, marcarMensajesLeidos, listarConversaciones } from "../controladores/controlador foro.js";

const router = Router();
router.get("/", comentarios);
router.get("/foro", listarComentariosForo);
router.post("/medios", requiereSesion, express.raw({ type: ["image/jpeg", "image/png", "image/gif", "image/webp"], limit: "5mb", inflate: false }), subirMediaComentario);
router.post("/", requiereSesion, crearComentario);
router.patch("/:id", requiereSesion, editarComentario);
router.delete("/:id", requiereSesion, eliminarComentario);
router.post("/:id/reportar", requiereSesion, reportarComentario);
router.get("/estado", sesionOpcional, estado);
router.post("/:id/respuestas", requiereSesion, responderComentario);
router.get("/:id/likes", sesionOpcional, estadoLikeComentario);
router.post("/:id/likes", requiereSesion, likeComentario);

export const mensajesRouter = Router();
mensajesRouter.get("/", requiereSesion, listarMensajes);
mensajesRouter.get("/usuarios", requiereSesion, listarUsuariosParaMensajes);
mensajesRouter.get("/conversaciones", requiereSesion, listarConversaciones);
mensajesRouter.patch("/leer", requiereSesion, marcarMensajesLeidos);
mensajesRouter.post("/audio", requiereSesion, express.raw({ type: ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"], limit: "10mb", inflate: false }), subirAudioMensaje);
mensajesRouter.post("/adjuntos", requiereSesion, express.raw({ type: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"], limit: "10mb", inflate: false }), subirAdjuntoMensaje);
mensajesRouter.post("/", requiereSesion, enviarMensaje);

export const likesRouter = Router();
likesRouter.get("/estado", sesionOpcional, estado);
likesRouter.post("/", requiereSesion, like);

export const guardadosRouter = Router();
guardadosRouter.get("/", requiereSesion, listarGuardados);
guardadosRouter.post("/", requiereSesion, guardado);

export default router;