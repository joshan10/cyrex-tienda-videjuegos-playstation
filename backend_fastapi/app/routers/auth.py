import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.sanitization import detect_sql_injection, sanitize_email, validate_and_sanitize_input
from app.core.security import create_token, hash_password, verify_password
from app.crud.resources import permissions, user_view
from app.dependencies import current_user
from app.exceptions import ConflictoNegocio, CredencialesInvalidas, CuentaInactiva, RecursoNoEncontrado
from app.models.entities import EmailVerificationToken, PasswordResetToken, Usuario
from app.models.roles import Rol
from app.schemas.common import ForgotPassword, Login, LoginPassword, RegistroUsuario, ResetPassword, VerifyEmail

router = APIRouter(prefix="/auth", tags=["auth"])


def find_user(db: Session, email: str):
    sanitized = sanitize_email(email)
    return db.scalar(select(Usuario).where(Usuario.correo == sanitized))


def token_for(db: Session, user: Usuario) -> str:
    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    return create_token(user.id, user.correo, user.rol_id, role)


def enviar_email_confirmacion(email: str, nombre: str):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Enviando email de confirmación a {email} para {nombre}")


@router.post(
    "/register",
    summary="Registrar nuevo usuario",
    status_code=201,
    responses={409: {"description": "Correo o documento duplicado"}},
)
def register(data: RegistroUsuario, db: Session = Depends(get_db)):
    if detect_sql_injection(data.correo) or detect_sql_injection(data.nombre) or detect_sql_injection(data.apellido):
        raise ConflictoNegocio("Entrada no válida.")

    if find_user(db, data.correo):
        raise ConflictoNegocio("Ya existe un usuario con este correo electrónico.")
    if db.scalar(select(Usuario).where(Usuario.numero_documento == data.numero_documento)):
        raise ConflictoNegocio("Ya existe un usuario con este número de documento.")
    values = data.model_dump(exclude={"rol_id", "password"})
    user = Usuario(**values, password=hash_password(data.password), rol_id=3)
    db.add(user)
    db.commit()
    db.refresh(user)
    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    return {
        "message": "Usuario registrado exitosamente.",
        "token": token_for(db, user),
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "correo": user.correo,
            "rol": role,
        },
    }


@router.post(
    "/verify-email",
    summary="Verificar correo electrónico (paso 1 del login)",
    responses={404: {"description": "Correo no registrado"}},
)
def verify_email(data: VerifyEmail, db: Session = Depends(get_db)):
    if detect_sql_injection(data.correo):
        raise ConflictoNegocio("Entrada no válida.")

    user = find_user(db, data.correo)
    if not user:
        return {"message": "Si el correo existe, puedes continuar.", "verified": False}

    if user.estado == "inactivo":
        raise CuentaInactiva()

    token_value = str(uuid.uuid4())
    existing = db.scalar(
        select(EmailVerificationToken).where(
            EmailVerificationToken.correo == user.correo,
            EmailVerificationToken.used == False,
        )
    )
    if existing:
        db.delete(existing)
        db.commit()

    verification_token = EmailVerificationToken(
        correo=user.correo,
        token=token_value,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        used=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(verification_token)
    db.commit()

    return {
        "message": "Correo verificado. Continúa con tu contraseña.",
        "verified": True,
        "token": token_value,
    }


@router.post(
    "/login",
    summary="Iniciar sesión (paso 2 del login)",
    responses={401: {"description": "Credenciales incorrectas"}, 403: {"description": "Cuenta desactivada"}},
)
def login(data: LoginPassword, db: Session = Depends(get_db)):
    if detect_sql_injection(data.token):
        raise CredencialesInvalidas()

    verification = db.scalar(
        select(EmailVerificationToken).where(
            EmailVerificationToken.token == data.token,
            EmailVerificationToken.used == False,
        )
    )

    if not verification:
        raise CredencialesInvalidas()

    if verification.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise CredencialesInvalidas()

    user = find_user(db, verification.correo)
    if not user:
        raise CredencialesInvalidas()

    verification.used = True
    db.commit()

    if not verify_password(data.password, user.password):
        raise CredencialesInvalidas()

    if user.estado == "inactivo":
        raise CuentaInactiva()

    role = db.scalar(select(Rol.nombre).where(Rol.id == user.rol_id))
    view = user_view(db, user)
    view.update({"rol": role, "permisos": permissions(db, user.rol_id)})
    view.pop("rol_nombre", None)
    return {"message": "Inicio de sesión exitoso.", "token": token_for(db, user), "user": view}


@router.get(
    "/me",
    summary="Obtener perfil del usuario autenticado",
    responses={401: {"description": "No autenticado"}},
)
def profile(user: dict = Depends(current_user), db: Session = Depends(get_db)):
    entity = db.get(Usuario, user["id"])
    view = user_view(db, entity)
    view.update({"rol": view.pop("rol_nombre"), "permisos": permissions(db, entity.rol_id)})
    return {"user": view}


@router.post(
    "/forgot-password",
    summary="Solicitar recuperación de contraseña",
)
def forgot_password(
    data: ForgotPassword,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if detect_sql_injection(data.correo):
        return {"message": "Si el correo existe, se han enviado instrucciones de recuperación."}

    user = find_user(db, data.correo)
    if not user:
        return {"message": "Si el correo existe, se han enviado instrucciones de recuperación."}

    token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        usuario_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        used=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(reset_token)
    db.commit()

    background_tasks.add_task(enviar_email_confirmacion, user.correo, user.nombre)

    return {
        "message": "Si el correo existe, se han enviado instrucciones de recuperación.",
        "dev_token": token,
    }


@router.post(
    "/reset-password",
    summary="Restablecer contraseña con token",
    responses={400: {"description": "Token inválido o expirado"}, 404: {"description": "Usuario no encontrado"}},
)
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    reset_entry = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token == data.token,
            PasswordResetToken.used == False,
        )
    )

    if not reset_entry:
        from fastapi import HTTPException
        raise HTTPException(400, "Token inválido o ya utilizado.")

    if reset_entry.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        from fastapi import HTTPException
        raise HTTPException(400, "El token ha expirado.")

    user = db.get(Usuario, reset_entry.usuario_id)
    if not user:
        raise RecursoNoEncontrado("Usuario", reset_entry.usuario_id)

    user.password = hash_password(data.password)
    reset_entry.used = True
    db.commit()

    return {"message": "Contraseña actualizada exitosamente."}
