from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ee
import json
import requests
import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Dense # <-- ADDED: Import Dense layer
from PIL import Image
from io import BytesIO

app = FastAPI()

# --- ADDED: THE KERAS HACK CLASS ---
# This safely intercepts the Dense layer configuration and removes 
# the 'quantization_config' that causes Keras 3 to crash.
class SafeDense(Dense):
    @classmethod
    def from_config(cls, config):
        config.pop('quantization_config', None)
        return super().from_config(config)
# -----------------------------------

# 1. SETUP MODEL & GEE SAAT SERVER START
print("🔄 Memuat model & autentikasi GEE...")
key_path = 'kunci-sawit.json'
with open(key_path) as f:
    key_content = json.load(f)
credentials = ee.ServiceAccountCredentials(key_content['client_email'], key_path)
ee.Initialize(credentials)

# --- UPDATED: LOAD MODEL WITH HACK ---
# Tell TensorFlow to use our SafeDense class whenever it sees a Dense layer in the .h5 file
model = load_model('model_sawit_final.h5', custom_objects={'Dense': SafeDense})
# -------------------------------------

CLASSES = ['Lahan Potensial', 'Kebun Sawit', 'Tidak Layak']
COLORS = ['#0000FF', '#FF0000', '#FF0000']

# 2. DEFINISIKAN INPUT FORMAT
class ScanRequest(BaseModel):
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float
    grid_size: int = 3

# 3. ENDPOINT UNTUK DIPANGGIL OLEH NUXT
@app.post("/api/scan")
def scan_area(req: ScanRequest):
    lats = np.linspace(req.lat_min, req.lat_max, req.grid_size)
    lons = np.linspace(req.lon_min, req.lon_max, req.grid_size)
    print(f"📊 Memulai pemindaian area: ({req.lat_min}, {req.lon_min}) to ({req.lat_max}, {req.lon_max}) dengan grid {req.grid_size}x{req.grid_size}")
    all_points_data = []
    count = 0

    for lat in lats:
        for lon in lons:
            count += 1
            point = ee.Geometry.Point([lon, lat])
            region = point.buffer(250).bounds()
            print(f"📍 Memproses titik {count}: ({lat:.4f}, {lon:.4f})")
            
            # Ambil Citra
            image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(region).filterDate('2023-01-01', '2023-12-31') \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
                .sort('CLOUDY_PIXEL_PERCENTAGE').first()

            if image.getInfo() is None: continue

            final_img = image.select(['B4', 'B3', 'B2']).divide(10000)
            url = final_img.getThumbURL({'region': region, 'dimensions': '224x224', 'format': 'jpg', 'min': 0, 'max': 0.3})

            try:
                # Naikkan timeout menjadi 15 atau 30 detik
                resp = requests.get(url, timeout=30) 
                
                if resp.status_code == 200:
                    img = Image.open(BytesIO(resp.content)).convert('RGB')
                    img_arr = np.array(img.resize((224,224))).astype('float32') / 255.0

                    pred = model.predict(np.expand_dims(img_arr, axis=0), verbose=0)
                    idx = np.argmax(pred[0])
                    conf = np.max(pred[0])

                    all_points_data.append({
                        'id': count, 'lat': float(lat), 'lon': float(lon),
                        'class': CLASSES[idx], 'confidence': float(conf), 'color': COLORS[idx]
                    })
                else:
                    print(f"⚠️ Gagal mendapatkan gambar di titik {count}, Status Code: {resp.status_code}")
                    
            except requests.exceptions.Timeout:
                print(f"⏳ Timeout di titik {count}! Melewati titik ini agar server tidak crash...")
                continue # Lanjut ke titik berikutnya
            except requests.exceptions.RequestException as e:
                print(f"❌ Error koneksi di titik {count}: {e}")
                continue # Lanjut ke titik berikutnya

    # Hitung rata-rata skor kesesuaian dari lahan potensial untuk disimpan ke Database Nuxt
    potensial = [p['confidence'] for p in all_points_data if p['class'] == 'Lahan Potensial']
    suitability_score = int((sum(potensial) / len(potensial) * 100) if potensial else 0)

    # Kirimkan data JSON (format yang lebih lengkap sesuai dengan kebutuhan di frontend dan database Nuxt)
    import random
    
    # Mocking data pendukung untuk melengkapi laporan (Nantinya dapat diganti dengan GEE atau API lain)
    risks = [
        {"type": "Banjir", "probability": random.choice(["Tinggi", "Sedang", "Rendah"])},
        {"type": "Longsor", "probability": random.choice(["Tinggi", "Sedang", "Rendah"])}
    ]
    soil_type = random.choice(['Andosol', 'Latosol', 'Ultisol', 'Grumusol', 'Gambut'])
    min_elev = random.randint(10, 50)
    max_elev = min_elev + random.randint(100, 350)
    precipitation = random.randint(1500, 3500)
    recommended_crops = random.sample(['Kelapa Sawit', 'Karet', 'Kopi', 'Cengkeh', 'Kakao', 'Lada'], 2)
    
    return {
        "status": "success",
        "suitabilityScore": suitability_score,
        "total_points": len(all_points_data),
        "geojsondata": all_points_data,
        "risks": risks,
        "soilType": soil_type,
        "elevationRange": f"{min_elev}m - {max_elev}m",
        "precipitationMs": precipitation,
        "recommendedCrops": recommended_crops
    }