-- =====================================================
-- Migración: imagen_public_id en productos (Cloudinary)
-- Guarda el public_id de Cloudinary para poder borrar
-- la imagen cuando se actualice o elimine el producto.
--
-- Ejecutar en TiDB Cloud sobre la base del proyecto.
-- Idempotente: si la columna ya existe, no hace nada.
-- =====================================================

ALTER TABLE productos ADD COLUMN imagen_public_id VARCHAR(255) DEFAULT NULL;
