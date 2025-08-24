# Passkey Demo

This React × Python app is my take on a simple passkey demo using WebAuthn passkeys (biometrics/security keys) using only some simple requests from the frontend with the passwordless-id package, and proper authentication from the Flask backend. It was made for me to learn about Passkeys so I could implement it in some other apps.

## Installation

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- Modern browser with WebAuthn support

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install flask flask-cors webauthn

# Start backend server
python app.py
```