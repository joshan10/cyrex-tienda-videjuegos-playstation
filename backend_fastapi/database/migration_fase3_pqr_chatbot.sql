-- Ejecutar sobre una base cyrex_db existente.
-- No elimina ni modifica datos actuales.
USE cyrex_db;

CREATE TABLE IF NOT EXISTS pqr (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  tipo            VARCHAR(20) NOT NULL,
  asunto          VARCHAR(200) NOT NULL,
  descripcion     TEXT NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  respuesta       TEXT DEFAULT NULL,
  fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_pqr_usuario (usuario_id),
  INDEX idx_pqr_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conversaciones_chat (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_chat_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensajes_chat (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  rol             VARCHAR(20) NOT NULL,
  contenido       TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones_chat(id) ON DELETE CASCADE,
  INDEX idx_mensaje_conversacion (conversacion_id)
) ENGINE=InnoDB;
