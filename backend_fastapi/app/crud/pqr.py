from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import PQR
from app.schemas.pqr import PQRActualizar, PQREntrada


def crear_pqr(db: Session, data: PQREntrada, usuario_id: int) -> PQR:
    pqr = PQR(usuario_id=usuario_id, **data.model_dump())
    db.add(pqr)
    db.commit()
    db.refresh(pqr)
    return pqr


def listar_pqrs(db: Session, usuario_id: int | None = None, estado: str | None = None) -> list[PQR]:
    query = select(PQR).order_by(PQR.fecha_creacion.desc())
    if usuario_id is not None:
        query = query.where(PQR.usuario_id == usuario_id)
    if estado:
        query = query.where(PQR.estado == estado)
    return list(db.scalars(query).all())


def obtener_pqr(db: Session, pqr_id: int) -> PQR | None:
    return db.get(PQR, pqr_id)


def actualizar_pqr(db: Session, pqr: PQR, data: PQRActualizar) -> PQR:
    values = data.model_dump(exclude_unset=True)
    for key, value in values.items():
        setattr(pqr, key, value)
    if "respuesta" in values or values.get("estado") == "respondida":
        pqr.fecha_respuesta = datetime.utcnow()
    db.commit()
    db.refresh(pqr)
    return pqr


def resumen_pqrs(db: Session) -> dict[str, int]:
    total = db.scalar(select(func.count(PQR.id))) or 0
    pendientes = db.scalar(select(func.count(PQR.id)).where(PQR.estado == "pendiente")) or 0
    return {"total": total, "pendientes": pendientes}