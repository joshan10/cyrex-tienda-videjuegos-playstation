-- =====================================================
-- CYREX - Tienda Premium de Videojuegos PlayStation
-- Script SQL: Creación de Base de Datos + Seed Data
-- =====================================================

DROP DATABASE IF EXISTS cyrex_db;
CREATE DATABASE cyrex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cyrex_db;

-- =====================================================
-- 1. TABLA: roles
-- =====================================================
CREATE TABLE roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 2. TABLA: permisos
-- =====================================================
CREATE TABLE permisos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 3. TABLA: roles_permisos (Relación N:N)
-- =====================================================
CREATE TABLE roles_permisos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  rol_id     INT NOT NULL,
  permiso_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id)     REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
  UNIQUE KEY uk_rol_permiso (rol_id, permiso_id)
) ENGINE=InnoDB;

-- =====================================================
-- 4. TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  apellido          VARCHAR(100) NOT NULL,
  tipo_documento    ENUM('cc', 'ce', 'pasaporte') NOT NULL,
  numero_documento  VARCHAR(20)  NOT NULL UNIQUE,
  direccion         VARCHAR(255) NOT NULL,
  telefono          VARCHAR(20)  NOT NULL,
  correo            VARCHAR(150) NOT NULL UNIQUE,
  password          VARCHAR(255) NOT NULL,
  estado            ENUM('activo', 'inactivo') DEFAULT 'activo',
  rol_id            INT NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- 5. TABLA: categorias
