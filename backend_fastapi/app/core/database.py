import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

connect_args = {}
if settings.db_use_ssl.lower() == "true":
    connect_args = {"ssl": {"ca": None, "check_hostname": False, "verify_mode": 0}}
    logger.info("SSL habilitado para conexion a base de datos")

logger.info(f"DB_HOST: {settings.db_host}, DB_PORT: {settings.db_port}, DB_USER: {settings.db_user}, DB_NAME: {settings.db_name}, DB_USE_SSL: {settings.db_use_ssl}")

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args=connect_args,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
