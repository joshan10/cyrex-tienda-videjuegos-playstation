DROP DATABASE IF EXISTS cyrex_db;
CREATE DATABASE cyrex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cyrex_db;

CREATE TABLE roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permisos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles_permisos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  rol_id     INT NOT NULL,
  permiso_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_rol_permiso (rol_id, permiso_id)
);

CREATE TABLE usuarios (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  apellido          VARCHAR(100) NOT NULL,
  tipo_documento    VARCHAR(20)  NOT NULL,
  numero_documento  VARCHAR(20)  NOT NULL UNIQUE,
  direccion         VARCHAR(255) NOT NULL,
  telefono          VARCHAR(20)  NOT NULL,
  correo            VARCHAR(150) NOT NULL UNIQUE,
  password          VARCHAR(255) NOT NULL,
  estado            VARCHAR(20)  DEFAULT 'activo',
  rol_id            INT NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  imagen_url  VARCHAR(500) DEFAULT NULL,
  estado      VARCHAR(20) DEFAULT 'activo',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(10,2) NOT NULL,
  stock         INT DEFAULT 0,
  imagen_url    VARCHAR(500) DEFAULT NULL,
  imagen_public_id VARCHAR(255) DEFAULT NULL,
  plataforma    VARCHAR(50)  DEFAULT 'PlayStation',
  categoria_id  INT DEFAULT NULL,
  estado        VARCHAR(20)  DEFAULT 'activo',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio      DECIMAL(10,2) NOT NULL,
  duracion    VARCHAR(50)  DEFAULT NULL,
  estado      VARCHAR(20) DEFAULT 'activo',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ordenes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  total       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado      VARCHAR(20) DEFAULT 'pendiente',
  direccion_envio VARCHAR(255) DEFAULT NULL,
  notas       TEXT DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ordenes_detalles (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  orden_id      INT NOT NULL,
  producto_id   INT NOT NULL,
  cantidad      INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal      DECIMAL(12,2) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pqr (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  tipo            VARCHAR(20) NOT NULL,
  asunto          VARCHAR(200) NOT NULL,
  descripcion     TEXT NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  respuesta       TEXT DEFAULT NULL,
  fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE conversaciones_chat (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mensajes_chat (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  rol             VARCHAR(20) NOT NULL,
  contenido       TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA

INSERT INTO roles (nombre, descripcion) VALUES ('Administrador', 'Acceso total al sistema.');
INSERT INTO roles (nombre, descripcion) VALUES ('Empleado', 'Acceso limitado.');
INSERT INTO roles (nombre, descripcion) VALUES ('Cliente', 'Usuario final.');

INSERT INTO permisos (nombre, descripcion) VALUES ('usuarios.ver', 'Ver listado de usuarios');
INSERT INTO permisos (nombre, descripcion) VALUES ('usuarios.crear', 'Crear nuevos usuarios');
INSERT INTO permisos (nombre, descripcion) VALUES ('usuarios.editar', 'Editar usuarios existentes');
INSERT INTO permisos (nombre, descripcion) VALUES ('usuarios.eliminar', 'Desactivar usuarios');
INSERT INTO permisos (nombre, descripcion) VALUES ('productos.ver', 'Ver catalogo de productos');
INSERT INTO permisos (nombre, descripcion) VALUES ('productos.crear', 'Anadir nuevos productos');
INSERT INTO permisos (nombre, descripcion) VALUES ('productos.editar', 'Editar productos existentes');
INSERT INTO permisos (nombre, descripcion) VALUES ('productos.eliminar', 'Desactivar productos');
INSERT INTO permisos (nombre, descripcion) VALUES ('ordenes.ver', 'Ver ordenes de compra');
INSERT INTO permisos (nombre, descripcion) VALUES ('ordenes.crear', 'Crear nuevas ordenes');
INSERT INTO permisos (nombre, descripcion) VALUES ('ordenes.editar', 'Actualizar estado de ordenes');
INSERT INTO permisos (nombre, descripcion) VALUES ('ordenes.eliminar', 'Cancelar ordenes');
INSERT INTO permisos (nombre, descripcion) VALUES ('servicios.ver', 'Ver servicios disponibles');
INSERT INTO permisos (nombre, descripcion) VALUES ('servicios.crear', 'Crear nuevos servicios');
INSERT INTO permisos (nombre, descripcion) VALUES ('servicios.editar', 'Editar servicios');
INSERT INTO permisos (nombre, descripcion) VALUES ('servicios.eliminar', 'Desactivar servicios');
INSERT INTO permisos (nombre, descripcion) VALUES ('dashboard.admin', 'Acceso al panel de administracion');
INSERT INTO permisos (nombre, descripcion) VALUES ('dashboard.empleado', 'Acceso al panel de empleado');

INSERT INTO roles_permisos (rol_id, permiso_id) SELECT 1, id FROM permisos;
INSERT INTO roles_permisos (rol_id, permiso_id) SELECT 2, id FROM permisos WHERE nombre IN ('productos.ver', 'ordenes.ver', 'ordenes.editar', 'servicios.ver', 'dashboard.empleado');
INSERT INTO roles_permisos (rol_id, permiso_id) SELECT 3, id FROM permisos WHERE nombre IN ('productos.ver', 'ordenes.ver', 'ordenes.crear', 'servicios.ver');

INSERT INTO categorias (nombre, descripcion) VALUES ('Accion-Aventura', 'Juegos de accion y aventura.');
INSERT INTO categorias (nombre, descripcion) VALUES ('RPG', 'Juegos de rol.');
INSERT INTO categorias (nombre, descripcion) VALUES ('Terror', 'Juegos de terror.');
INSERT INTO categorias (nombre, descripcion) VALUES ('Lucha', 'Juegos de lucha.');
INSERT INTO categorias (nombre, descripcion) VALUES ('Plataformas', 'Juegos de plataformas.');
INSERT INTO categorias (nombre, descripcion) VALUES ('Mundo Abierto', 'Juegos de mundo abierto.');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Assassins Creed IV Black Flag', 'Aventura naval de mundo abierto.', 149900.00, 25, 'assassins-creed-iv-black-flag_playstation_4_ps4_cover.webp', 'PlayStation 4', 1);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Marvels Spider-Man', 'Combate dinamico en Nueva York.', 179900.00, 30, 'marvel-spider-man.webp', 'PlayStation 4', 1);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Horizon Forbidden West', 'Exploracion y criaturas mecanicas.', 219900.00, 20, 'horizon-forbidden-west.webp', 'PlayStation 5', 2);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('God of War', 'Accion intensa nordica.', 159900.00, 35, 'god-of-war.webp', 'PlayStation 4', 1);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Mortal Kombat 11', 'Peleas competitivas.', 129900.00, 40, 'mortal-kombat-11-ps4.webp', 'PlayStation 4', 4);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Ratchet and Clank', 'Plataformas de alta calidad.', 189900.00, 18, 'ratchet-of-clank.webp', 'PlayStation 5', 5);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('The Last of Us', 'Supervivencia narrativa.', 199900.00, 22, 'the-last-of-us.webp', 'PlayStation 4', 1);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Red Dead Redemption 2', 'Western inmersivo.', 239900.00, 15, 'ed-dead-redemption-red-dead-redemption-2-bundle-ps5-0.webp', 'PlayStation 5', 6);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Death Stranding 2', 'Experiencia atmosferica.', 259900.00, 12, 'death-stranding-2.webp', 'PlayStation 5', 1);
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES ('Resident Evil Requiem', 'Terror y accion.', 229900.00, 20, 'resident-evil-requiem-ps5-0.webp', 'PlayStation 5', 3);

INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES ('PlayStation Plus Essential', 'Juegos mensuales y multijugador.', 149900.00, '12 meses');
INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES ('PlayStation Plus Extra', 'Catalogo de mas de 400 juegos.', 249900.00, '12 meses');
INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES ('PlayStation Plus Premium', 'Streaming de clasicos.', 339900.00, '12 meses');
INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES ('Mantenimiento de Consola', 'Limpieza y diagnostico.', 89900.00, '2-3 dias');
INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES ('Instalacion de Juegos Digitales', 'Instalacion profesional.', 29990.00, '1 dia');
