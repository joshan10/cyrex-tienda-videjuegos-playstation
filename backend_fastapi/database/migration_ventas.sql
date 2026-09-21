-- Migración: Módulo de Ventas y Facturación
-- Fase 1: Base (Requerimientos fáciles + Módulo de ventas)

CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL UNIQUE,
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuesto_valor DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuesto_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
    descuento_valor DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_neto DECIMAL(12,2) NOT NULL DEFAULT 0,
    metodo_pago VARCHAR(50) DEFAULT 'stripe',
    notas_factura TEXT,
    estado VARCHAR(20) DEFAULT 'activa',
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ventas_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    servicio_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    impuesto_item DECIMAL(10,2) DEFAULT 0,
    descuento_item DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ventas_numero ON ventas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_detalles_venta ON ventas_detalles(venta_id);
