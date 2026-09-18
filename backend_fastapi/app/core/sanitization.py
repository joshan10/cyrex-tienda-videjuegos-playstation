import re
import html

SQL_INJECTION_PATTERNS = [
    re.compile(r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|TRUNCATE|DECLARE|CAST|CONVERT|CHAR|NCHAR|VARCHAR|NVARCHAR|SYSOBJECTS|SYSUSERS|XPTYPE|WAITFOR|DELAY|BENCHMARK|SLEEP)\b)", re.IGNORECASE),
    re.compile(r"(--|#|/\*|\*/)", re.IGNORECASE),
    re.compile(r"('|\")\s*(OR|AND)\s*['\"0-9]", re.IGNORECASE),
    re.compile(r";\s*(DROP|DELETE|INSERT|UPDATE|SELECT|ALTER|CREATE|EXEC)", re.IGNORECASE),
    re.compile(r"\b(0x[0-9a-fA-F]+)\b"),
    re.compile(r"CHAR\s*\(\s*\d+\s*\)"),
    re.compile(r"CONCAT\s*\("),
    re.compile(r"INFORMATION_SCHEMA", re.IGNORECASE),
    re.compile(r"LOAD_FILE\s*\("),
    re.compile(r"INTO\s+(OUTFILE|DUMPFILE)", re.IGNORECASE),
]


def sanitize_string(value: str, max_length: int | None = None) -> str:
    if not isinstance(value, str):
        return value
    value = value.strip()
    value = html.unescape(value)
    value = value.replace("\x00", "")
    if max_length and len(value) > max_length:
        value = value[:max_length]
    return value


def sanitize_email(email: str) -> str:
    email = sanitize_string(email).lower()
    email = re.sub(r"[^a-z0-9@._+-]", "", email)
    return email


def detect_sql_injection(value: str) -> bool:
    if not isinstance(value, str):
        return False
    for pattern in SQL_INJECTION_PATTERNS:
        if pattern.search(value):
            return True
    return False


def validate_and_sanitize_input(value: str, field_name: str = "campo", max_length: int | None = None) -> str:
    value = sanitize_string(value, max_length)
    if detect_sql_injection(value):
        raise ValueError(f"El campo '{field_name}' contiene caracteres no permitidos.")
    return value
