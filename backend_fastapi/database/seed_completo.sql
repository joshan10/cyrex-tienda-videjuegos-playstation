-- =====================================================
-- SEED DE PRUEBAS - Cyrex Store (TiDB Cloud)
-- =====================================================
-- Agrega datos de prueba SIN borrar ni modificar lo que
-- ya exista en la base. Es idempotente: si algo ya esta
-- (usuarios, productos, facturas, pagos...) se conserva
-- tal cual y no se vuelve a insertar.
--
-- Contenido:
--   * Tabla pagos (si falta)
--   * Roles, permisos y sus asignaciones
--   * Categorías, productos y servicios de catálogo
--   * Usuarios de prueba (solo se crean si no existen;
--     NUNCA se sobrescriben los actuales, p. ej. admin)
--   * 12 órdenes (completadas, procesando, pendientes, cancelada)
--   * 9 facturas (ventas) con fechas distribuidas jun-sep 2026
--   * 10 pagos de prueba
--   * 5 PQR en distintos estados
--   * 1 conversación del chatbot con 4 mensajes
--
-- USUARIOS QUE CREO ESTE SEED (solo si no existen)
--   Rol            Correo                 Contraseña
--   Administrador  admin@cyrex.com        Admin1234!
--   Empleado       empleado@cyrex.com     Empleado1234!
--   Empleado       jorge@cyrex.com        Empleado1234!
--   Cliente        cliente@cyrex.com      Cliente1234!
--   Cliente        laura@cyrex.com        Cliente1234!
--   Cliente        andres@cyrex.com       Cliente1234!
--   Cliente        maria@cyrex.com        Cliente1234!
--   (Si el correo ya existe en tu BD, se conserva el
--    registro actual con su contraseña actual.)
--
-- CÓMO EJECUTARLO EN TIDB CLOUD
--   1. Selecciona la base de datos del proyecto en la consola
--      (p. ej. cyrex_db) o pásala en la línea de comandos.
--   2. Ejecuta primero database/cyrex_db.sql (esquema) y las
--      migraciones, y este archivo al final.
--   3. Puedes re-ejecutarlo sin problema: no borra nada.
-- =====================================================

-- -----------------------------------------------------
-- 0. Tabla pagos (faltante) - idempotente
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  orden_id             INT NOT NULL,
  stripe_session_id    VARCHAR(255) DEFAULT NULL,
  reference            VARCHAR(255) NOT NULL,
  amount_in_cents      INT NOT NULL,
  currency             VARCHAR(10) DEFAULT 'usd',
  status               VARCHAR(20) DEFAULT 'pending',
  payment_method_type  VARCHAR(20) DEFAULT NULL,
  customer_email       VARCHAR(150) NOT NULL,
  stripe_response      TEXT DEFAULT NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pagos_reference (reference),
  INDEX idx_pagos_orden (orden_id),
  CONSTRAINT fk_pagos_orden FOREIGN KEY (orden_id) REFERENCES ordenes (id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 1. Roles, permisos y asignaciones
-- -----------------------------------------------------
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema.'),
  ('Empleado', 'Acceso limitado.'),
  ('Cliente', 'Usuario final.');

INSERT IGNORE INTO permisos (nombre, descripcion) VALUES
  ('usuarios.ver', 'Ver listado de usuarios'),
  ('usuarios.crear', 'Crear nuevos usuarios'),
  ('usuarios.editar', 'Editar usuarios existentes'),
  ('usuarios.eliminar', 'Desactivar usuarios'),
  ('productos.ver', 'Ver catalogo de productos'),
  ('productos.crear', 'Anadir nuevos productos'),
  ('productos.editar', 'Editar productos existentes'),
  ('productos.eliminar', 'Desactivar productos'),
  ('ordenes.ver', 'Ver ordenes de compra'),
  ('ordenes.crear', 'Crear nuevas ordenes'),
  ('ordenes.editar', 'Actualizar estado de ordenes'),
  ('ordenes.eliminar', 'Cancelar ordenes'),
  ('servicios.ver', 'Ver servicios disponibles'),
  ('servicios.crear', 'Crear nuevos servicios'),
  ('servicios.editar', 'Editar servicios'),
  ('servicios.eliminar', 'Desactivar servicios'),
  ('dashboard.admin', 'Acceso al panel de administracion'),
  ('dashboard.empleado', 'Acceso al panel de empleado');

INSERT IGNORE INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p WHERE r.nombre = 'Administrador';

INSERT IGNORE INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.nombre = 'Empleado'
  AND p.nombre IN ('productos.ver','ordenes.ver','ordenes.editar','servicios.ver','dashboard.empleado');

INSERT IGNORE INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.nombre = 'Cliente'
  AND p.nombre IN ('productos.ver','ordenes.ver','ordenes.crear','servicios.ver');

-- -----------------------------------------------------
-- 2. Categorías (6 base + 3 nuevas)
-- -----------------------------------------------------
INSERT IGNORE INTO categorias (nombre, descripcion) VALUES
  ('Accion-Aventura', 'Juegos de accion y aventura.'),
  ('RPG', 'Juegos de rol.'),
  ('Terror', 'Juegos de terror.'),
  ('Lucha', 'Juegos de lucha.'),
  ('Plataformas', 'Juegos de plataformas.'),
  ('Mundo Abierto', 'Juegos de mundo abierto.'),
  ('Consolas', 'Consolas y hardware.'),
  ('Accesorios', 'Mandos y accesorios.'),
  ('Carreras', 'Juegos de carreras.');

-- -----------------------------------------------------
-- 3. Productos (10 base + 4 nuevos)
--    Se insertan solo si el nombre no existe ya.
-- -----------------------------------------------------
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Assassins Creed IV Black Flag', 'Aventura naval de mundo abierto.', 149900.00, 25,
       'assassins-creed-iv-black-flag_playstation_4_ps4_cover.webp', 'PlayStation 4', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Accion-Aventura'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Assassins Creed IV Black Flag');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Marvels Spider-Man', 'Combate dinamico en Nueva York.', 179900.00, 30,
       'marvel-spider-man.webp', 'PlayStation 4', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Accion-Aventura'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Marvels Spider-Man');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Horizon Forbidden West', 'Exploracion y criaturas mecanicas.', 219900.00, 20,
       'horizon-forbidden-west.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'RPG'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Horizon Forbidden West');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'God of War', 'Accion intensa nordica.', 159900.00, 35,
       'god-of-war.webp', 'PlayStation 4', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Accion-Aventura'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'God of War');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Mortal Kombat 11', 'Peleas competitivas.', 129900.00, 40,
       'mortal-kombat-11-ps4.webp', 'PlayStation 4', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Lucha'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mortal Kombat 11');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Ratchet and Clank', 'Plataformas de alta calidad.', 189900.00, 18,
       'ratchet-of-clank.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Plataformas'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Ratchet and Clank');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'The Last of Us', 'Supervivencia narrativa.', 199900.00, 22,
       'the-last-of-us.webp', 'PlayStation 4', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Accion-Aventura'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'The Last of Us');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Red Dead Redemption 2', 'Western inmersivo.', 239900.00, 15,
       'ed-dead-redemption-red-dead-redemption-2-bundle-ps5-0.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Mundo Abierto'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Red Dead Redemption 2');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Death Stranding 2', 'Experiencia atmosferica.', 259900.00, 12,
       'death-stranding-2.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Accion-Aventura'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Death Stranding 2');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Resident Evil Requiem', 'Terror y accion.', 229900.00, 20,
       'resident-evil-requiem-ps5-0.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Terror'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Resident Evil Requiem');

