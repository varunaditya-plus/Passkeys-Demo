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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900/70 p-5 rounded-xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">Passkey Demo</h1>
        <div className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 focus:bg-zinc-700/50"
          />
          <div className="flex gap-3">
            <button
              onClick={register}
              className="flex-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 hover:scale-[1.02] active:scale-95 border border-zinc-700 px-4 py-2 font-medium text-zinc-100 transition-all cursor-pointer"
            >
              Register
            </button>
            <button
              onClick={authenticate}
              className="flex-1 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all px-4 py-2 font-semibold cursor-pointer"
            >
              Authenticate
            </button>
          </div>
        </div>
        {msg && (
            <span className='mt-6 block text-center'>{msg}</span>
        )}
      </div>
    </div>
  )
}

export default App
