from celery import Celery

from app.core.config import settings

celery_app = Celery("laura_ai", broker=settings.redis_url, backend=settings.redis_url)


@celery_app.task
def ping_task() -> str:
    return "pong"
