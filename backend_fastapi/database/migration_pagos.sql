-- =====================================================
-- Migración: Tabla pagos (módulo Stripe)
-- La tabla `pagos` no existía en cyrex_db.sql ni en
-- ninguna migración anterior, pero sí la usa el modelo
-- Pago (app/models/entities.py) y el router /api/pagos.
--
-- Ejecutar en TiDB Cloud sobre la base del proyecto.
-- Es idempotente: si la tabla ya existe, no hace nada.
-- =====================================================

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
