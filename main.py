from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os

# ===== Load Mongo URI =====
MONGO_URI = os.environ.get( 
    "MONGO_URI",
    "mongodb+srv://nadjibhallak04:4t6WfOMGBLgLkjRv@aythmathen.fsvqcpx.mongodb.net/clothing_wholesale?retryWrites=true&w=majority&appName=Aythmathen"
)
 
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set!")

client = MongoClient(MONGO_URI)
db = client["clothing_wholesale"]

app = FastAPI(
    title="Clothing Wholesale Manager API",
    description="REST API for querying inventory from MongoDB Atlas.",
    version="1.0"
)

# ===== Allow frontend to access =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use your Netlify domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"msg": "Clothing Wholesale Manager API is running."}

@app.get("/inventory")
def get_inventory():
    try:
        items = list(db.inventory.find({}, {"_id": 0}))
        return items
    except Exception as e:
        return {"error": str(e)}

@app.get("/search")
def search_inventory(reference: str = Query(..., description="Reference code to search for")):
    try:
        item = db.inventory.find_one({"reference": reference}, {"_id": 0})
        return item if item else {}
    except Exception as e:
        return {"error": str(e)}

