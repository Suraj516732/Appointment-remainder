import os

def send_whatsapp(phone: str, message: str) -> bool:
    """
    Sends a WhatsApp message using Twilio WhatsApp API.
    If Twilio credentials are not set, falls back to a simulated console output.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    whatsapp_from = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886") # Twilio sandbox default

    if account_sid and auth_token:
        try:
            from twilio.rest import Client
            
            # Format number if needed: Twilio requires 'whatsapp:+1234567890'
            formatted_to = phone
            if not formatted_to.startswith("whatsapp:"):
                # Clean up characters
                clean_phone = "".join(c for c in phone if c.isdigit() or c == '+')
                if not clean_phone.startswith("+"):
                    # Assuming default country code is +1 if not provided, or keep as is
                    clean_phone = f"+91{clean_phone}"
                formatted_to = f"whatsapp:{clean_phone}"
                
            client = Client(account_sid, auth_token)
            sent_message = client.messages.create(
                body=message,
                from_=whatsapp_from,
                to=formatted_to
            )
            print(f"\n[REAL WHATSAPP SENT via Twilio] Message SID: {sent_message.sid} to {phone}")
            return True
        except ImportError:
            print("\n[WARNING] twilio package is not installed. Falling back to simulation.")
        except Exception as e:
            print(f"\n[ERROR] Failed to send real WhatsApp via Twilio: {e}. Falling back to simulation.")

    # FALLBACK: Simulated console output
    print("\n" + "=" * 18 + " SIMULATED WHATSAPP SENT " + "=" * 18)
    print(f"From: {whatsapp_from}")
    print(f"To: {phone}")
    print(f"Message: {message}")
    print("=" * 61 + "\n")
    return True