-- Nuevos productos
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'PlayStation 5 Slim Digital', 'Consola PlayStation 5 edicion digital.', 1899900.00, 8,
       'ps5-slim-digital.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Consolas'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'PlayStation 5 Slim Digital');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Mando DualSense Edge', 'Mando profesional con personalizacion total.', 899900.00, 15,
       'dualsense-edge.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Accesorios'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mando DualSense Edge');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Gran Turismo 7', 'Simulacion de carreras realista.', 249900.00, 25,
       'gran-turismo-7.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'Carreras'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Gran Turismo 7');

INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, plataforma, categoria_id, estado)
SELECT 'Final Fantasy VII Rebirth', 'Accion RPG mitologica moderna.', 279900.00, 18,
       'ff7-rebirth.webp', 'PlayStation 5', c.id, 'activo'
FROM categorias c WHERE c.nombre = 'RPG'
  AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Final Fantasy VII Rebirth');

-- -----------------------------------------------------
-- 4. Servicios (5 base + 2 nuevos)
-- -----------------------------------------------------
INSERT INTO servicios (nombre, descripcion, precio, duracion, estado)
SELECT 'PlayStation Plus Essential', 'Juegos mensuales y multijugador.', 149900.00, '12 meses', 'activo'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'PlayStation Plus Essential');

INSERT INTO servicios (nombre, descripcion, precio, duracion, estado)
SELECT 'PlayStation Plus Extra', 'Catalogo de mas de 400 juegos.', 249900.00, '12 meses', 'activo'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'PlayStation Plus Extra');

INSERT INTO servicios (nombre, descripcion, precio, duracion, estado)
SELECT 'PlayStation Plus Premium', 'Streaming de clasicos.', 339900.00, '12 meses', 'activo'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'PlayStation Plus Premium');

INSERT INTO servicios (nombre, descripcion, precio, duracion, estado)
SELECT 'Mantenimiento de Consola', 'Limpieza y diagnostico.', 89900.00, '2-3 dias', 'activo'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Mantenimiento de Consola');

INSERT INTO servicios (nombre, descripcion, precio, duracion, estado)
SELECT 'Instalacion de Juegos Digitales', 'Instalacion profesional.', 29990.00, '1 dia', 'activo'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Instalacion de Juegos Digitales');

INSERT INTO servicios (nombre, descripcion, precio, duracion, estado)
SELECT 'Recarga PSN 20.000 COP', 'Recarga inmediata de cartera PlayStation.', 20000.00, 'inmediato', 'activo'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Recarga PSN 20.000 COP');

INSERT INTO servicios (nombre, descripcion, precio, duracion, estado)
SELECT 'Transferencia de datos PS4 a PS5', 'Migracion profesional de datos y juegos.', 59900.00, '1 dia', 'activo'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Transferencia de datos PS4 a PS5');

-- -----------------------------------------------------
-- 5. Usuarios de prueba
--    SOLO se insertan si el correo no existe.
--    NUNCA actualizan ni borran usuarios ya creados
--    (admin/empleado/cliente actuales se conservan).
-- -----------------------------------------------------
INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id, created_at, updated_at)
SELECT 'Admin', 'Cyrex', 'cc', '1000000001', 'Oficina Central Cyrex, Bogota', '3001234567',
       'admin@cyrex.com',
       '$2b$12$LRVGxuOanpaXpyfoh2KUxeQ.Uad3GsugFnSPcI0VlacJccK8eMLkq',
       'activo', r.id, '2025-11-01 08:00:00', '2025-11-01 08:00:00'
FROM roles r
WHERE r.nombre = 'Administrador'
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@cyrex.com');

INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id, created_at, updated_at)
SELECT 'Empleado', 'Asistente', 'cc', '2000000002', 'Sucursal Cyrex, Bogota', '3009876543',
       'empleado@cyrex.com',
       '$2b$12$eFONG8cBaNHrJazvZdKCg.JNdVjwv2xc9/LgcRoyAL7Ko4e/V51vm',
       'activo', r.id, '2025-11-01 08:00:00', '2025-11-01 08:00:00'
FROM roles r
WHERE r.nombre = 'Empleado'
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'empleado@cyrex.com');

INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id, created_at, updated_at)
SELECT 'Jorge', 'Ruiz', 'cc', '2000000008', 'Sucursal Cyrex Norte, Medellin', '3114445566',
       'jorge@cyrex.com',
       '$2b$12$eFONG8cBaNHrJazvZdKCg.JNdVjwv2xc9/LgcRoyAL7Ko4e/V51vm',
       'activo', r.id, '2025-12-01 08:00:00', '2025-12-01 08:00:00'
FROM roles r
WHERE r.nombre = 'Empleado'
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'jorge@cyrex.com');

INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id, created_at, updated_at)
SELECT 'Carlos', 'Gamer', 'cc', '3000000003', 'Calle 10 # 45-67, Bogota', '3201112233',
       'cliente@cyrex.com',
       '$2b$12$6pTKgkXFJ36UoTZMyn0DdegHuD.vDepSjDhS7s3weE5UYLNjbRiO6',
       'activo', r.id, '2026-01-15 09:00:00', '2026-01-15 09:00:00'
FROM roles r
WHERE r.nombre = 'Cliente'
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cliente@cyrex.com');

INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id, created_at, updated_at)
SELECT 'Laura', 'Gomez', 'cc', '3000000004', 'Av. El Dorado # 68-31, Bogota', '3155556677',
       'laura@cyrex.com',
       '$2b$12$6pTKgkXFJ36UoTZMyn0DdegHuD.vDepSjDhS7s3weE5UYLNjbRiO6',
       'activo', r.id, '2026-02-10 10:00:00', '2026-02-10 10:00:00'
FROM roles r
WHERE r.nombre = 'Cliente'
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'laura@cyrex.com');

INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id, created_at, updated_at)
SELECT 'Andres', 'Perez', 'cc', '3000000005', 'Cra 43A # 7-50, Medellin', '3177778899',
       'andres@cyrex.com',
       '$2b$12$6pTKgkXFJ36UoTZMyn0DdegHuD.vDepSjDhS7s3weE5UYLNjbRiO6',
       'activo', r.id, '2026-03-05 11:00:00', '2026-03-05 11:00:00'
FROM roles r
WHERE r.nombre = 'Cliente'
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'andres@cyrex.com');

INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id, created_at, updated_at)
SELECT 'Maria', 'Lopez', 'cc', '3000000006', 'Calle 36 # 3-15, Cali', '3188889900',
       'maria@cyrex.com',
       '$2b$12$6pTKgkXFJ36UoTZMyn0DdegHuD.vDepSjDhS7s3weE5UYLNjbRiO6',
       'activo', r.id, '2026-04-20 12:00:00', '2026-04-20 12:00:00'
FROM roles r
WHERE r.nombre = 'Cliente'
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'maria@cyrex.com');

-- -----------------------------------------------------
-- 6. Variables de referencia (ids por correo / nombre)
-- -----------------------------------------------------
SET @u_carlos := (SELECT id FROM usuarios WHERE correo = 'cliente@cyrex.com' LIMIT 1);
SET @u_laura  := (SELECT id FROM usuarios WHERE correo = 'laura@cyrex.com' LIMIT 1);
SET @u_andres := (SELECT id FROM usuarios WHERE correo = 'andres@cyrex.com' LIMIT 1);
SET @u_maria  := (SELECT id FROM usuarios WHERE correo = 'maria@cyrex.com' LIMIT 1);

SET @p_ac4     := (SELECT id FROM productos WHERE nombre = 'Assassins Creed IV Black Flag' LIMIT 1);
SET @p_spider  := (SELECT id FROM productos WHERE nombre = 'Marvels Spider-Man' LIMIT 1);
SET @p_horizon := (SELECT id FROM productos WHERE nombre = 'Horizon Forbidden West' LIMIT 1);
SET @p_gow     := (SELECT id FROM productos WHERE nombre = 'God of War' LIMIT 1);
SET @p_mk11    := (SELECT id FROM productos WHERE nombre = 'Mortal Kombat 11' LIMIT 1);
SET @p_ratchet := (SELECT id FROM productos WHERE nombre = 'Ratchet and Clank' LIMIT 1);
SET @p_tlou    := (SELECT id FROM productos WHERE nombre = 'The Last of Us' LIMIT 1);
SET @p_rdr2    := (SELECT id FROM productos WHERE nombre = 'Red Dead Redemption 2' LIMIT 1);
SET @p_ds2     := (SELECT id FROM productos WHERE nombre = 'Death Stranding 2' LIMIT 1);
SET @p_re      := (SELECT id FROM productos WHERE nombre = 'Resident Evil Requiem' LIMIT 1);
SET @p_ps5     := (SELECT id FROM productos WHERE nombre = 'PlayStation 5 Slim Digital' LIMIT 1);
SET @p_dual    := (SELECT id FROM productos WHERE nombre = 'Mando DualSense Edge' LIMIT 1);
SET @p_gt7     := (SELECT id FROM productos WHERE nombre = 'Gran Turismo 7' LIMIT 1);
SET @p_ff7     := (SELECT id FROM productos WHERE nombre = 'Final Fantasy VII Rebirth' LIMIT 1);

-- -----------------------------------------------------
-- 7. Ordenes (12) y sus detalles
--    Huella de unicidad: (usuario_id, created_at).
--    O1-O7 completadas | O8-O9 procesando
--    O10-O11 pendientes | O12 cancelada
--    Si la orden ya existe, se conserva y no se repite.
-- -----------------------------------------------------

-- O1: Carlos, 2026-06-15, completada, total 279800
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_carlos, 279800.00, 'completada', 'Calle 10 # 45-67, Bogota', 'Entrega en puerta principal',
       '2026-06-15 10:00:00', '2026-06-15 10:00:00'
