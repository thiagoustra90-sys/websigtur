-- Base de datos del sitio web Turismart para XAMPP / MySQL
-- Motor: MySQL/MariaDB
-- Uso: importar en phpMyAdmin

CREATE DATABASE IF NOT EXISTS `turismart` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `turismart`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) DEFAULT NULL,
  `correo` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('admin','usuario') NOT NULL DEFAULT 'usuario',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `empresas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `categoria` VARCHAR(80) DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  `web` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `eventos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `fecha_inicio` DATE DEFAULT NULL,
  `fecha_fin` DATE DEFAULT NULL,
  `ubicacion` VARCHAR(200) DEFAULT NULL,
  `precio` DECIMAL(10,2) DEFAULT 0.00,
  `imagen_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `atracciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `tipo` VARCHAR(80) DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `ubicacion` VARCHAR(200) DEFAULT NULL,
  `imagen_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tarjetas_destacadas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(50) NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `ubicacion` VARCHAR(200) DEFAULT NULL,
  `hora` VARCHAR(50) DEFAULT NULL,
  `precio` VARCHAR(60) DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `contactos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuarios` (`nombre`, `apellido`, `correo`, `password_hash`, `rol`) VALUES
('Admin', 'Turismart', 'admin@turismart.com', '$2y$10$examplehashreplacewithrealhash', 'admin'),
('Usuario', 'Demo', 'usuario@turismart.com', '$2y$10$examplehashreplacewithrealhash', 'usuario');

INSERT INTO `empresas` (`nombre`, `categoria`, `descripcion`, `telefono`, `email`, `direccion`, `web`) VALUES
('Hotel Salto Plaza', 'Hospedaje', 'Hotel con servicio completo y vista al río.', '473-1234', 'info@saltoplaza.com', 'Av. Artigas 1234', 'https://saltoplaza.com'),
('Restaurante El Puente', 'Gastronomía', 'Cocina local y ambiente familiar.', '473-5678', 'contacto@elpuente.com', 'Calle 18 de Julio 456', 'https://elpuente.com');

INSERT INTO `eventos` (`titulo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `ubicacion`, `precio`, `imagen_url`) VALUES
('Festival de la Primavera', 'Evento cultural con música, artesanales y gastronomía local.', '2026-09-12', '2026-09-14', 'Parque de la Ciudad', 0.00, 'https://example.com/evento1.jpg'),
('Noche de Arte y Música', 'Muestra de artistas locales y gastronomía.', '2026-10-05', '2026-10-05', 'Centro Histórico', 150.00, 'https://example.com/evento2.jpg');

INSERT INTO `atracciones` (`nombre`, `tipo`, `descripcion`, `ubicacion`, `imagen_url`) VALUES
('Plaza Artigas', 'Cultural', 'Espacio emblemático del centro de Salto.', 'Centro', 'https://example.com/plaza-artigas.jpg'),
('Costanera Norte', 'Paisaje', 'Miradores y recorridos al aire libre.', 'Río Uruguay', 'https://example.com/costanera.jpg');

INSERT INTO `tarjetas_destacadas` (`tipo`, `nombre`, `ubicacion`, `hora`, `precio`) VALUES
('Evento', 'Festival de la Primavera', 'Parque de la Ciudad', '18:00 - 23:00', 'Gratis'),
('Lugar', 'Plaza Artigas', 'Centro', 'Todo el día', 'Libre'),
('Turismo', 'Hotel Salto Plaza', 'Av. Artigas 1234', 'Check-in 14:00', 'Desde $2.500');
