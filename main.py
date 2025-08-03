from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

# Hardcoded MongoDB URI – for testing only (use ENV VAR in production)
MONGO_URI = "mongodb+srv://nadjibhallak04:4t6WfOMGBLgLkjRv@aythmathen.fsvqcpx.mongodb.net/?retryWrites=true&w=majority&appName=Aythmathen"

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["clothing_wholesale"]  # Use your actual DB name
    db.command("ping")  # Test connection
except ConnectionFailure as e:
    print(f"Failed to connect to MongoDB: {e}")
    db = None

app = FastAPI(
    title="Clothing Wholesale API",
    description="API to check inventory stock for clothing store.",
    version="1.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your Netlify domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"msg": "Clothing Wholesale Manager API is running."}

@app.get("/inventory")
def get_inventory():
    if db is None:
        return {"error": "Database not connected."}
    try:
        items = list(db["inventory"].find({}, {"_id": 0}))
        return items
    except Exception as e:
        return {"error": str(e)}

@app.get("/search")
def search_inventory(reference: str = Query(..., description="Reference code to search for")):
    if db is None:
        return {"error": "Database not connected."}
    try:
        item = db["inventory"].find_one({"reference": reference}, {"_id": 0})
        return item if item else {}
    except Exception as e:
        return {"error": str(e)}
