from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class RegistroUsuario(APIModel):
    nombre: str = Field(min_length=2, max_length=100)
    apellido: str = Field(min_length=2, max_length=100)
    tipo_documento: str
    numero_documento: str = Field(pattern=r"^\d{6,15}$")
    direccion: str = Field(min_length=6)
    telefono: str = Field(pattern=r"^\+?\d{7,15}$")
    correo: EmailStr
    password: str = Field(min_length=8)
    rol_id: int | None = None

    @field_validator("tipo_documento")
    @classmethod
    def documento_valido(cls, value: str) -> str:
        if value not in {"cc", "ce", "pasaporte"}:
            raise ValueError("Tipo de documento inválido. Usa: cc, ce, pasaporte.")
        return value


class Login(APIModel):
    correo: EmailStr
    password: str


class Actualizacion(APIModel):
    model_config = ConfigDict(extra="allow")


class ProductoEntrada(APIModel):
    nombre: str = Field(min_length=1, max_length=200)
    precio: float = Field(ge=0)
    descripcion: str | None = None
    stock: int = Field(default=0, ge=0)
    imagen_url: str | None = None
    plataforma: str = "PlayStation"
    categoria_id: int | None = Field(default=None, ge=1)


class ProductoUpdate(APIModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio: float | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    plataforma: str | None = None
    categoria_id: int | None = None
    estado: str | None = None


class OrdenItem(APIModel):
    producto_id: int = Field(ge=1)
    cantidad: int = Field(ge=1)


class OrdenEntrada(APIModel):
    items: list[OrdenItem] = Field(min_length=1)
    direccion_envio: str | None = Field(default=None, min_length=6)
    notas: str | None = None


class EstadoOrden(APIModel):
    estado: str


def public_dict(value: Any) -> dict[str, Any]:
    data = {key: item for key, item in vars(value).items() if not key.startswith("_")}
    for key, item in data.items():
        if hasattr(item, "quantize"):
            data[key] = float(item)
    return data

class ForgotPassword(APIModel):
    correo: EmailStr

class ResetPassword(APIModel):
    token: str
    password: str = Field(min_length=8)
