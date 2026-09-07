SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Administrador (rol_id = 1)
INSERT INTO usuarios (id, nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id)
VALUES (
  1, 'Admin', 'Cyrex', 'cc', '1000000001', 'Oficina Central Cyrex', '3001234567',
  'admin@cyrex.com',
  '$2b$10$tHIKYVYODXbxwTZ6s7CeDONE/SzDWEyZolMwyNZ.XnUTzI3czYtda',
  'activo', 1
);

-- 2. Empleado (rol_id = 2)
INSERT INTO usuarios (id, nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id)
VALUES (
  2, 'Empleado', 'Asistente', 'cc', '2000000002', 'Sucursal Cyrex', '3009876543',
  'empleado@cyrex.com',
  '$2b$10$r4h3fntapvneB2YFPPAIzuH9cIc23RAppEdhucXoqROKtQkYsI7Xy',
  'activo', 2
);

-- 3. Cliente (rol_id = 3)
INSERT INTO usuarios (id, nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, password, estado, rol_id)
VALUES (
  3, 'Carlos', 'Gamer', 'cc', '3000000003', 'Av Siempre Viva 123', '3201112233',
  'cliente@cyrex.com',
  '$2b$10$ZeLHRAu88IMoYC4Fhp.CduoIAZf42dbbxyQoy0myHkwaApWLEWMfe',
  'activo', 3
);