-- =====================================================
CREATE TABLE categorias (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  imagen_url  VARCHAR(500) DEFAULT NULL,
  estado      ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 6. TABLA: productos (videojuegos)
-- =====================================================
CREATE TABLE productos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(10,2) NOT NULL,
  stock         INT DEFAULT 0,
  imagen_url    VARCHAR(500) DEFAULT NULL,
  plataforma    VARCHAR(50)  DEFAULT 'PlayStation',
  categoria_id  INT DEFAULT NULL,
  estado        ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- 7. TABLA: servicios
-- =====================================================
CREATE TABLE servicios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio      DECIMAL(10,2) NOT NULL,
  duracion    VARCHAR(50)  DEFAULT NULL,
  estado      ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 8. TABLA: ordenes (compras)
-- =====================================================
CREATE TABLE ordenes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  total       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado      ENUM('pendiente', 'procesando', 'completada', 'cancelada') DEFAULT 'pendiente',
  direccion_envio VARCHAR(255) DEFAULT NULL,
  notas       TEXT DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- 9. TABLA: ordenes_detalles
-- =====================================================
CREATE TABLE ordenes_detalles (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  orden_id      INT NOT NULL,
  producto_id   INT NOT NULL,
  cantidad      INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal      DECIMAL(12,2) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id)    REFERENCES ordenes(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;


-- =====================================================
-- SEED DATA
-- =====================================================

-- Roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema. Gestión de usuarios, productos, ventas y configuración.'),
  ('Empleado',      'Acceso limitado. Puede ver productos, gestionar órdenes y consultar inventario.'),
  ('Cliente',       'Usuario final. Puede navegar la tienda, comprar juegos y ver su historial.');

-- Permisos del sistema
INSERT INTO permisos (nombre, descripcion) VALUES
  ('usuarios.ver',        'Ver listado de usuarios'),
  ('usuarios.crear',      'Crear nuevos usuarios'),
  ('usuarios.editar',     'Editar usuarios existentes'),
  ('usuarios.eliminar',   'Desactivar usuarios (soft delete)'),
  ('productos.ver',       'Ver catálogo de productos'),
  ('productos.crear',     'Añadir nuevos productos'),
  ('productos.editar',    'Editar productos existentes'),
  ('productos.eliminar',  'Desactivar productos'),
  ('ordenes.ver',         'Ver órdenes de compra'),
  ('ordenes.crear',       'Crear nuevas órdenes'),
  ('ordenes.editar',      'Actualizar estado de órdenes'),
  ('ordenes.eliminar',    'Cancelar órdenes'),
  ('servicios.ver',       'Ver servicios disponibles'),
  ('servicios.crear',     'Crear nuevos servicios'),
  ('servicios.editar',    'Editar servicios'),
  ('servicios.eliminar',  'Desactivar servicios'),
  ('dashboard.admin',     'Acceso al panel de administración'),
  ('dashboard.empleado',  'Acceso al panel de empleado');

-- Permisos del Administrador (todos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- Permisos del Empleado (ver productos, ver/editar órdenes)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 2, id FROM permisos WHERE nombre IN (
  'productos.ver', 'ordenes.ver', 'ordenes.editar', 'servicios.ver', 'dashboard.empleado'
);

-- Permisos del Cliente (ver productos, crear órdenes, ver sus órdenes)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 3, id FROM permisos WHERE nombre IN (
  'productos.ver', 'ordenes.ver', 'ordenes.crear', 'servicios.ver'
);

-- Categorías de videojuegos
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Acción-Aventura',  'Juegos que combinan exploración con combate intenso y narrativa envolvente.'),
  ('RPG',              'Juegos de rol con progresión de personaje, misiones y decisiones narrativas.'),
  ('Terror',           'Experiencias de horror y supervivencia con atmósferas inmersivas.'),
  ('Lucha',            'Juegos competitivos de peleas uno a uno con mecánicas de combo.'),
  ('Plataformas',      'Aventuras ágiles con saltos, exploración y recolección de objetos.'),
  ('Mundo Abierto',    'Juegos con mapas extensos y libertad total de exploración.');

-- 10 Videojuegos PlayStation (migración desde JSON)
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id) VALUES
  (
    'Assassin''s Creed IV: Black Flag',
    'Explora el Caribe en una aventura naval de mundo abierto con combate táctico y sigilo.',
    149900.00, 25,
    'assassins-creed-iv-black-flag_playstation_4_ps4_cover.webp',
    'PlayStation 4',
    (SELECT id FROM categorias WHERE nombre = 'Acción-Aventura')
  ),
  (
    'Marvel''s Spider-Man',
    'Balanceo fluido, combate dinámico y narrativa cinematográfica en una Nueva York vibrante.',
    179900.00, 30,
    'marvel-spider-man.webp',
    'PlayStation 4',
    (SELECT id FROM categorias WHERE nombre = 'Acción-Aventura')
  ),
  (
    'Horizon Forbidden West',
    'Un viaje épico con exploración vertical, criaturas mecánicas y paisajes impresionantes.',
    219900.00, 20,
    'horizon-forbidden-west.webp',
    'PlayStation 5',
    (SELECT id FROM categorias WHERE nombre = 'RPG')
  ),
  (
    'God of War',
    'Acción intensa y drama emocional en una odisea nórdica con combate brutal y preciso.',
    159900.00, 35,
    'god-of-war.webp',
    'PlayStation 4',
    (SELECT id FROM categorias WHERE nombre = 'Acción-Aventura')
  ),
  (
    'Mortal Kombat 11',
    'Peleas competitivas con gran profundidad táctica, ritmo frenético y acabado visual impecable.',
    129900.00, 40,
    'mortal-kombat-11-ps4.webp',
    'PlayStation 4',
    (SELECT id FROM categorias WHERE nombre = 'Lucha')
  ),
  (
    'Ratchet & Clank',
    'Plataformas de alta calidad con arsenal creativo, ritmo ágil y dirección artística pulida.',
    189900.00, 18,
    'ratchet-of-clank.webp',
    'PlayStation 5',
    (SELECT id FROM categorias WHERE nombre = 'Plataformas')
  ),
  (
    'The Last of Us',
    'Supervivencia narrativa de alto impacto con personajes memorables y decisiones difíciles.',
    199900.00, 22,
    'the-last-of-us.webp',
    'PlayStation 4',
    (SELECT id FROM categorias WHERE nombre = 'Acción-Aventura')
  ),
  (
    'Red Dead Redemption 2',
    'Un western inmersivo con mundo vivo, detalles extremos y narrativa madura de gran escala.',
    239900.00, 15,
    'ed-dead-redemption-red-dead-redemption-2-bundle-ps5-0.webp',
    'PlayStation 5',
    (SELECT id FROM categorias WHERE nombre = 'Mundo Abierto')
  ),
  (
    'Death Stranding 2',
    'Experiencia atmosférica con exploración estratégica, logística y propuesta autoral única.',
    259900.00, 12,
    'death-stranding-2.webp',
    'PlayStation 5',
    (SELECT id FROM categorias WHERE nombre = 'Acción-Aventura')
  ),
  (
    'Resident Evil Requiem',
    'Tensión, horror y acción con diseño de sonido envolvente y puesta en escena premium.',
    229900.00, 20,
    'resident-evil-requiem-ps5-0.webp',
    'PlayStation 5',
    (SELECT id FROM categorias WHERE nombre = 'Terror')
  );

-- Servicios de la tienda
INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES
  ('PlayStation Plus Essential',   'Acceso a juegos mensuales gratuitos y multijugador online.',       149900.00, '12 meses'),
  ('PlayStation Plus Extra',       'Catálogo de +400 juegos PS4/PS5 descargables.',                    249900.00, '12 meses'),
  ('PlayStation Plus Premium',     'Streaming de clásicos PS1/PS2/PS3 + pruebas de juegos.',           339900.00, '12 meses'),
  ('Mantenimiento de Consola',     'Limpieza interna, cambio de pasta térmica y diagnóstico general.', 89900.00,  '2-3 días'),
  ('Instalación de Juegos Digitales', 'Descarga e instalación profesional de tu biblioteca digital.', 29900.00,  '1 día');

-- Usuario administrador por defecto
-- Password: Admin2026# (hash bcrypt generado)
INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id)
VALUES (
  'Admin', 'Cyrex', 'cc', '1000000001', 'Oficina Central Cyrex', '3001234567',
  'admin@cyrex.com',
  '$2b$10$8K1p/4v0Zk7K5K5K5K5K5OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'activo', 1
);
