from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timedelta
import threading
import time
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
from models import Appointment
from whatsapp import send_whatsapp

app = FastAPI()

Base.metadata.create_all(bind=engine)


class AppointmentRequest(BaseModel):
    customer_name: str
    phone_number: str
    appointment_time: datetime

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def check_reminders_loop():
    print("\n[DAEMON] Background reminder daemon thread started successfully.")
    while True:
        try:
            db = SessionLocal()
            now = datetime.now()
            one_hour_later = now + timedelta(hours=1)
            
            # Query appointments occurring in the next 1 hour that have not received reminders
            upcoming = db.query(Appointment).filter(
                Appointment.appointment_time >= now,
                Appointment.appointment_time <= one_hour_later,
                Appointment.reminder_sent == False
            ).all()
            
            for appt in upcoming:
                formatted_time = appt.appointment_time.strftime("%b %d, %Y at %I:%M %p")
                msg = f"Reminder: Hello {appt.customer_name}, you have an appointment scheduled for {formatted_time} (in less than 1 hour)."
                
                print(f"[DAEMON] Found upcoming appointment #{appt.id} for {appt.customer_name} at {appt.appointment_time}. Sending reminder...")
                
                send_whatsapp(appt.phone_number, msg)
                
                appt.reminder_sent = True
                db.add(appt)
            
            db.commit()
            db.close()
        except Exception as e:
            print(f"[DAEMON ERROR] Exception in background reminder thread: {e}")
        
        # Check every 30 seconds
        time.sleep(30)


@app.on_event("startup")
def startup_event():
    # Start the daemon thread for check_reminders_loop
    thread = threading.Thread(target=check_reminders_loop, daemon=True)
    thread.start()


@app.post("/appointment")
def create_appointment(data: AppointmentRequest):

    db: Session = SessionLocal()

    appointment = Appointment(
        customer_name=data.customer_name,
        phone_number=data.phone_number,
        appointment_time=data.appointment_time,
        reminder_sent=False
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Format time beautifully for the notification
    formatted_time = data.appointment_time.strftime("%b %d, %Y at %I:%M %p")

    # Send immediate WhatsApp confirmation
    send_whatsapp(
        data.phone_number,
        f"Hello {data.customer_name}, your appointment is confirmed for {formatted_time}."
    )

    db.close()
    return {"message": "Appointment Created"}


@app.get("/appointments")
def get_appointments():

    db: Session = SessionLocal()

    appointments = db.query(Appointment).all()
    
    data = [
        {
            "id": a.id,
            "customer_name": a.customer_name,
            "phone_number": a.phone_number,
            "appointment_time": a.appointment_time.isoformat() if hasattr(a.appointment_time, 'isoformat') else str(a.appointment_time),
            "reminder_sent": a.reminder_sent
        }
        for a in appointments
    ]
    db.close()
    return data