FROM DUAL
WHERE @u_carlos IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_carlos AND created_at = '2026-06-15 10:00:00');
SET @o1 := (SELECT id FROM ordenes WHERE usuario_id = @u_carlos AND created_at = '2026-06-15 10:00:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o1 AS orden_id, @p_ac4 AS producto_id, 1 AS cantidad, 149900.00 AS precio_unitario, 149900.00 AS subtotal, CAST('2026-06-15 10:00:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @o1, @p_mk11, 1, 129900.00, 129900.00, CAST('2026-06-15 10:00:00' AS DATETIME)
) src
WHERE @o1 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o1);

-- O2: Laura, 2026-07-02, completada, total 419800
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_laura, 419800.00, 'completada', 'Av. El Dorado # 68-31, Bogota', NULL,
       '2026-07-02 11:30:00', '2026-07-02 11:30:00'
FROM DUAL
WHERE @u_laura IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_laura AND created_at = '2026-07-02 11:30:00');
SET @o2 := (SELECT id FROM ordenes WHERE usuario_id = @u_laura AND created_at = '2026-07-02 11:30:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o2 AS orden_id, @p_horizon AS producto_id, 1 AS cantidad, 219900.00 AS precio_unitario, 219900.00 AS subtotal, CAST('2026-07-02 11:30:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @o2, @p_tlou, 1, 199900.00, 199900.00, CAST('2026-07-02 11:30:00' AS DATETIME)
) src
WHERE @o2 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o2);

-- O3: Andres, 2026-07-20, completada, total 669700
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_andres, 669700.00, 'completada', 'Cra 43A # 7-50, Medellin', 'Regalo, empacar sin precio',
       '2026-07-20 16:45:00', '2026-07-20 16:45:00'
FROM DUAL
WHERE @u_andres IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_andres AND created_at = '2026-07-20 16:45:00');
SET @o3 := (SELECT id FROM ordenes WHERE usuario_id = @u_andres AND created_at = '2026-07-20 16:45:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o3 AS orden_id, @p_rdr2 AS producto_id, 2 AS cantidad, 239900.00 AS precio_unitario, 479800.00 AS subtotal, CAST('2026-07-20 16:45:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @o3, @p_ratchet, 1, 189900.00, 189900.00, CAST('2026-07-20 16:45:00' AS DATETIME)
) src
WHERE @o3 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o3);

-- O4: Maria, 2026-08-05, completada, total 589700
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_maria, 589700.00, 'completada', 'Calle 36 # 3-15, Cali', NULL,
       '2026-08-05 09:15:00', '2026-08-05 09:15:00'
FROM DUAL
WHERE @u_maria IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_maria AND created_at = '2026-08-05 09:15:00');
SET @o4 := (SELECT id FROM ordenes WHERE usuario_id = @u_maria AND created_at = '2026-08-05 09:15:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o4 AS orden_id, @p_spider AS producto_id, 1 AS cantidad, 179900.00 AS precio_unitario, 179900.00 AS subtotal, CAST('2026-08-05 09:15:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @o4, @p_gow, 1, 159900.00, 159900.00, CAST('2026-08-05 09:15:00' AS DATETIME)
  UNION ALL
  SELECT @o4, @p_gt7, 1, 249900.00, 249900.00, CAST('2026-08-05 09:15:00' AS DATETIME)
) src
WHERE @o4 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o4);

-- O5: Carlos, 2026-08-18, completada, total 1899900
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_carlos, 1899900.00, 'completada', 'Calle 10 # 45-67, Bogota', 'Consola nueva, revisar sellado',
       '2026-08-18 14:00:00', '2026-08-18 14:00:00'
FROM DUAL
WHERE @u_carlos IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_carlos AND created_at = '2026-08-18 14:00:00');
SET @o5 := (SELECT id FROM ordenes WHERE usuario_id = @u_carlos AND created_at = '2026-08-18 14:00:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o5 AS orden_id, @p_ps5 AS producto_id, 1 AS cantidad, 1899900.00 AS precio_unitario, 1899900.00 AS subtotal, CAST('2026-08-18 14:00:00' AS DATETIME) AS created_at
) src
WHERE @o5 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o5);

-- O6: Laura, 2026-09-01, completada, total 489800
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_laura, 489800.00, 'completada', 'Av. El Dorado # 68-31, Bogota', NULL,
       '2026-09-01 10:30:00', '2026-09-01 10:30:00'
FROM DUAL
WHERE @u_laura IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_laura AND created_at = '2026-09-01 10:30:00');
SET @o6 := (SELECT id FROM ordenes WHERE usuario_id = @u_laura AND created_at = '2026-09-01 10:30:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o6 AS orden_id, @p_ds2 AS producto_id, 1 AS cantidad, 259900.00 AS precio_unitario, 259900.00 AS subtotal, CAST('2026-09-01 10:30:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @o6, @p_re, 1, 229900.00, 229900.00, CAST('2026-09-01 10:30:00' AS DATETIME)
) src
WHERE @o6 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o6);

-- O7: Andres, 2026-09-10, completada, total 459800
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_andres, 459800.00, 'completada', 'Cra 43A # 7-50, Medellin', NULL,
       '2026-09-10 18:00:00', '2026-09-10 18:00:00'
FROM DUAL
WHERE @u_andres IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_andres AND created_at = '2026-09-10 18:00:00');
SET @o7 := (SELECT id FROM ordenes WHERE usuario_id = @u_andres AND created_at = '2026-09-10 18:00:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o7 AS orden_id, @p_ff7 AS producto_id, 1 AS cantidad, 279900.00 AS precio_unitario, 279900.00 AS subtotal, CAST('2026-09-10 18:00:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @o7, @p_spider, 1, 179900.00, 179900.00, CAST('2026-09-10 18:00:00' AS DATETIME)
) src
WHERE @o7 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o7);

-- O8: Maria, 2026-09-20, procesando, total 899900
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_maria, 899900.00, 'procesando', 'Calle 36 # 3-15, Cali', 'Pago confirmado, despacho pendiente',
       '2026-09-20 12:00:00', '2026-09-20 12:00:00'
