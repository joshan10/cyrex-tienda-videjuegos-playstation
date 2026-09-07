from decimal import Decimal
from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

from app.models.entities import Categoria, Orden, OrdenDetalle, Producto, Servicio, Usuario
from app.models.roles import Permiso, Rol, RolPermiso
from app.schemas.common import public_dict


def user_view(db: Session, user: Usuario) -> dict:
    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    data = public_dict(user)
    data.pop("password", None)
    data["rol_nombre"] = role
    return data


def permissions(db: Session, role_id: int) -> list[str]:
    return list(db.scalars(select(Permiso.nombre).join(RolPermiso, Permiso.id == RolPermiso.permiso_id).where(RolPermiso.rol_id == role_id)).all())


def product_view(db: Session, product: Producto) -> dict:
    data = public_dict(product)
    data["categoria_nombre"] = db.scalar(select(Categoria.nombre).where(Categoria.id == product.categoria_id))
    return data


def order_view(db: Session, order: Orden) -> dict:
    data = public_dict(order)
    user = db.get(Usuario, order.usuario_id)
    data.update({"usuario_nombre": user.nombre, "usuario_apellido": user.apellido, "usuario_correo": user.correo})
    details = db.scalars(select(OrdenDetalle).where(OrdenDetalle.orden_id == order.id)).all()
    data["detalles"] = []
    for detail in details:
        item = public_dict(detail)
        product = db.get(Producto, detail.producto_id)
        item.update({"producto_nombre": product.nombre, "imagen_url": product.imagen_url})
        data["detalles"].append(item)
    return data


def create_order(db: Session, user_id: int, items: list, address: str | None, notes: str | None) -> dict:
    total = Decimal("0")
    prepared = []
    for item in items:
        product = db.scalar(select(Producto).where(Producto.id == item.producto_id, Producto.estado == "activo").with_for_update())
        if not product:
            raise ValueError(f"Producto con ID {item.producto_id} no encontrado o no disponible")
        if product.stock < item.cantidad:
            raise ValueError(f'Stock insuficiente para "{product.nombre}". Disponible: {product.stock}')
        subtotal = product.precio * item.cantidad
        total += subtotal
        prepared.append((product, item.cantidad, subtotal))
    order = Orden(usuario_id=user_id, total=total, direccion_envio=address, notas=notes)
    db.add(order)
    db.flush()
    for product, quantity, subtotal in prepared:
        db.add(OrdenDetalle(orden_id=order.id, producto_id=product.id, cantidad=quantity, precio_unitario=product.precio, subtotal=subtotal))
        product.stock -= quantity
    db.commit()
    db.refresh(order)
    return order_view(db, order)
