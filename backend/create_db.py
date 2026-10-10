"""
Database setup script.
Ensures the MySQL database `ai_dev_agent` exists before migrations or server startup.
"""
import pymysql
from app.core.config import settings

def init_database():
    print(f"Connecting to MySQL server at {settings.DB_HOST}:{settings.DB_PORT} as '{settings.DB_USER}'...")
    try:
        conn = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            charset='utf8mb4'
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"Database `{settings.DB_NAME}` verified/created successfully.")
        conn.close()
        return True
    except Exception as exc:
        print(f"Error connecting to MySQL: {exc}")
        print("\nTroubleshooting Instructions:")
        print(f"1. Open MySQL Workbench or your MySQL terminal.")
        print(f"2. Execute: CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}`;")
        print(f"3. Ensure the DB_USER and DB_PASSWORD in backend/.env match your MySQL server.")
        return False

if __name__ == "__main__":
    init_database()
