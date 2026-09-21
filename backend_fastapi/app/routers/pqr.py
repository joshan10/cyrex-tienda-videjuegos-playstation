from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.pqr import actualizar_pqr, crear_pqr, listar_pqrs, obtener_pqr, resumen_pqrs
from app.dependencies import current_user, require_roles
from app.models.entities import PQR
from app.schemas.pqr import PQRActualizar, PQREntrada, PQRResumen, PQRRespuesta

router = APIRouter(prefix="/pqr", tags=["PQR"])


@router.post("", response_model=PQRRespuesta, status_code=201)
def crear_peticion(data: PQREntrada, user: dict = Depends(current_user), db: Session = Depends(get_db)):
    return crear_pqr(db, data, user["id"])


@router.get("", response_model=list[PQRRespuesta])
def listar(
    estado: str | None = Query(default=None, pattern=r"^(pendiente|en_proceso|respondida|cerrada)$"),
    user: dict = Depends(current_user),
    db: Session = Depends(get_db),
):
    is_staff = user["rol_nombre"] in {"Administrador", "Empleado"}
    return listar_pqrs(db, estado=estado) if is_staff else listar_pqrs(db, usuario_id=user["id"], estado=estado)


@router.get("/resumen", response_model=PQRResumen)
def resumen(user: dict = Depends(require_roles("Administrador", "Empleado")), db: Session = Depends(get_db)):
    return resumen_pqrs(db)


@router.get("/{pqr_id}", response_model=PQRRespuesta)
def detalle(pqr_id: int, user: dict = Depends(current_user), db: Session = Depends(get_db)):
    pqr = obtener_pqr(db, pqr_id)
    if not pqr or (pqr.usuario_id != user["id"] and user["rol_nombre"] not in {"Administrador", "Empleado"}):
        raise HTTPException(status_code=404, detail="PQR no encontrada")
    return pqr


@router.patch("/{pqr_id}", response_model=PQRRespuesta)
def actualizar(
    pqr_id: int,
    data: PQRActualizar,
    user: dict = Depends(require_roles("Administrador", "Empleado")),
    db: Session = Depends(get_db),
):
    pqr = obtener_pqr(db, pqr_id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")
    return actualizar_pqr(db, pqr, data)