FROM DUAL
WHERE @u_maria IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_maria AND created_at = '2026-09-20 12:00:00');
SET @o8 := (SELECT id FROM ordenes WHERE usuario_id = @u_maria AND created_at = '2026-09-20 12:00:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o8 AS orden_id, @p_dual AS producto_id, 1 AS cantidad, 899900.00 AS precio_unitario, 899900.00 AS subtotal, CAST('2026-09-20 12:00:00' AS DATETIME) AS created_at
) src
WHERE @o8 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o8);

-- O9: Carlos, 2026-09-22, procesando, total 349800
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_carlos, 349800.00, 'procesando', 'Calle 10 # 45-67, Bogota', NULL,
       '2026-09-22 09:30:00', '2026-09-22 09:30:00'
FROM DUAL
WHERE @u_carlos IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_carlos AND created_at = '2026-09-22 09:30:00');
SET @o9 := (SELECT id FROM ordenes WHERE usuario_id = @u_carlos AND created_at = '2026-09-22 09:30:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o9 AS orden_id, @p_tlou AS producto_id, 1 AS cantidad, 199900.00 AS precio_unitario, 199900.00 AS subtotal, CAST('2026-09-22 09:30:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @o9, @p_ac4, 1, 149900.00, 149900.00, CAST('2026-09-22 09:30:00' AS DATETIME)
) src
WHERE @o9 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o9);

-- O10: Laura, 2026-09-23, pendiente (sin facturar), total 229900
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_laura, 229900.00, 'pendiente', 'Av. El Dorado # 68-31, Bogota', 'Esperando pago',
       '2026-09-23 08:00:00', '2026-09-23 08:00:00'
FROM DUAL
WHERE @u_laura IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_laura AND created_at = '2026-09-23 08:00:00');
SET @o10 := (SELECT id FROM ordenes WHERE usuario_id = @u_laura AND created_at = '2026-09-23 08:00:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o10 AS orden_id, @p_re AS producto_id, 1 AS cantidad, 229900.00 AS precio_unitario, 229900.00 AS subtotal, CAST('2026-09-23 08:00:00' AS DATETIME) AS created_at
) src
WHERE @o10 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o10);

-- O11: Andres, 2026-09-21, pendiente (sin facturar), total 319800
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_andres, 319800.00, 'pendiente', 'Cra 43A # 7-50, Medellin', NULL,
       '2026-09-21 15:00:00', '2026-09-21 15:00:00'
FROM DUAL
WHERE @u_andres IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_andres AND created_at = '2026-09-21 15:00:00');
SET @o11 := (SELECT id FROM ordenes WHERE usuario_id = @u_andres AND created_at = '2026-09-21 15:00:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o11 AS orden_id, @p_gow AS producto_id, 2 AS cantidad, 159900.00 AS precio_unitario, 319800.00 AS subtotal, CAST('2026-09-21 15:00:00' AS DATETIME) AS created_at
) src
WHERE @o11 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o11);

-- O12: Maria, 2026-07-15, cancelada (sin facturar), total 239900
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, notas, created_at, updated_at)
SELECT @u_maria, 239900.00, 'cancelada', 'Calle 36 # 3-15, Cali', 'Cancelada por el cliente',
       '2026-07-15 11:00:00', '2026-07-15 11:00:00'
FROM DUAL
WHERE @u_maria IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes WHERE usuario_id = @u_maria AND created_at = '2026-07-15 11:00:00');
SET @o12 := (SELECT id FROM ordenes WHERE usuario_id = @u_maria AND created_at = '2026-07-15 11:00:00' ORDER BY id LIMIT 1);
INSERT INTO ordenes_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
SELECT src.orden_id, src.producto_id, src.cantidad, src.precio_unitario, src.subtotal, src.created_at
FROM (
  SELECT @o12 AS orden_id, @p_rdr2 AS producto_id, 1 AS cantidad, 239900.00 AS precio_unitario, 239900.00 AS subtotal, CAST('2026-07-15 11:00:00' AS DATETIME) AS created_at
) src
WHERE @o12 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ordenes_detalles WHERE orden_id = @o12);

-- -----------------------------------------------------
-- 8. Facturas (ventas) - 9 facturas CYR-2026-0001..0009
--    numero_factura es UNIQUE: si ya existe, se conserva.
--    Impuesto 19%. V3 ademas descuento 5%. V9 anulada.
--    Cada detalle incluye impuesto/descuento del item
--    (igual que la lógica de crud/ventas.py).
-- -----------------------------------------------------

-- V1: O1 - 2026-06-15 - sub 279800, imp 53162, total 332962
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o1, 'CYR-2026-0001', 279800.00, 53162.00, 19.00, 0.00, 0.00, 332962.00,
        'stripe', 'Pago con tarjeta de credito', 'activa', '2026-06-15 10:30:00', '2026-06-15 10:30:00', '2026-06-15 10:30:00');
SET @v1 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0001' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v1 AS venta_id, @p_ac4 AS producto_id, NULL AS servicio_id, 1 AS cantidad, 149900.00 AS precio_unitario, 28481.00 AS impuesto_item, 0.00 AS descuento_item, 178381.00 AS subtotal, CAST('2026-06-15 10:30:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @v1, @p_mk11, NULL, 1, 129900.00, 24681.00, 0.00, 154581.00, CAST('2026-06-15 10:30:00' AS DATETIME)
) src
WHERE @v1 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v1);

-- V2: O2 - 2026-07-02 - sub 419800, imp 79762, total 499562
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o2, 'CYR-2026-0002', 419800.00, 79762.00, 19.00, 0.00, 0.00, 499562.00,
        'stripe', NULL, 'activa', '2026-07-02 12:00:00', '2026-07-02 12:00:00', '2026-07-02 12:00:00');
