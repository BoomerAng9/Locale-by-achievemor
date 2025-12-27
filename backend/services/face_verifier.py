from facenet_pytorch import InceptionResnetV1, extract_face
import torch
from PIL import Image
import requests
import io

class FaceVerifier:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
    
    async def verify_face(self, id_image_url: str, selfie_url: str) -> dict:
        """
        Compare face on ID with selfie.
        Returns: match (bool), confidence (0-1).
        """
        try:
            # Download images
            id_response = requests.get(id_image_url, stream=True)
            selfie_response = requests.get(selfie_url, stream=True)
            
            id_image = Image.open(id_response.raw).convert('RGB')
            selfie = Image.open(selfie_response.raw).convert('RGB')
            
            # Extract faces (assumes single face per image)
            # define keep_all=False (default) to get single face or None
            id_face = extract_face(id_image, keep_all=False, device=self.device)
            selfie_face = extract_face(selfie, keep_all=False, device=self.device)
            
            if id_face is None or selfie_face is None:
                return {"status": "error", "message": "Face detection failed in one or both images"}

            # Generate embeddings
            with torch.no_grad():
                id_embedding = self.model(id_face.unsqueeze(0).to(self.device))
                selfie_embedding = self.model(selfie_face.unsqueeze(0).to(self.device))
            
            # Cosine similarity
            similarity = torch.nn.functional.cosine_similarity(id_embedding, selfie_embedding).item()
            
            # 0.6+ = match (FaceNet standard)
            match = similarity >= 0.6
            
            return {
                "status": "success",
                "match": match,
                "confidence": float(similarity),
                "threshold": 0.6
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
