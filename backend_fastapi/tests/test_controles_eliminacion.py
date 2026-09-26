from app.models.entities import Producto, Usuario, Venta

from .conftest import login_headers


def _crear_producto(db, nombre="Juego Control"):
    producto = Producto(nombre=nombre, precio=120000, stock=5, plataforma="PlayStation 5")
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


def _crear_orden(client, headers, producto, cantidad=1):
    response = client.post(
        "/api/ordenes",
        headers=headers,
        json={
            "items": [{"producto_id": producto.id, "cantidad": cantidad}],
            "direccion_envio": "Calle Cliente 456, Ciudad",
        },
    )
    assert response.status_code == 201
    return response.json()["orden"]["id"]


def _completar_orden(client, admin_headers, orden_id):
    response = client.patch(
        f"/api/ordenes/{orden_id}/estado",
        headers=admin_headers,
        json={"estado": "completada"},
    )
    assert response.status_code == 200


def _venta_de_orden(client, admin_headers, orden_id):
    response = client.get("/api/ventas", headers=admin_headers)
    assert response.status_code == 200
    return next(item for item in response.json()["items"] if item["orden_id"] == orden_id)


def test_no_se_puede_eliminar_cliente_con_venta_activa(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    producto = _crear_producto(db)
    orden_id = _crear_orden(client, customer_headers, producto)
    _completar_orden(client, admin_headers, orden_id)

    response = client.delete(f"/api/usuarios/{customer_user.id}", headers=admin_headers)

    assert response.status_code == 409
    assert "venta(s) activa(s)" in response.json()["error"]["message"]
    assert db.get(Usuario, customer_user.id) is not None


def test_no_se_puede_eliminar_cliente_con_orden_en_curso(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    producto = _crear_producto(db)
    _crear_orden(client, customer_headers, producto)

    response = client.delete(f"/api/usuarios/{customer_user.id}", headers=admin_headers)

    assert response.status_code == 409
    assert "orden(es) en curso" in response.json()["error"]["message"]
    assert db.get(Usuario, customer_user.id) is not None


def test_se_puede_eliminar_cliente_con_orden_cerrada_y_venta_anulada(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    producto = _crear_producto(db)
    orden_id = _crear_orden(client, customer_headers, producto)
    _completar_orden(client, admin_headers, orden_id)
    venta = _venta_de_orden(client, admin_headers, orden_id)

    response = client.patch(
        f"/api/ventas/{venta['id']}",
        headers=admin_headers,
        json={"estado": "anulada"},
    )
    assert response.status_code == 200

    response = client.delete(f"/api/usuarios/{customer_user.id}", headers=admin_headers)

    assert response.status_code == 204
    assert db.get(Usuario, customer_user.id) is None
    assert db.get(Venta, venta["id"]) is not None


def test_no_se_puede_eliminar_producto_con_venta_activa(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    producto = _crear_producto(db)
    orden_id = _crear_orden(client, customer_headers, producto)
    _completar_orden(client, admin_headers, orden_id)

    response = client.delete(f"/api/productos/{producto.id}", headers=admin_headers)

    assert response.status_code == 409
    assert "venta(s) activa(s)" in response.json()["error"]["message"]
    assert db.get(Producto, producto.id) is not None


def test_no_se_puede_eliminar_producto_con_venta_anulada(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    producto = _crear_producto(db)
    orden_id = _crear_orden(client, customer_headers, producto)
    _completar_orden(client, admin_headers, orden_id)
    venta = _venta_de_orden(client, admin_headers, orden_id)

    response = client.patch(
        f"/api/ventas/{venta['id']}",
        headers=admin_headers,
        json={"estado": "anulada"},
    )
    assert response.status_code == 200

    response = client.delete(f"/api/productos/{producto.id}", headers=admin_headers)

    assert response.status_code == 409
    assert "histórico" in response.json()["error"]["message"]
    assert db.get(Producto, producto.id) is not None


def test_no_se_puede_eliminar_producto_en_orden_en_curso(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    producto = _crear_producto(db)
    _crear_orden(client, customer_headers, producto)

    response = client.delete(f"/api/productos/{producto.id}", headers=admin_headers)

    assert response.status_code == 409
    assert "orden(es) en curso" in response.json()["error"]["message"]
    assert db.get(Producto, producto.id) is not None


def test_admin_no_puede_eliminar_su_propia_cuenta(client, db, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.delete(f"/api/usuarios/{admin_user.id}", headers=admin_headers)

    assert response.status_code == 409
    assert response.json()["error"]["message"] == "No puedes eliminar tu propia cuenta."
    assert db.get(Usuario, admin_user.id) is not None


def test_no_se_puede_eliminar_cliente_con_pqr(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")

    response = client.post(
        "/api/pqr",
        headers=customer_headers,
        json={
            "tipo": "reclamo",
            "asunto": "Producto defectuoso",
            "descripcion": "El juego llegó con la caja abierta y sin disco.",
        },
    )
    assert response.status_code == 201

    response = client.delete(f"/api/usuarios/{customer_user.id}", headers=admin_headers)

    assert response.status_code == 409
    assert "PQR" in response.json()["error"]["message"]
    assert db.get(Usuario, customer_user.id) is not None
