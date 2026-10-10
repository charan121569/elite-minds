from typing import Optional
from sqlalchemy.orm import Session
from app.models.activity import ActivityLog
from app.core.logging import logger

class ActivityService:
    @staticmethod
    def log(
        db: Session,
        user_id: int,
        action_type: str,
        description: str,
        entity_type: str,
        entity_id: Optional[int] = None,
        project_id: Optional[int] = None
    ) -> ActivityLog:
        try:
            log_entry = ActivityLog(
                user_id=user_id,
                project_id=project_id,
                action_type=action_type,
                description=description,
                entity_type=entity_type,
                entity_id=entity_id
            )
            db.add(log_entry)
            db.commit()
            return log_entry
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to write ActivityLog: {e}")
            return None