SET @v2 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0002' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v2 AS venta_id, @p_horizon AS producto_id, NULL AS servicio_id, 1 AS cantidad, 219900.00 AS precio_unitario, 41781.00 AS impuesto_item, 0.00 AS descuento_item, 261681.00 AS subtotal, CAST('2026-07-02 12:00:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @v2, @p_tlou, NULL, 1, 199900.00, 37981.00, 0.00, 237881.00, CAST('2026-07-02 12:00:00' AS DATETIME)
) src
WHERE @v2 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v2);

-- V3: O3 - 2026-07-20 - sub 669700, imp 127243, desc 5% = 33485, total 763458
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o3, 'CYR-2026-0003', 669700.00, 127243.00, 19.00, 33485.00, 5.00, 763458.00,
        'stripe', 'Descuento del 5% por compra doble', 'activa', '2026-07-20 17:15:00', '2026-07-20 17:15:00', '2026-07-20 17:15:00');
SET @v3 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0003' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v3 AS venta_id, @p_rdr2 AS producto_id, NULL AS servicio_id, 2 AS cantidad, 239900.00 AS precio_unitario, 91162.00 AS impuesto_item, 23990.00 AS descuento_item, 546972.00 AS subtotal, CAST('2026-07-20 17:15:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @v3, @p_ratchet, NULL, 1, 189900.00, 36081.00, 9495.00, 216486.00, CAST('2026-07-20 17:15:00' AS DATETIME)
) src
WHERE @v3 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v3);

-- V4: O4 - 2026-08-05 - sub 589700, imp 112043, total 701743
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o4, 'CYR-2026-0004', 589700.00, 112043.00, 19.00, 0.00, 0.00, 701743.00,
        'stripe', NULL, 'activa', '2026-08-05 10:00:00', '2026-08-05 10:00:00', '2026-08-05 10:00:00');
SET @v4 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0004' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v4 AS venta_id, @p_spider AS producto_id, NULL AS servicio_id, 1 AS cantidad, 179900.00 AS precio_unitario, 34181.00 AS impuesto_item, 0.00 AS descuento_item, 214081.00 AS subtotal, CAST('2026-08-05 10:00:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @v4, @p_gow, NULL, 1, 159900.00, 30381.00, 0.00, 190281.00, CAST('2026-08-05 10:00:00' AS DATETIME)
  UNION ALL
  SELECT @v4, @p_gt7, NULL, 1, 249900.00, 47481.00, 0.00, 297381.00, CAST('2026-08-05 10:00:00' AS DATETIME)
) src
WHERE @v4 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v4);

-- V5: O5 - 2026-08-18 - sub 1899900, imp 360981, total 2260881 (transferencia)
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o5, 'CYR-2026-0005', 1899900.00, 360981.00, 19.00, 0.00, 0.00, 2260881.00,
        'transferencia', 'Pago por transferencia bancaria', 'activa', '2026-08-18 14:30:00', '2026-08-18 14:30:00', '2026-08-18 14:30:00');
SET @v5 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0005' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v5 AS venta_id, @p_ps5 AS producto_id, NULL AS servicio_id, 1 AS cantidad, 1899900.00 AS precio_unitario, 360981.00 AS impuesto_item, 0.00 AS descuento_item, 2260881.00 AS subtotal, CAST('2026-08-18 14:30:00' AS DATETIME) AS created_at
) src
WHERE @v5 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v5);

-- V6: O6 - 2026-09-01 - sub 489800, imp 93062, total 582862
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o6, 'CYR-2026-0006', 489800.00, 93062.00, 19.00, 0.00, 0.00, 582862.00,
        'stripe', NULL, 'activa', '2026-09-01 11:00:00', '2026-09-01 11:00:00', '2026-09-01 11:00:00');
SET @v6 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0006' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v6 AS venta_id, @p_ds2 AS producto_id, NULL AS servicio_id, 1 AS cantidad, 259900.00 AS precio_unitario, 49381.00 AS impuesto_item, 0.00 AS descuento_item, 309281.00 AS subtotal, CAST('2026-09-01 11:00:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @v6, @p_re, NULL, 1, 229900.00, 43681.00, 0.00, 273581.00, CAST('2026-09-01 11:00:00' AS DATETIME)
) src
WHERE @v6 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v6);

-- V7: O7 - 2026-09-10 - sub 459800, imp 87362, total 547162
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o7, 'CYR-2026-0007', 459800.00, 87362.00, 19.00, 0.00, 0.00, 547162.00,
        'stripe', NULL, 'activa', '2026-09-10 18:30:00', '2026-09-10 18:30:00', '2026-09-10 18:30:00');
SET @v7 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0007' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v7 AS venta_id, @p_ff7 AS producto_id, NULL AS servicio_id, 1 AS cantidad, 279900.00 AS precio_unitario, 53181.00 AS impuesto_item, 0.00 AS descuento_item, 333081.00 AS subtotal, CAST('2026-09-10 18:30:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @v7, @p_spider, NULL, 1, 179900.00, 34181.00, 0.00, 214081.00, CAST('2026-09-10 18:30:00' AS DATETIME)
) src
WHERE @v7 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v7);

-- V8: O8 - 2026-09-20 - sub 899900, imp 170981, total 1070881
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o8, 'CYR-2026-0008', 899900.00, 170981.00, 19.00, 0.00, 0.00, 1070881.00,
        'stripe', NULL, 'activa', '2026-09-20 12:30:00', '2026-09-20 12:30:00', '2026-09-20 12:30:00');
SET @v8 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0008' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v8 AS venta_id, @p_dual AS producto_id, NULL AS servicio_id, 1 AS cantidad, 899900.00 AS precio_unitario, 170981.00 AS impuesto_item, 0.00 AS descuento_item, 1070881.00 AS subtotal, CAST('2026-09-20 12:30:00' AS DATETIME) AS created_at
) src
WHERE @v8 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v8);

-- V9: O9 - 2026-09-22 - sub 349800, imp 66462, total 416262 - ANULADA
INSERT IGNORE INTO ventas (orden_id, numero_factura, subtotal, impuesto_valor, impuesto_porcentaje,
                           descuento_valor, descuento_porcentaje, total_neto, metodo_pago,
                           notas_factura, estado, fecha_venta, created_at, updated_at)
