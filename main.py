from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os

# Replace this with your actual connection string
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://nadjibhallak04:4t6WfOMGBLgLkjRv@aythmathen.fsvqcpx.mongodb.net/?retryWrites=true&w=majority&appName=Aythmathen"
)
DB_NAME = "clothing_wholesale"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    db.command("ping")  # Test connection
    connected = True
except Exception as e:
    connected = False
    db = None
    print("MongoDB connection failed:", e)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"msg": "Clothing Wholesale Manager API is running."}

@app.get("/inventory")
def get_inventory():
    if not connected:
        return {"error": "Database not connected."}
    items = list(db.inventory.find({}, {"_id": 0}))
    return items

@app.get("/search")
def search_inventory(reference: str = Query(...)):
    if not connected:
        return {"error": "Database not connected."}
    item = db.inventory.find_one({"reference": reference}, {"_id": 0})
    return item if item else {}
