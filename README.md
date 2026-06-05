# Appointment Reminder System

A full-stack Appointment Reminder System built using FastAPI, SQLite, SQLAlchemy, HTML, CSS, and JavaScript.

The system allows users to create appointments, stores them in a database, sends WhatsApp confirmation messages using Twilio, and automatically sends reminder notifications before scheduled appointments.

---

## Features

* Create appointments
* Store appointments in SQLite database
* View appointments on dashboard
* WhatsApp appointment confirmation
* Automated appointment reminders
* FastAPI REST APIs
* Responsive frontend UI
* Background reminder service

---

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* Twilio WhatsApp API
* Python

### Frontend

* HTML
* CSS
* JavaScript

---

## Project Structure

text
appointment-reminder/

├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── whatsapp.py
│   ├── sms.py
│   ├── appointments.db
│   └── .env

├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── style.css
│   └── script.js

├── README.md
└── .gitignore


---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd appointment-reminder
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

or

```bash
pip install fastapi uvicorn sqlalchemy twilio python-dotenv
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
TWILIO_ACCOUNT_SID=YOUR_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_AUTH_TOKEN
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## Run Backend

```bash
cd backend
uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Run Frontend

Open a new terminal:

```bash
python -m http.server 5500
```

Frontend:

```text
http://localhost:5500/frontend/index.html
```

Dashboard:

```text
http://localhost:5500/frontend/dashboard.html
```

---

## API Endpoints

### Create Appointment

```http
POST /appointment
```

Request Body:

```json
{
  "customer_name": "Suraj",
  "phone_number": "7879553211",
  "appointment_time": "2026-06-19T18:30:00"
}
```

---

### Get All Appointments

```http
GET /appointments
```

---

## WhatsApp Notifications

The application sends:

* Appointment confirmation messages
* Appointment reminder messages

using Twilio WhatsApp Sandbox.

---

## Future Improvements

* Appointment update functionality
* Appointment cancellation
* User authentication
* Production WhatsApp Cloud API
* Email notifications
* Admin dashboard

---

## Author

Suraj Dhakad

AI & ML Engineer | Backend Developer

```
```
