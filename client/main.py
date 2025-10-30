import requests as req
import json
import base64
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

def jwk_to_rsa_key(jwk_data):
    """Convert JWK to RSA key using cryptography library"""
    n = base64.urlsafe_b64decode(jwk_data['n'] + '==')
    e = base64.urlsafe_b64decode(jwk_data['e'] + '==')
    
    return rsa.RSAPublicNumbers(
        e=int.from_bytes(e, 'big'),
        n=int.from_bytes(n, 'big')
    ).public_key(default_backend())

def encrypt_message(public_key, message):
    """Encrypt a message using RSA public key"""
    encrypted = public_key.encrypt(
        message.encode('utf-8'),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return base64.b64encode(encrypted).decode('utf-8')

try:
    response = req.get('http://localhost:3000/gen')
    if response.status_code == 200:
        data = response.json()
        jwk = data["key"]
        
        # Convert and encrypt
        rsa_key = jwk_to_rsa_key(jwk)
        pem = rsa_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode()
        
        encrypted = encrypt_message(rsa_key, "hello world")
        
        print("=== RSA Key Conversion ===")
        print(f"Key ID: {data['id']}")
        print(f"\nPEM Format:\n{pem}")
        print(f"\nEncrypted 'hello world':\n{encrypted}")
        
    else:
        print(f"Error: HTTP {response.status_code}")

except Exception as e:
    print(f"Request failed: {e}")