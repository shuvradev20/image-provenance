import os
import tempfile
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException  # type: ignore
from fastapi.responses import Response, JSONResponse  # type: ignore
from blind_watermark import WaterMark  # type: ignore
import uvicorn
from PIL import Image

app = FastAPI(title="ProveNode 64-Bit Microservice")

WM_SHAPE = 64 

def hex_to_bit_array(hex_str: str):
    hex_str = hex_str.ljust(16, '0')[:16]
    integer_val = int(hex_str, 16)
    bin_str = bin(integer_val)[2:].zfill(64)
    return [int(b) for b in bin_str]

def bit_array_to_hex(bit_array):
    bin_str = "".join(str(int(b)) for b in bit_array)
    integer_val = int(bin_str, 2)
    return hex(integer_val)[2:].zfill(16)

def process_embed(in_path, out_path, watermark_id):
    bwm = WaterMark(password_img=1, password_wm=1)
    bwm.read_img(in_path)
    bits = hex_to_bit_array(watermark_id)
    bwm.read_wm(bits, mode='bit')
    
    # 1. Prothome default format-e embed koro temp file-e
    temp_embedded = in_path.replace(".png", "_raw.png")
    bwm.embed(temp_embedded)
    
    # 2. Ebar Pillow diye open kore MAXIMUM COMPRESSION e PNG save koro
    img = Image.open(temp_embedded)
    # optimize=True ar compress_level=9 dile chobi 100% lossless thakbe, kintu file size joto tuku tight kora somvob hobe
    img.save(out_path, "PNG", optimize=True, compress_level=9)
    
    # Raw temp file muche felo
    if os.path.exists(temp_embedded):
        os.remove(temp_embedded)

def process_extract(in_path):
    bwm = WaterMark(password_img=1, password_wm=1)
    extracted_bits_float = bwm.extract(in_path, wm_shape=WM_SHAPE, mode='bit')
    extracted_bits = [1 if b > 0.5 else 0 for b in extracted_bits_float]
    return bit_array_to_hex(extracted_bits)

@app.get("/")
def read_root():
    return {"message": "ProveNode Bitwise Engine is running with 100% Pure Lossless PNG Magic!"}

@app.post("/embed-watermark")
async def embed_watermark(image: UploadFile = File(...), watermark_id: str = Form(...)):
    temp_in_path = None
    temp_out_path = None
    try:
        image_bytes = await image.read()
        
        # Suffix ekhon theke pure .png hobe jate kono compression na hoy
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_in:
            temp_in.write(image_bytes)
            temp_in_path = temp_in.name
            
        temp_out_path = temp_in_path.replace(".png", "_out.png")
        await asyncio.to_thread(process_embed, temp_in_path, temp_out_path, watermark_id)

        with open(temp_out_path, "rb") as f:
            watermarked_bytes = f.read()

        # Media type ekhon image/png hobe
        return Response(content=watermarked_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_in_path and os.path.exists(temp_in_path):
            os.remove(temp_in_path)
        if temp_out_path and os.path.exists(temp_out_path):
            os.remove(temp_out_path)

@app.post("/extract-watermark")
async def extract_watermark(image: UploadFile = File(...)):
    temp_in_path = None
    try:
        image_bytes = await image.read()
        
        # Extract er shomoy-o suffix .png use korbo
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_in:
            temp_in.write(image_bytes)
            temp_in_path = temp_in.name

        extracted_hex = await asyncio.to_thread(process_extract, temp_in_path)
        return JSONResponse(content={"status": "found", "watermark_id": extracted_hex})
    except Exception as e:
        return JSONResponse(content={"status": "found", "watermark_id": "0000000000000000"})
    finally:
        if temp_in_path and os.path.exists(temp_in_path):
            os.remove(temp_in_path)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    


# cd python-engine ; .\venv\Scripts\Activate.ps1 ; python main.py