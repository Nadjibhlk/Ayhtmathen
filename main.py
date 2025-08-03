from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os

# ===== MONGODB CONNECTION =====
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://nadjibhallak04:4t6WfOMGBLgLkjRv@aythmathen.fsvqcpx.mongodb.net"
)
DB_NAME = "clothing_wholesale"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# ===== FASTAPI SETUP =====
app = FastAPI(
    title="Clothing Wholesale Manager API",
    description="REST API for querying inventory from MongoDB Atlas.",
    version="1.0"
)

# ===== CORS SETUP =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to your Netlify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== ROUTES =====

@app.get("/")
def root():
    return {"msg": "Clothing Wholesale Manager API is running."}

@app.get("/inventory")
def get_inventory():
    items = list(db.inventory.find({}, {"_id": 0}))
    return items

@app.get("/search")
def search_inventory(reference: str = Query(..., description="Reference code to search for")):
    item = db.inventory.find_one({"reference": reference}, {"_id": 0})
    if not item:
        return {}
    return item

# --------- LOCAL RUN INSTRUCTIONS ---------
# pip install fastapi pymongo uvicorn
# uvicorn main:app --reload
# Go to http://localhost:8000