VALUES (@o9, 'CYR-2026-0009', 349800.00, 66462.00, 19.00, 0.00, 0.00, 416262.00,
        'stripe', 'Factura anulada por devolucion', 'anulada', '2026-09-22 10:00:00', '2026-09-22 10:00:00', '2026-09-22 10:00:00');
SET @v9 := (SELECT id FROM ventas WHERE numero_factura = 'CYR-2026-0009' LIMIT 1);
INSERT INTO ventas_detalles (venta_id, producto_id, servicio_id, cantidad, precio_unitario,
                             impuesto_item, descuento_item, subtotal, created_at)
SELECT src.venta_id, src.producto_id, src.servicio_id, src.cantidad, src.precio_unitario,
       src.impuesto_item, src.descuento_item, src.subtotal, src.created_at
FROM (
  SELECT @v9 AS venta_id, @p_tlou AS producto_id, NULL AS servicio_id, 1 AS cantidad, 199900.00 AS precio_unitario, 37981.00 AS impuesto_item, 0.00 AS descuento_item, 237881.00 AS subtotal, CAST('2026-09-22 10:00:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @v9, @p_ac4, NULL, 1, 149900.00, 28481.00, 0.00, 178381.00, CAST('2026-09-22 10:00:00' AS DATETIME)
) src
WHERE @v9 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas_detalles WHERE venta_id = @v9);

-- -----------------------------------------------------
-- 9. Pagos (10) - reference es UNIQUE: INSERT IGNORE
--    amount = total de la orden * 100
--    (misma fórmula que usa app/routers/pagos.py)
--    Solo si la orden correspondiente ya existe.
-- -----------------------------------------------------
INSERT IGNORE INTO pagos (orden_id, stripe_session_id, reference, amount_in_cents, currency, status,
                          payment_method_type, customer_email, stripe_response, created_at, updated_at)
SELECT src.orden_id, NULL, src.reference, src.amount_in_cents, 'usd', src.status,
       'card', src.customer_email, NULL, src.created_at, src.updated_at
FROM (
  SELECT @o1 AS orden_id, 'SEED-PAGO-0001' AS reference, 27980000 AS amount_in_cents, 'paid' AS status, 'cliente@cyrex.com' AS customer_email, CAST('2026-06-15 10:25:00' AS DATETIME) AS created_at, CAST('2026-06-15 10:30:00' AS DATETIME) AS updated_at
  UNION ALL SELECT @o2, 'SEED-PAGO-0002', 41980000, 'paid', 'laura@cyrex.com', CAST('2026-07-02 11:45:00' AS DATETIME), CAST('2026-07-02 12:00:00' AS DATETIME)
  UNION ALL SELECT @o3, 'SEED-PAGO-0003', 66970000, 'paid', 'andres@cyrex.com', CAST('2026-07-20 17:00:00' AS DATETIME), CAST('2026-07-20 17:15:00' AS DATETIME)
  UNION ALL SELECT @o4, 'SEED-PAGO-0004', 58970000, 'paid', 'maria@cyrex.com', CAST('2026-08-05 09:30:00' AS DATETIME), CAST('2026-08-05 10:00:00' AS DATETIME)
  UNION ALL SELECT @o5, 'SEED-PAGO-0005', 189990000, 'paid', 'cliente@cyrex.com', CAST('2026-08-18 14:10:00' AS DATETIME), CAST('2026-08-18 14:30:00' AS DATETIME)
  UNION ALL SELECT @o6, 'SEED-PAGO-0006', 48980000, 'paid', 'laura@cyrex.com', CAST('2026-09-01 10:45:00' AS DATETIME), CAST('2026-09-01 11:00:00' AS DATETIME)
  UNION ALL SELECT @o7, 'SEED-PAGO-0007', 45980000, 'paid', 'andres@cyrex.com', CAST('2026-09-10 18:20:00' AS DATETIME), CAST('2026-09-10 18:30:00' AS DATETIME)
  UNION ALL SELECT @o8, 'SEED-PAGO-0008', 89990000, 'paid', 'maria@cyrex.com', CAST('2026-09-20 12:10:00' AS DATETIME), CAST('2026-09-20 12:30:00' AS DATETIME)
  UNION ALL SELECT @o9, 'SEED-PAGO-0009', 34980000, 'paid', 'cliente@cyrex.com', CAST('2026-09-22 09:40:00' AS DATETIME), CAST('2026-09-22 10:00:00' AS DATETIME)
  UNION ALL SELECT @o10, 'SEED-PAGO-0010', 22990000, 'pending', 'laura@cyrex.com', CAST('2026-09-23 08:15:00' AS DATETIME), CAST('2026-09-23 08:15:00' AS DATETIME)
) src
WHERE src.orden_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pagos WHERE pagos.reference = src.reference);

-- -----------------------------------------------------
-- 10. PQR (5) en distintos estados
--     tipo valido: peticion | queja | reclamo
--     estado valido: pendiente | en_proceso | respondida | cerrada
-- -----------------------------------------------------
INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta, fecha_creacion, fecha_respuesta)
SELECT @u_carlos, 'reclamo', 'Producto con defecto',
       'El disco de God of War viene rayado y no lee en la consola.',
       'respondida',
       'Se realizo el cambio del producto. Nuevo despacho sin costo.',
       '2026-07-10 09:00:00', '2026-07-12 15:00:00'
FROM DUAL
WHERE @u_carlos IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pqr WHERE usuario_id = @u_carlos AND asunto = 'Producto con defecto');

INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta, fecha_creacion, fecha_respuesta)
SELECT @u_laura, 'peticion', 'Solicitud de devolucion',
       'Necesito devolver Horizon Forbidden West porque ya lo tengo.',
       'pendiente', NULL, '2026-09-18 10:00:00', NULL
