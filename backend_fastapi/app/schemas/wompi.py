from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PagoEntrada(BaseModel):
    orden_id: int = Field(ge=1)
    customer_email: EmailStr
    payment_method_type: str = "CARD"
    token: str | None = None
    installments: int = Field(default=1, ge=1)

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
        json_schema_extra={
            "examples": [
                {
                    "orden_id": 1,
                    "customer_email": "cliente@email.com",
                    "payment_method_type": "CARD",
                    "token": "tok_test_xxxx",
                    "installments": 1,
                }
            ]
        },
    )


class PagoRespuesta(BaseModel):
    id: int
    orden_id: int
    wompi_transaction_id: str | None
    reference: str
    amount_in_cents: int
    currency: str
    status: str
    payment_method_type: str | None
    customer_email: str
    checkout_url: str | None = None
    wompi_response: dict | None = None

    model_config = ConfigDict(from_attributes=True)


class WompiWebhookTransaction(BaseModel):
    id: str
    status: str
    amount_in_cents: int
    reference: str
    customer_email: str
    currency: str
    payment_method_type: str

    model_config = ConfigDict(extra="allow")


class WompiWebhookData(BaseModel):
    transaction: WompiWebhookTransaction

    model_config = ConfigDict(extra="allow")


class WompiWebhookPayload(BaseModel):
    event: str
    data: WompiWebhookData
    sent_at: str

    model_config = ConfigDict(extra="allow")


class SimularPagoEntrada(BaseModel):
    reference: str
    status: str = "APPROVED"

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
        json_schema_extra={
            "examples": [
                {
                    "reference": "ORD-1234567890-ABC123",
                    "status": "APPROVED",
                }
            ]
        },
    )
