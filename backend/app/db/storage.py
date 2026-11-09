import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

Base = declarative_base()

def utc_now():
    return datetime.now(timezone.utc)

class UserSessionModel(Base):
    __tablename__ = "user_sessions_runtime"

    id = Column(String(64), primary_key=True)
    service_id = Column(String(64), nullable=True)
    service_slug = Column(String(64), nullable=True)
    language = Column(String(10), default="en")
    answers_json = Column(Text, default="{}")
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class ChecklistRecordModel(Base):
    __tablename__ = "generated_checklists_runtime"

    id = Column(String(64), primary_key=True)
    session_id = Column(String(64), nullable=False)
    service_id = Column(String(64), nullable=True)
    rules_version = Column(String(64), default="v1.0")
    items_json = Column(Text, default="[]")
    readiness_json = Column(Text, default="{}")
    disclaimers_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

# Configure database engine
db_url = settings.DATABASE_URL.strip() if settings.DATABASE_URL else ""
if not db_url or "postgres" not in db_url:
    # Use robust local SQLite persistence in data/citizenease.db
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
    os.makedirs(base_dir, exist_ok=True)
    db_path = os.path.join(base_dir, "citizenease.db")
    db_url = f"sqlite:///{db_path}"

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if "sqlite" in db_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Auto-create tables on import
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database metadata initialization note: {e}")

class DatabaseStorage:
    @staticmethod
    def save_session(session_id: str, data: Dict[str, Any]):
        db = SessionLocal()
        try:
            record = db.query(UserSessionModel).filter(UserSessionModel.id == session_id).first()
            if not record:
                record = UserSessionModel(
                    id=session_id,
                    service_id=data.get("service_id"),
                    service_slug=data.get("service_slug"),
                    language=data.get("language", "en"),
                    answers_json=json.dumps(data.get("answers", {})),
                    message_count=data.get("message_count", 0)
                )
                db.add(record)
            else:
                record.service_id = data.get("service_id", record.service_id)
                record.service_slug = data.get("service_slug", record.service_slug)
                record.language = data.get("language", record.language)
                record.answers_json = json.dumps(data.get("answers", {}))
                record.message_count = data.get("message_count", record.message_count)
            db.commit()
        finally:
            db.close()

    @staticmethod
    def get_session(session_id: str) -> Optional[Dict[str, Any]]:
        db = SessionLocal()
        try:
            record = db.query(UserSessionModel).filter(UserSessionModel.id == session_id).first()
            if not record:
                return None
            return {
                "session_id": record.id,
                "service_id": record.service_id,
                "service_slug": record.service_slug,
                "language": record.language,
                "answers": json.loads(record.answers_json or "{}"),
                "message_count": record.message_count or 0
            }
        finally:
            db.close()

    @staticmethod
    def increment_session_messages(session_id: str) -> int:
        db = SessionLocal()
        try:
            record = db.query(UserSessionModel).filter(UserSessionModel.id == session_id).first()
            if not record:
                record = UserSessionModel(
                    id=session_id,
                    message_count=1
                )
                db.add(record)
                db.commit()
                return 1
            record.message_count = (record.message_count or 0) + 1
            db.commit()
            return record.message_count
        finally:
            db.close()

    @staticmethod
    def save_checklist(checklist_id: str, data: Dict[str, Any]):
        db = SessionLocal()
        try:
            record = db.query(ChecklistRecordModel).filter(ChecklistRecordModel.id == checklist_id).first()
            if not record:
                record = ChecklistRecordModel(
                    id=checklist_id,
                    session_id=data.get("session_id", ""),
                    service_id=data.get("service_id"),
                    rules_version=data.get("rules_version", "v1.0"),
                    items_json=json.dumps(data.get("items", [])),
                    readiness_json=json.dumps(data.get("readiness", {})),
                    disclaimers_json=json.dumps(data.get("disclaimers", []))
                )
                db.add(record)
            else:
                record.items_json = json.dumps(data.get("items", []))
                record.readiness_json = json.dumps(data.get("readiness", {}))
                record.disclaimers_json = json.dumps(data.get("disclaimers", []))
            db.commit()
        finally:
            db.close()

    @staticmethod
    def get_checklist(checklist_id: str) -> Optional[Dict[str, Any]]:
        db = SessionLocal()
        try:
            record = db.query(ChecklistRecordModel).filter(ChecklistRecordModel.id == checklist_id).first()
            if not record:
                return None
            return {
                "id": record.id,
                "session_id": record.session_id,
                "service_id": record.service_id,
                "rules_version": record.rules_version,
                "items": json.loads(record.items_json or "[]"),
                "readiness": json.loads(record.readiness_json or "{}"),
                "disclaimers": json.loads(record.disclaimers_json or "[]")
            }
        finally:
            db.close()
