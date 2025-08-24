import { useState } from 'react'
import { client } from '@passwordless-id/webauthn'

const API = 'http://localhost:5001'

function App() {
  const [username, setUsername] = useState('')
  const [msg, setMsg] = useState('')

  const register = async () => {
    if (!username.trim()) return setMsg('Enter a username')
    setMsg('')
    try {
      const r1 = await fetch(`${API}/register/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })

      const { challenge } = await r1.json()
      const registration = await client.register({ challenge, user: username })

      const r2 = await fetch(`${API}/register/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, registration })
      })

      if (!r2.ok) throw new Error('Registration failed')
      setMsg('Registered!')
    } catch (e) { setMsg(e.message) }
  }

  const authenticate = async () => {
    if (!username.trim()) return setMsg('Enter a username')
    setMsg('')
    try {
      const r1 = await fetch(`${API}/authenticate/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })

      const { challenge, allowCredentials } = await r1.json()
      const authentication = await client.authenticate({ challenge, allowCredentials })

      const r2 = await fetch(`${API}/authenticate/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, authentication })
      })

      if (!r2.ok) throw new Error('Authentication failed')
      setMsg(`LOGGED IN | ${username}`)
    } catch (e) { setMsg(e.message) }
  }

  return (
    <div>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
      <div>
        <button onClick={register}>Register</button>
        <button onClick={authenticate}>Authenticate</button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  )
}

export default App
