from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class VentaEntrada(APIModel):
    orden_id: int = Field(ge=1)
    impuesto_porcentaje: Decimal = Field(default=0, ge=0, le=100)
    descuento_porcentaje: Decimal = Field(default=0, ge=0, le=100)
    metodo_pago: str = Field(default="stripe", max_length=50)
    notas_factura: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
        json_schema_extra={
            "examples": [
                {
                    "orden_id": 1,
                    "impuesto_porcentaje": 19.0,
                    "descuento_porcentaje": 0,
                    "metodo_pago": "stripe",
                    "notas_factura": "Factura de venta de videojuegos",
                }
            ]
        },
    )


class VentaActualizar(APIModel):
    notas_factura: str | None = None
    descuento_porcentaje: Decimal | None = Field(default=None, ge=0, le=100)
    estado: str | None = None


class VentaDetalleRespuesta(APIModel):
    id: int
    producto_id: int
    producto_nombre: str | None = None
    servicio_id: int | None = None
    servicio_nombre: str | None = None
    cantidad: int
    precio_unitario: float
    impuesto_item: float
    descuento_item: float
    subtotal: float
    imagen_url: str | None = None


class VentaRespuesta(APIModel):
    id: int
    orden_id: int
    numero_factura: str
    subtotal: float
    impuesto_valor: float
    impuesto_porcentaje: float
    descuento_valor: float
    descuento_porcentaje: float
    total_neto: float
    metodo_pago: str
    notas_factura: str | None = None
    estado: str
    fecha_venta: datetime | None = None
    created_at: datetime | None = None
    usuario_nombre: str | None = None
    usuario_apellido: str | None = None
    usuario_correo: str | None = None
    usuario_documento: str | None = None
    detalles: list[VentaDetalleRespuesta] = []


class FacturaFiltros(APIModel):
    numero_factura: str | None = None
    cliente_correo: str | None = None
    cliente_documento: str | None = None
    fecha_desde: str | None = None
    fecha_hasta: str | None = None
    estado: str | None = None
    producto_id: int | None = None
    servicio_id: int | None = None
    valor_minimo: float | None = None
    valor_maximo: float | None = None
    metodo_pago: str | None = None


class VentaStats(APIModel):
    total_facturado: float
    total_impuestos: float
    total_descuentos: float
    num_facturas: int
    ventas_por_estado: dict[str, int]
    ventas_recientes: list[dict]
