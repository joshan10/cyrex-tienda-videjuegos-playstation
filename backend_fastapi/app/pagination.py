import math

from fastapi import Query
from pydantic import BaseModel, Field


class Paginacion(BaseModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.size


def get_paginacion(
    page: int = Query(default=1, ge=1, description="Número de página"),
    size: int = Query(default=20, ge=1, le=100, description="Elementos por página"),
) -> Paginacion:
    return Paginacion(page=page, size=size)


def paginate_query(total: int, paginacion: Paginacion) -> dict:
    return {
        "total": total,
        "page": paginacion.page,
        "size": paginacion.size,
        "pages": math.ceil(total / paginacion.size) if total > 0 else 0,
    }
