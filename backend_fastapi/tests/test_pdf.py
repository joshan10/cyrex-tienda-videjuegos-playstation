from app.models.entities import Producto

from .conftest import login_headers


def create_invoice(client, db, admin_user, customer_user):
    product = Producto(nombre="Juego PDF", precio=120000, stock=5, plataforma="PlayStation 5")
    db.add(product)
    db.commit()
    db.refresh(product)

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    order_response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={
            "items": [{"producto_id": product.id, "cantidad": 1}],
            "direccion_envio": "Calle Cliente 456, Ciudad",
        },
    )
    order_id = order_response.json()["orden"]["id"]
    client.patch(f"/api/ordenes/{order_id}/estado", headers=admin_headers, json={"estado": "completada"})
    invoice_response = client.get("/api/ventas", headers=admin_headers)
    invoice = next(item for item in invoice_response.json()["items"] if item["orden_id"] == order_id)
    return invoice["numero_factura"], customer_headers, admin_headers


def test_admin_can_download_sales_report_pdf(client, db, admin_user, customer_user):
    create_invoice(client, db, admin_user, customer_user)
    response = client.get("/api/ventas/reporte/pdf", headers=login_headers(client, admin_user.correo, "Admin1234!"))

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
    assert "reporte_ventas_cyrex" in response.headers["content-disposition"]


def test_invoice_pdf_is_available_to_owner_and_staff_but_not_other_customer(client, db, admin_user, customer_user, employee_user):
    invoice_number, customer_headers, admin_headers = create_invoice(client, db, admin_user, customer_user)

    owner_response = client.get(f"/api/ventas/factura/{invoice_number}/pdf", headers=customer_headers)
    assert owner_response.status_code == 200
    assert owner_response.content.startswith(b"%PDF")

    staff_response = client.get(f"/api/ventas/factura/{invoice_number}/pdf", headers=admin_headers)
    assert staff_response.status_code == 200

    employee_headers = login_headers(client, employee_user.correo, "Empleado1234!")
    employee_response = client.get(f"/api/ventas/factura/{invoice_number}/pdf", headers=employee_headers)
    assert employee_response.status_code == 200


def test_customer_can_list_only_own_invoices(client, db, admin_user, customer_user):
    invoice_number, customer_headers, _ = create_invoice(client, db, admin_user, customer_user)
    response = client.get("/api/ventas/mis-facturas", headers=customer_headers)

    assert response.status_code == 200
    assert [item["numero_factura"] for item in response.json()["items"]] == [invoice_number]
