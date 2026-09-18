"""
Migración: Crear tabla email_verification_tokens para login de dos pasos.
Ejecutar: python -m database.migrate_email_verification
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from app.core.database import SessionLocal

MIGRATION_SQL = """
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  correo VARCHAR(150) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ev_token (token),
  INDEX idx_ev_correo (correo)
);
"""


def migrate():
    db = SessionLocal()
    try:
        db.execute(text(MIGRATION_SQL))
        db.commit()
        print("Migración exitosa: tabla 'email_verification_tokens' creada.")
    except Exception as e:
        print(f"Error en la migración: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
