from app.models.entities import PQR
from tests.conftest import login_headers


def test_customer_can_create_and_list_own_pqr(client, customer_user):
    headers = login_headers(client, customer_user.correo, "Cliente1234!")

    response = client.post(
        "/api/pqr",
        json={
            "tipo": "reclamo",
            "asunto": "No recibí mi pedido",
            "descripcion": "El pedido aparece completado, pero todavía no lo he recibido.",
        },
        headers=headers,
    )

    assert response.status_code == 201
    pqr = response.json()
    assert pqr["usuario_id"] == customer_user.id
    assert pqr["estado"] == "pendiente"

    listing = client.get("/api/pqr", headers=headers)
    assert listing.status_code == 200
    assert [item["id"] for item in listing.json()] == [pqr["id"]]


def test_staff_can_read_pqr_summary(client, employee_user):
    headers = login_headers(client, employee_user.correo, "Empleado1234!")

    response = client.get("/api/pqr/resumen", headers=headers)

    assert response.status_code == 200
    assert response.json() == {"total": 0, "pendientes": 0}


def test_staff_can_update_pqr_and_customer_cannot_update_it(client, db, customer_user, employee_user):
    pqr = PQR(
        usuario_id=customer_user.id,
        tipo="peticion",
        asunto="Consulta de garantía",
        descripcion="Necesito conocer las condiciones de garantía del producto.",
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    forbidden = client.patch(
        f"/api/pqr/{pqr.id}",
        json={"estado": "respondida", "respuesta": "Consulta atendida."},
        headers=customer_headers,
    )
    assert forbidden.status_code == 403

    employee_headers = login_headers(client, employee_user.correo, "Empleado1234!")
    updated = client.patch(
        f"/api/pqr/{pqr.id}",
        json={"estado": "respondida", "respuesta": "Consulta atendida."},
        headers=employee_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["estado"] == "respondida"
    assert updated.json()["respuesta"] == "Consulta atendida."


def test_chatbot_uses_faq_fallback_and_persists_history(client, customer_user, monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "ai_api_key", "")
    headers = login_headers(client, customer_user.correo, "Cliente1234!")

    response = client.post(
        "/api/chatbot/message",
        json={"mensaje": "¿Cómo puedo registrar una PQR?"},
        headers=headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["proveedor"] == "faq"
    assert data["conversacion_id"] > 0
    assert "PQR" in data["respuesta"]

    history = client.get(f"/api/chatbot/{data['conversacion_id']}", headers=headers)
    assert history.status_code == 200
    assert [message["rol"] for message in history.json()["mensajes"]] == ["user", "assistant"]


def test_public_chatbot_can_answer_without_login(client, monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "ai_api_key", "")
    response = client.post(
        "/api/chatbot/message",
        json={"mensaje": "¿Cuál es el horario de atención?"},
    )

    assert response.status_code == 200
    assert response.json()["proveedor"] == "faq"
    assert response.json()["conversacion_id"] is None


def test_chatbot_conversation_belongs_to_its_customer(client, customer_user, employee_user):
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.post(
        "/api/chatbot/message",
        json={"mensaje": "¿Qué productos tienen?"},
        headers=customer_headers,
    )
    conversation_id = response.json()["conversacion_id"]

    employee_headers = login_headers(client, employee_user.correo, "Empleado1234!")
    forbidden = client.get(f"/api/chatbot/{conversation_id}", headers=employee_headers)
    assert forbidden.status_code == 404
