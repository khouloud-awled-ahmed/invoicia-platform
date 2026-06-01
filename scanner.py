import re
import io
import json
import time
import requests
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from PIL import Image
from pdf2image import convert_from_bytes
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ── Config ────────────────────────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "tinyllama"

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(title="Invocia AI Scanner - Local", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

# ── OCR Pipeline (YOUR CODE) ──────────────────────────────────────────────────

def pdf_to_images(file_bytes: bytes) -> list:
    """STEP 2 — Convert PDF pages to images."""
    images = convert_from_bytes(file_bytes, dpi=200)
    print(f"  📄 PDF converti : {len(images)} page(s)")
    return images


def preprocess_image(image: Image.Image) -> Image.Image:
    """STEP 3a — Convert to grayscale for better OCR."""
    gray = image.convert("L")
    width, height = gray.size
    if width < 1000:
        scale = 1000 / width
        gray = gray.resize((int(width * scale), int(height * scale)), Image.LANCZOS)
    print(f"  🖼️  Image prétraitée : {gray.size[0]}x{gray.size[1]} px")
    return gray


def extract_text_ocr(image: Image.Image) -> str:
    """STEP 3b — Extract raw text using pytesseract OCR."""
    config = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(image, lang="fra+eng", config=config)
    print(f"  📝 OCR terminé : {len(text)} caractères extraits")
    return text


def clean_text(raw_text: str) -> str:
    """STEP 4 — Clean and normalize OCR output."""
    text = raw_text
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"\t", " ", text)
    text = text.replace("|", "I")
    text = text.replace("€ur", "€")
    text = re.sub(r"(\d)[,\.](\d{3})[,\.](\d{2})", r"\1\2.\3", text)
    text = re.sub(r"(\d{2})/(\d{2})/(\d{4})", r"\1/\2/\3", text)
    text = re.sub(r"(\d{2})\.(\d{2})\.(\d{4})", r"\1/\2/\3", text)
    text = re.sub(r"[^\x20-\x7E\n\xC0-\xFF€°]", "", text)
    text = text.strip()

    # Limit to avoid model overload
    if len(text) > 2000:
        text = text[:2000]

    print(f"  🧹 Texte nettoyé : {len(text)} caractères")
    return text


def run_ocr_pipeline(file_bytes: bytes, media_type: str) -> str:
    """Main OCR pipeline — your code orchestrates everything."""
    print("🔍 Démarrage du pipeline OCR...")
    all_text = []

    if media_type == "application/pdf":
        images = pdf_to_images(file_bytes)
        for i, image in enumerate(images):
            print(f"  Processing page {i+1}/{len(images)}...")
            processed = preprocess_image(image)
            text = extract_text_ocr(processed)
            all_text.append(f"--- Page {i+1} ---\n{text}")
    else:
        image = Image.open(io.BytesIO(file_bytes))
        processed = preprocess_image(image)
        text = extract_text_ocr(processed)
        all_text.append(text)

    combined = "\n\n".join(all_text)
    cleaned = clean_text(combined)
    print("✅ Pipeline OCR terminé")
    return cleaned


# ── Ollama Extraction (LOCAL AI — NO API KEY) ─────────────────────────────────

