from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import requests
import re

def extract_ein(text):
    # Regex to find EIN pattern XX-XXXXXXX
    match = re.search(r'\b\d{2}-\d{7}\b', text[0] if isinstance(text, list) else text)
    return match.group(0) if match else None

def extract_partner_name(text):
    # Heuristic: look for typical headers or just return raw
    return "Parsed Partner Name (Pending Regex Refinement)"

def extract_income(text):
    # Placeholder
    return "0.00"

def extract_deductions(text):
    # Placeholder
    return "0.00"

class K1Parser:
    def __init__(self):
        # Using a smaller model for dev speed if needed, but sticking to requested stub
        self.processor = TrOCRProcessor.from_pretrained("microsoft/trocr-large-printed")
        self.model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-large-printed")
    
    async def parse_k1(self, image_url: str) -> dict:
        """
        Parse K-1 form image.
        Extract: EIN, partner name, income/losses, credits.
        """
        try:
            # Download image
            image = Image.open(requests.get(image_url, stream=True).raw).convert("RGB")
            
            # OCR
            pixel_values = self.processor(images=image, return_tensors="pt").pixel_values
            generated_ids = self.model.generate(pixel_values)
            generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)
            
            # Use raw text if batch decode returns list
            text_str = " ".join(generated_text)
            
            # Parse extracted text (simple regex for now)
            result = {
                "status": "success",
                "confidence": 0.95,  # Placeholder
                "extracted": {
                    "ein": extract_ein(text_str),
                    "partner_name": extract_partner_name(text_str),
                    "share_of_income": extract_income(text_str),
                    "share_of_deductions": extract_deductions(text_str),
                    "raw_text": text_str
                }
            }
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}