FROM DUAL
WHERE @u_laura IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pqr WHERE usuario_id = @u_laura AND asunto = 'Solicitud de devolucion');

INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta, fecha_creacion, fecha_respuesta)
SELECT @u_andres, 'queja', 'Demora en el envio',
       'La orden 3 tardo mas de una semana en llegar a Medellin.',
       'en_proceso', NULL, '2026-09-05 14:30:00', NULL
FROM DUAL
WHERE @u_andres IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pqr WHERE usuario_id = @u_andres AND asunto = 'Demora en el envio');

INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta, fecha_creacion, fecha_respuesta)
SELECT @u_maria, 'peticion', 'Solicitud de factura digital',
       'Necesito la factura detallada de mi ultima compra para contabilidad.',
       'respondida',
       'Se envio la factura al correo registrado. Gracias por escribir.',
       '2026-08-22 16:00:00', '2026-08-23 09:00:00'
FROM DUAL
WHERE @u_maria IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pqr WHERE usuario_id = @u_maria AND asunto = 'Solicitud de factura digital');

INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta, fecha_creacion, fecha_respuesta)
SELECT @u_carlos, 'reclamo', 'Clave de juego no valida',
       'La clave de PlayStation Plus que compre no funciona.',
       'respondida',
       'Clave reemplazada y verificada. Revisa tu correo.',
       '2026-09-12 11:20:00', '2026-09-13 10:00:00'
FROM DUAL
WHERE @u_carlos IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pqr WHERE usuario_id = @u_carlos AND asunto = 'Clave de juego no valida');

-- -----------------------------------------------------
-- 11. Conversación del chatbot (4 mensajes)
-- -----------------------------------------------------
INSERT INTO conversaciones_chat (usuario_id, created_at, updated_at)
SELECT @u_carlos, '2026-09-20 16:00:00', '2026-09-20 16:05:00'
FROM DUAL
WHERE @u_carlos IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM conversaciones_chat WHERE usuario_id = @u_carlos AND created_at = '2026-09-20 16:00:00');
SET @chat1 := (SELECT id FROM conversaciones_chat WHERE usuario_id = @u_carlos AND created_at = '2026-09-20 16:00:00' ORDER BY id LIMIT 1);

INSERT INTO mensajes_chat (conversacion_id, rol, contenido, created_at)
SELECT src.conversacion_id, src.rol, src.contenido, src.created_at
FROM (
  SELECT @chat1 AS conversacion_id, 'user' AS rol, 'Hola, cuanto cuesta la PlayStation 5?' AS contenido, CAST('2026-09-20 16:00:00' AS DATETIME) AS created_at
  UNION ALL
  SELECT @chat1, 'assistant', 'Hola! La PlayStation 5 Slim Digital cuesta $1.899.900 COP y contamos con 8 unidades en stock.', CAST('2026-09-20 16:01:00' AS DATETIME)
  UNION ALL
  SELECT @chat1, 'user', 'Hacen envios a Medellin?', CAST('2026-09-20 16:03:00' AS DATETIME)
  UNION ALL
  SELECT @chat1, 'assistant', 'Los tiempos y el costo de envio se confirman durante el proceso de compra segun tu direccion.', CAST('2026-09-20 16:05:00' AS DATETIME)
) src
WHERE @chat1 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM mensajes_chat WHERE conversacion_id = @chat1);

-- =====================================================
-- VERIFICACIONES (SELECTs opcionales)
-- =====================================================
SELECT 'usuarios' AS tabla, COUNT(*) AS total FROM usuarios
UNION ALL SELECT 'productos', COUNT(*) FROM productos
UNION ALL SELECT 'servicios', COUNT(*) FROM servicios
UNION ALL SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL SELECT 'ordenes', COUNT(*) FROM ordenes
UNION ALL SELECT 'ordenes_detalles', COUNT(*) FROM ordenes_detalles
UNION ALL SELECT 'ventas', COUNT(*) FROM ventas
UNION ALL SELECT 'ventas_detalles', COUNT(*) FROM ventas_detalles
UNION ALL SELECT 'pagos', COUNT(*) FROM pagos
UNION ALL SELECT 'pqr', COUNT(*) FROM pqr
UNION ALL SELECT 'conversaciones_chat', COUNT(*) FROM conversaciones_chat
UNION ALL SELECT 'mensajes_chat', COUNT(*) FROM mensajes_chat;

-- Coherencia: total de la factura = suma de sus detalles
SELECT v.numero_factura,
       v.total_neto,
       ROUND(SUM(d.subtotal), 2) AS suma_detalles
FROM ventas v
JOIN ventas_detalles d ON d.venta_id = v.id
WHERE v.numero_factura LIKE 'CYR-2026-%'
GROUP BY v.id, v.numero_factura, v.total_neto
ORDER BY v.numero_factura;

-- Coherencia: total de la orden = suma de sus detalles
-- (solo las órdenes creadas por este seed)
SELECT o.id AS orden,
       o.total,
       ROUND(SUM(od.subtotal), 2) AS suma_detalles,
       o.estado
FROM ordenes o
JOIN ordenes_detalles od ON od.orden_id = o.id
WHERE (o.usuario_id, o.created_at) IN (
  (@u_carlos, '2026-06-15 10:00:00'), (@u_laura, '2026-07-02 11:30:00'),
  (@u_andres, '2026-07-20 16:45:00'), (@u_maria, '2026-08-05 09:15:00'),
  (@u_carlos, '2026-08-18 14:00:00'), (@u_laura, '2026-09-01 10:30:00'),
  (@u_andres, '2026-09-10 18:00:00'), (@u_maria, '2026-09-20 12:00:00'),
  (@u_carlos, '2026-09-22 09:30:00'), (@u_laura, '2026-09-23 08:00:00'),
  (@u_andres, '2026-09-21 15:00:00'), (@u_maria, '2026-07-15 11:00:00')
)
GROUP BY o.id, o.total, o.estado
ORDER BY o.id;
