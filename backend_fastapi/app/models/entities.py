from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    apellido: Mapped[str] = mapped_column(String(100))
    tipo_documento: Mapped[str] = mapped_column(String(20))
    numero_documento: Mapped[str] = mapped_column(String(20), unique=True)
    direccion: Mapped[str] = mapped_column(String(255))
    telefono: Mapped[str] = mapped_column(String(20))
    correo: Mapped[str] = mapped_column(String(150), unique=True)
    password: Mapped[str] = mapped_column(String(255))
    estado: Mapped[str] = mapped_column(String(20), default="activo")
    rol_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Producto(Base):
    __tablename__ = "productos"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))
    descripcion: Mapped[str | None] = mapped_column(Text)
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    imagen_url: Mapped[str | None] = mapped_column(String(500))
    plataforma: Mapped[str | None] = mapped_column(String(50))
    categoria_id: Mapped[int | None] = mapped_column(ForeignKey("categorias.id"))
    estado: Mapped[str] = mapped_column(String(20), default="activo")
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Categoria(Base):
    __tablename__ = "categorias"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    descripcion: Mapped[str | None] = mapped_column(String(255))
    imagen_url: Mapped[str | None] = mapped_column(String(500))
    estado: Mapped[str] = mapped_column(String(20), default="activo")
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Servicio(Base):
    __tablename__ = "servicios"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))
    descripcion: Mapped[str | None] = mapped_column(Text)
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    duracion: Mapped[str | None] = mapped_column(String(50))
    estado: Mapped[str] = mapped_column(String(20), default="activo")
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Orden(Base):
    __tablename__ = "ordenes"
    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    estado: Mapped[str] = mapped_column(String(20), default="pendiente")
    direccion_envio: Mapped[str | None] = mapped_column(String(255))
    notas: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class OrdenDetalle(Base):
    __tablename__ = "ordenes_detalles"
    id: Mapped[int] = mapped_column(primary_key=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes.id"))
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"))
    cantidad: Mapped[int] = mapped_column(Integer)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    token: Mapped[str] = mapped_column(String(255), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    correo: Mapped[str] = mapped_column(String(150), index=True)
    token: Mapped[str] = mapped_column(String(255), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Pago(Base):
    __tablename__ = "pagos"
    id: Mapped[int] = mapped_column(primary_key=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes.id"))
    stripe_session_id: Mapped[str | None] = mapped_column(String(255))
    reference: Mapped[str] = mapped_column(String(255), unique=True)
    amount_in_cents: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="usd")
    status: Mapped[str] = mapped_column(String(20), default="pending")
    payment_method_type: Mapped[str | None] = mapped_column(String(20))
    customer_email: Mapped[str] = mapped_column(String(150))
    stripe_response: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Venta(Base):
    __tablename__ = "ventas"
    id: Mapped[int] = mapped_column(primary_key=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes.id"), unique=True)
    numero_factura: Mapped[str] = mapped_column(String(50), unique=True)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    impuesto_valor: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    impuesto_porcentaje: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    descuento_valor: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    descuento_porcentaje: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    total_neto: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    metodo_pago: Mapped[str] = mapped_column(String(50), default="stripe")
    notas_factura: Mapped[str | None] = mapped_column(Text, nullable=True)
    estado: Mapped[str] = mapped_column(String(20), default="activa")
    fecha_venta: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    orden: Mapped["Orden"] = relationship("Orden")
    detalles: Mapped[list["VentaDetalle"]] = relationship("VentaDetalle", back_populates="venta")


class VentaDetalle(Base):
    __tablename__ = "ventas_detalles"
    id: Mapped[int] = mapped_column(primary_key=True)
    venta_id: Mapped[int] = mapped_column(ForeignKey("ventas.id"))
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"))
    servicio_id: Mapped[int | None] = mapped_column(ForeignKey("servicios.id"), nullable=True)
    cantidad: Mapped[int] = mapped_column(Integer)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    impuesto_item: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    descuento_item: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    venta: Mapped["Venta"] = relationship("Venta", back_populates="detalles")
    producto: Mapped["Producto"] = relationship("Producto")