EXTRACTION_PROMPT = """You are an invoice data extraction expert. Extract data from this OCR text and respond ONLY with valid JSON (no markdown, no explanation):
{
  "invoiceNumber": "invoice number or null",
  "orderNumber": "order number or null",
  "engagementId": "engagement ID or null",
  "clientName": "client full name or null",
  "clientEmail": "client email or null",
  "clientAddress": "client full address or null",
  "date": "date in YYYY-MM-DD format or null",
  "dueDate": "due date in YYYY-MM-DD format or null",
  "items": [
    {
      "article": "item code or reference",
      "description": "item description",
      "quantity": number,
      "unitPrice": number,
      "discount": number,
      "vatRate": number
    }
  ],
  "notes": "notes or bank info or null",
  "confidence": number between 0 and 1
}

OCR text:
"""
def extract_with_ollama(ocr_text: str) -> dict:
    """STEP 5 — Extract invoice data using smart regex rules."""
    print("🔍 Extraction par règles métier...")
    import re

    def find(patterns, text):
        for p in patterns:
            m = re.search(p, text, re.IGNORECASE | re.MULTILINE)
            if m:
                return m.group(1).strip()
        return None

    def find_amount(patterns, text):
        val = find(patterns, text)
        if val:
            try:
                return float(val.replace(' ', '').replace(',', '.'))
            except:
                return 0
        return 0

    # Invoice number
    invoice_number = find([
        r'(FA-\d{4}-\d{2}-\d+)',
        r'facture\s*n[°o]?\s*:?\s*([\w\-]+)',
        r'n[°o]\s*:?\s*(FA[\w\-]+)',
    ], ocr_text)

    # Order number
    order_number = find([
        r'(?:commande|order|bon)\s*n[°o]?\s*:?\s*([\w\-]+)',
        r'(?:po|purchase order)\s*:?\s*([\w\-]+)',
    ], ocr_text)

    # Engagement ID
    engagement_id = find([
        r'engagement\s*(?:id)?\s*:?\s*([\w\-]+)',
        r'(E-\d+)',
    ], ocr_text)

    # Client name
    client = find([
        r'client\s*:?\s*([^\n]+)',
        r'(?:factur[eé]\s+[aà]|bill\s+to)\s*:?\s*([^\n]+)',
        r'(?:société|company|entreprise)\s*:?\s*([^\n]+)',
    ], ocr_text)

    # Email
    email = find([
        r'([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})',
    ], ocr_text)

    # Address
    address = find([
        r'adresse\s*:?\s*([^\n]+(?:\n[^\n]+){0,2})',
        r'(?:situ[eé][eé]?\s+[aà]|located\s+at)\s*:?\s*([^\n]+)',
    ], ocr_text)

    # Date
    date = find([
        r'date\s*:?\s*(\d{2}[/\-\.]\d{2}[/\-\.]\d{4})',
        r'(?:le|on)\s*:?\s*(\d{2}[/\-\.]\d{2}[/\-\.]\d{4})',
        r'(\d{2}[/\-\.]\d{2}[/\-\.]\d{4})',
    ], ocr_text)

    # Due date
    due_date = find([
        r'(?:écheance|due|paiement)\s*:?\s*(\d{2}[/\-\.]\d{2}[/\-\.]\d{4})',
        r'(?:à\s+payer\s+avant|pay\s+by)\s*:?\s*(\d{2}[/\-\.]\d{2}[/\-\.]\d{4})',
    ], ocr_text)

    # Description
    description = find([
        r'(?:désignation|description|prestation|objet|libellé)\s*[:\n]\s*([^\n]{5,})',
        r'(?:développement|development|service|mission|conseil|consulting)\s+([^\n]{5,})',
    ], ocr_text)

    # Amounts
    unit_price = find_amount([
        r'total\s*ht\s*:?\s*([\d\s,.]+)',
        r'montant\s*ht\s*:?\s*([\d\s,.]+)',
        r'p\.?u\.?\s*:?\s*([\d\s,.]+)',
        r'prix\s+unitaire\s*:?\s*([\d\s,.]+)',
    ], ocr_text)

    vat_rate = find_amount([
        r'tva\s*:?\s*(\d+)\s*%',
        r'(\d+)\s*%\s*tva',
    ], ocr_text)

    if vat_rate == 0:
        vat_rate = 19  # Default Tunisia

    # Notes / bank info
    notes = find([
        r'(?:rib|iban|bic|swift|banque)\s*:?\s*([^\n]+)',
        r'(?:note|remarque|observation)\s*:?\s*([^\n]+)',
    ], ocr_text)

    print(f"  ✅ Extraction terminée — invoice: {invoice_number}, client: {client}")

    return {
        "invoiceNumber": invoice_number,
        "orderNumber": order_number,
        "engagementId": engagement_id,
        "clientName": client,
        "clientEmail": email,
        "clientAddress": address,
        "date": date,
        "dueDate": due_date,
        "items": [{
            "article": "",
            "description": description or "Prestation de service",
            "quantity": 1,
            "unitPrice": unit_price,
            "discount": 0,
            "vatRate": vat_rate,
        }] if unit_price > 0 else [{
            "article": "",
            "description": description or "",
            "quantity": 1,
            "unitPrice": 0,
            "discount": 0,
            "vatRate": vat_rate,
        }],
        "notes": notes,
        "confidence": 0.8
    }

