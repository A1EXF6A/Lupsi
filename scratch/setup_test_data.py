import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('./backend/.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def setup():
    print("🛠️ Preparando datos de prueba (Python)...")
    test_email = "test_patient_stress@example.com"
    test_doc_email = "test_doctor_stress@example.com"
    password = "LupsiProject2026"

    # Buscar usuarios existentes
    res = supabase.auth.admin.list_users()
    users = res.users
    
    patient = next((u for u in users if u.email == test_email), None)
    doctor = next((u for u in users if u.email == test_doc_email), None)

    if not patient:
        print("Creando paciente...")
        res = supabase.auth.admin.create_user({
            "email": test_email,
            "password": password,
            "email_confirm": True
        })
        patient = res.user
    
    if not doctor:
        print("Creando doctor...")
        res = supabase.auth.admin.create_user({
            "email": test_doc_email,
            "password": password,
            "email_confirm": True
        })
        doctor = res.user

    # Upsert profiles
    supabase.table("profiles").upsert([
        {"id": patient.id, "email": test_email, "role": "PATIENT", "first_name": "Test", "last_name": "Patient"},
        {"id": doctor.id, "email": test_doc_email, "role": "DOCTOR", "first_name": "Test", "last_name": "Doctor"}
    ]).execute()

    supabase.table("patients").upsert({"id": patient.id, "dni": "1721522437"}).execute()
    supabase.table("doctors").upsert({"id": doctor.id, "specialty": "General"}).execute()

    print(f"✅ Datos listos.\nPaciente ID: {patient.id}\nDoctor ID: {doctor.id}")

if __name__ == "__main__":
    setup()
