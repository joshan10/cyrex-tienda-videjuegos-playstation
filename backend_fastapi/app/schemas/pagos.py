from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class CrearPagoStripe(APIModel):
    orden_id: int = Field(ge=1)
    customer_email: EmailStr
    currency: str = Field(default="usd", pattern=r"^(usd|cop)$")

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
        json_schema_extra={
            "examples": [
                {
                    "orden_id": 1,
                    "customer_email": "cliente@correo.com",
                    "currency": "usd",
                }
            ]
        },
    )


class PagoRespuesta(APIModel):
    id: int
    orden_id: int
    stripe_session_id: str | None = None
    reference: str
    amount_in_cents: int
    currency: str
    status: str
    payment_method_type: str | None = None
    customer_email: str
    checkout_url: str | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class SimularPagoExitoso(APIModel):
    session_id: str

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
        json_schema_extra={
            "examples": [
                {"session_id": "cs_test_xxxxx"}
            ]
        },
    )
