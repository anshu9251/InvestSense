import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = "investsense"

if not MONGODB_URI:
    raise ValueError("MONGODB_URI not found in environment variables. Check your .env file.")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
portfolios_collection = db["portfolios"]
quote_cache_collection = db["quote_cache"]


async def ping_database():
    try:
        await client.admin.command("ping")
        print(f"MongoDB connected successfully. Using database: {DATABASE_NAME}")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False