from flask import Flask, request, jsonify
from flask_cors import CORS
import secrets, json
from webauthn import generate_registration_options, verify_registration_response, generate_authentication_options, verify_authentication_response, options_to_json, base64url_to_bytes
from webauthn.helpers.structs import PublicKeyCredentialDescriptor

app = Flask(__name__)
CORS(app)
app.secret_key = secrets.token_hex(32)

RP_ID = 'localhost'
ORIGIN = 'http://localhost:5173'

users = {}
credentials = {}
challenges = {}

@app.post('/register/begin')
def register_begin():
    data = request.get_json() or {}
    username = data.get('username')

    user_id = username.encode()
    opts = generate_registration_options(
        rp_id=RP_ID,
        rp_name='Passkey Demo',
        user_id=user_id,
        user_name=username,
        user_display_name=username,
    )
    challenges[username] = {'type': 'reg', 'challenge': opts.challenge, 'user_id': user_id}
    opts_json = json.loads(options_to_json(opts))

    return jsonify({'challenge': opts_json['challenge']})

@app.post('/register/complete')
def register_complete():
    data = request.get_json() or {}
    username = data.get('username')
    registration = data.get('registration')
    ch = challenges.get(username)

    v = verify_registration_response(
        credential=registration,
        expected_challenge=ch['challenge'],
        expected_origin=ORIGIN,
        expected_rp_id=RP_ID,
    )

    users[username] = {'id': ch['user_id'], 'credentials': [v.credential_id]}
    credentials[v.credential_id] = {
        'public_key': v.credential_public_key,
        'sign_count': v.sign_count,
        'username': username,
    }
    challenges.pop(username, None)

    return jsonify({'verified': True})

@app.post('/authenticate/begin')
def authenticate_begin():
    data = request.get_json() or {}
    username = data.get('username')

    allow = [PublicKeyCredentialDescriptor(id=cid) for cid in users[username]['credentials']]
    opts = generate_authentication_options(rp_id=RP_ID, allow_credentials=allow)
    challenges[username] = {'type': 'auth', 'challenge': opts.challenge}
    opts_json = json.loads(options_to_json(opts))

    return jsonify({'challenge': opts_json['challenge'], 'allowCredentials': opts_json.get('allowCredentials', [])})

@app.post('/authenticate/complete')
def authenticate_complete():
    data = request.get_json() or {}
    username = data.get('username')
    authentication = data.get('authentication')
    ch = challenges.get(username)

    cred_id = base64url_to_bytes(authentication['id'])
    cred = credentials.get(cred_id)

    v = verify_authentication_response(
        credential=authentication,
        expected_challenge=ch['challenge'],
        expected_origin=ORIGIN,
        expected_rp_id=RP_ID,
        credential_public_key=cred['public_key'],
        credential_current_sign_count=cred['sign_count'],
    )

    cred['sign_count'] = v.new_sign_count
    challenges.pop(username, None)
    
    return jsonify({'verified': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)