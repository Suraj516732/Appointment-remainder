from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    phone_number = Column(String)
    appointment_time = Column(DateTime)
    reminder_sent = Column(Boolean, default=False)