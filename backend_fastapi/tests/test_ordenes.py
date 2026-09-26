from app.models.entities import Producto

from .conftest import login_headers


def test_ordenes_get_post_patch(client, db, admin_user, customer_user):
    product = Producto(nombre="Juego de prueba", precio=25.0, stock=5, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.get("/api/ordenes", headers=customer_headers)
    assert response.status_code == 200
    assert response.json()["items"] == []

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 2}], "direccion_envio": "Calle Cliente 456, Ciudad"},
    )
    assert response.status_code == 201
    order_id = response.json()["orden"]["id"]

    response = client.patch(
        f"/api/ordenes/{order_id}/estado",
        headers=admin_headers,
        json={"estado": "completada"},
    )
    assert response.status_code == 200
    assert response.json()["orden"]["estado"] == "completada"


def test_orden_no_encontrada(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    response = client.get("/api/ordenes/9999", headers=admin_headers)
    assert response.status_code == 404


def test_ordenes_busqueda_por_cliente(client, db, admin_user, customer_user):
    product = Producto(nombre="Juego busqueda", precio=30.0, stock=5, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 1}], "direccion_envio": "Calle Busqueda 1"},
    )
    assert response.status_code == 201

    response = client.get("/api/ordenes?search=Cliente", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["usuario_nombre"] == "Cliente"

    response = client.get("/api/ordenes?search=cliente@test.com", headers=admin_headers)
    assert response.json()["total"] == 1

    response = client.get("/api/ordenes?search=NoExisteEsto", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["items"] == []

    response = client.get("/api/ordenes?size=1&page=1", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["size"] == 1
    assert data["pages"] == data["total"]


def test_orden_stock_insuficiente(client, db, admin_user, customer_user):
    product = Producto(nombre="Juego Sin Stock", precio=30.0, stock=1, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 10}], "direccion_envio": "Calle Cliente 456, Ciudad"},
    )
    assert response.status_code == 409


def test_orden_estado_invalido(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")

    product = Producto(nombre="Juego Estado", precio=35.0, stock=5, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 1}], "direccion_envio": "Calle Cliente 456, Ciudad"},
    )
    assert response.status_code == 201
    order_id = response.json()["orden"]["id"]

    response = client.patch(
        f"/api/ordenes/{order_id}/estado",
        headers=admin_headers,
        json={"estado": "estado_invalido"},
    )
    assert response.status_code == 400


def test_orden_cliente_no_puede_ver_orden_de_otro(client, db, admin_user, customer_user, employee_user):
    from app.models.entities import Usuario
    from app.models.roles import Rol
    from app.core.security import hash_password

    other_customer = Usuario(
        nombre="Otro", apellido="Cliente", tipo_documento="cc",
        numero_documento="100000005", direccion="Calle Otra 999",
        telefono="3000000005", correo="otro@test.com",
        password=hash_password("Otro1234!"), rol_id=3,
    )
    db.add(other_customer)
    db.commit()
    db.refresh(other_customer)

    product = Producto(nombre="Juego Privado", precio=40.0, stock=10, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    other_headers = login_headers(client, other_customer.correo, "Otro1234!")
    response = client.post(
        "/api/ordenes",
        headers=other_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 1}], "direccion_envio": "Calle Otra 999, Ciudad"},
    )
    assert response.status_code == 201
    order_id = response.json()["orden"]["id"]

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.get(f"/api/ordenes/{order_id}", headers=customer_headers)
    assert response.status_code == 403


def test_ordenes_con_datos_huerfanos_no_devuelve_500(client, db, admin_user):
    """Regresión: órdenes con producto/usuario eliminado no deben romper el listado."""
    from app.models.entities import Orden, OrdenDetalle

    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    orden = Orden(usuario_id=admin_user.id, total=10.0, estado="completada")
    db.add(orden)
    db.commit()
    db.refresh(orden)
    db.add(OrdenDetalle(
        orden_id=orden.id,
        producto_id=999999,
        cantidad=1,
        precio_unitario=10.0,
        subtotal=10.0,
    ))
    huerfana = Orden(usuario_id=888888, total=20.0, estado="completada")
    db.add(huerfana)
    db.commit()

    response = client.get("/api/ordenes", headers=admin_headers)
    assert response.status_code == 200
    items = response.json()["items"]
    assert {o["id"] for o in items} >= {orden.id, huerfana.id}

    response = client.get(f"/api/ordenes/{orden.id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["detalles"][0]["producto_nombre"] is None