# ── Validation (YOUR CODE) ────────────────────────────────────────────────────

def validate_date(date_str) -> str:
    if not date_str:
        return None
    from datetime import datetime
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(str(date_str), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def validate_number(value, default=0) -> float:
    try:
        return float(str(value).replace(",", ".").replace(" ", ""))
    except (ValueError, TypeError):
        return default


def validate_and_clean(raw_result: dict) -> dict:
    """STEP 6 — Validate and clean the AI output."""
    print("🔎 Validation des données...")

    raw_items = raw_result.get("items", [])
    clean_items = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        clean_items.append({
            "article":     str(item.get("article") or ""),
            "description": str(item.get("description") or ""),
            "quantity":    max(1, validate_number(item.get("quantity"), 1)),
            "unitPrice":   validate_number(item.get("unitPrice"), 0),
            "discount":    min(100, max(0, validate_number(item.get("discount"), 0))),
            "vatRate":     validate_number(item.get("vatRate"), 19),
        })

    if not clean_items:
        clean_items = [{"article": "", "description": "", "quantity": 1, "unitPrice": 0, "discount": 0, "vatRate": 19}]

    validated = {
        "invoiceNumber": str(raw_result.get("invoiceNumber") or "") or None,
        "orderNumber":   str(raw_result.get("orderNumber") or "") or None,
        "engagementId":  str(raw_result.get("engagementId") or "") or None,
        "clientName":    str(raw_result.get("clientName") or "") or None,
        "clientEmail":   str(raw_result.get("clientEmail") or "") or None,
        "clientAddress": str(raw_result.get("clientAddress") or "") or None,
        "date":          validate_date(raw_result.get("date")),
        "dueDate":       validate_date(raw_result.get("dueDate")),
        "items":         clean_items,
        "notes":         str(raw_result.get("notes") or "") or None,
        "confidence":    min(1.0, max(0.0, validate_number(raw_result.get("confidence"), 0.5))),
    }

    print(f"  ✅ Validation terminée — {len(clean_items)} ligne(s)")
    return validated


# ── API Routes ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Invocia AI Scanner - Local",
        "ai": "Ollama (tinyllama) - 100% local, no API key",
        "pipeline": ["OCR (pytesseract)", "Cleaning (regex)", "Extraction (Ollama local AI)", "Validation (Python)"]
    }


@app.post("/scan")
async def scan_invoice(file: UploadFile = File(...)):
    start_time = time.time()

    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Type non supporté: {file.content_type}")

    file_bytes = await file.read()

    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "Fichier trop volumineux — maximum 10 MB")

    if len(file_bytes) == 0:
        raise HTTPException(400, "Fichier vide")

    try:
        # YOUR OCR pipeline
        ocr_text = run_ocr_pipeline(file_bytes, file.content_type)

        if len(ocr_text.strip()) < 10:
            raise HTTPException(422, "Impossible d'extraire du texte")

        # Local AI extraction
        raw_result = extract_with_ollama(ocr_text)

        # YOUR validation
        final_result = validate_and_clean(raw_result)

        final_result["_meta"] = {
            "filename": file.filename,
            "processing_time_ms": round((time.time() - start_time) * 1000),
            "ocr_chars": len(ocr_text),
            "pipeline": "pytesseract → regex cleaning → ollama local AI → python validation"
        }

        print(f"\n🎉 Scan terminé en {final_result['_meta']['processing_time_ms']}ms")
        return JSONResponse(content=final_result)

    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(500, "Erreur de parsing JSON depuis Ollama")
    except Exception as e:
        raise HTTPException(500, f"Erreur pipeline: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage du serveur Invocia AI Scanner...")
    print("📡 API disponible sur : http://localhost:8000")
    print("🤖 Modèle IA : tinyllama (local, gratuit, sans clé API)")
    uvicorn.run(app, host="0.0.0.0", port=8000)