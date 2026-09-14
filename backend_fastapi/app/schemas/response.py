from pydantic import BaseModel, ConfigDict


class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    correo: str
    tipo_documento: str
    numero_documento: str
    telefono: str
    direccion: str
    estado: str
    rol_id: int
    rol_nombre: str | None = None


class ProductoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    precio: float
    descripcion: str | None = None
    stock: int
    imagen_url: str | None = None
    plataforma: str | None = None
    categoria_id: int | None = None
    categoria_nombre: str | None = None
    estado: str


class CategoriaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None = None
    imagen_url: str | None = None
    estado: str


class ServicioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None = None
    precio: float
    duracion: str | None = None
    estado: str


class OrdenDetalleRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    orden_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    subtotal: float
    producto_nombre: str | None = None
    imagen_url: str | None = None


class OrdenRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    total: float
    estado: str
    direccion_envio: str | None = None
    notas: str | None = None
    usuario_nombre: str | None = None
    usuario_apellido: str | None = None
    usuario_correo: str | None = None
    detalles: list[OrdenDetalleRespuesta] = []


class ListaUsuarios(BaseModel):
    usuarios: list[UsuarioRespuesta]


class ListaProductos(BaseModel):
    productos: list[ProductoRespuesta]


class ListaCategorias(BaseModel):
    categorias: list[CategoriaRespuesta]


class ListaServicios(BaseModel):
    servicios: list[ServicioRespuesta]


class ListaOrdenes(BaseModel):
    ordenes: list[OrdenRespuesta]


class PaginatedUsuarios(BaseModel):
    items: list[UsuarioRespuesta]
    total: int
    page: int
    size: int
    pages: int


class PaginatedProductos(BaseModel):
    items: list[ProductoRespuesta]
    total: int
    page: int
    size: int
    pages: int


class PaginatedCategorias(BaseModel):
    items: list[CategoriaRespuesta]
    total: int
    page: int
    size: int
    pages: int


class PaginatedServicios(BaseModel):
    items: list[ServicioRespuesta]
    total: int
    page: int
    size: int
    pages: int


class PaginatedOrdenes(BaseModel):
    items: list[OrdenRespuesta]
    total: int
    page: int
    size: int
    pages: int


class MensajeRespuesta(BaseModel):
    message: str


class TokenRespuesta(BaseModel):
    message: str
    token: str
    user: dict


class LoginRespuesta(BaseModel):
    message: str
    token: str
    user: dict


class UploadRespuesta(BaseModel):
    url: str


class ErrorDetalle(BaseModel):
    code: int
    message: str
    details: list[dict] | None = None


class ErrorResponse(BaseModel):
    ok: bool = False
    error: ErrorDetalle
