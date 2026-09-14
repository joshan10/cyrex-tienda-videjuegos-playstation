class CyrexException(Exception):
    """Excepción base del dominio Cyrex."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class RecursoNoEncontrado(CyrexException):
    """404 - Recurso no encontrado."""

    def __init__(self, recurso: str, id: int | None = None):
        detail = f"{recurso} no encontrado" + (f" con id {id}" if id else "")
        super().__init__(detail, status_code=404)


class ConflictoNegocio(CyrexException):
    """409 - Conflicto de negocio (dato duplicado, estado inválido)."""

    def __init__(self, message: str):
        super().__init__(message, status_code=409)


class CuentaInactiva(CyrexException):
    """403 - Cuenta desactivada."""

    def __init__(self):
        super().__init__("La cuenta está desactivada. Contacta al administrador.", status_code=403)


class CredencialesInvalidas(CyrexException):
    """401 - Credenciales incorrectas."""

    def __init__(self):
        super().__init__("Credenciales incorrectas.", status_code=401)


class StockInsuficiente(CyrexException):
    """409 - Stock insuficiente para la operación."""

    def __init__(self, producto_nombre: str, disponible: int):
        super().__init__(f'Stock insuficiente para "{producto_nombre}". Disponible: {disponible}', status_code=409)


class TokenInvalido(CyrexException):
    """401 - Token inválido o ausente."""

    def __init__(self, detail: str = "Token inválido."):
        super().__init__(detail, status_code=401)


class AccesoDenegado(CyrexException):
    """403 - Acceso denegado por rol."""

    def __init__(self, roles_requeridos: list[str]):
        super().__init__(
            f"Acceso denegado. Se requiere rol: {' o '.join(roles_requeridos)}",
            status_code=403,
        )
