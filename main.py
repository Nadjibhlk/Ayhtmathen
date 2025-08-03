from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os

# ===== ROOM TO ADD YOUR MONGODB ATLAS URI =====
# Option 1: Set as environment variable MONGO_URI
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://nadjibhallak04:4t6WfOMGBLgLkjRv@aythmathen.fsvqcpx.mongodb.net"
)
# Option 2: Paste your URI directly below (uncomment and edit)
# MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = "clothing_wholesale"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

app = FastAPI(
    title="Clothing Wholesale Manager API",
    description="REST API for querying inventory from MongoDB Atlas.",
    version="1.0"
)

# Allow all origins (for dev/demo, restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your web domain in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# 1. Install dependencies:
#    pip install fastapi pymongo uvicorn
# 2. Run the app:
#    uvicorn main:app --reload
# 3. Access the API at http://localhost:8000
# 4. Your JS frontend can use API_BASE = "http://localhost:8000" for testing.