
import { useEffect, useState } from 'react'

export default function WalletConnect() {
  const [addr, setAddr] = useState(null)

  async function connect() {
    if (!window.ethereum) return alert('Please install MetaMask')
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAddr(accs[0])
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accs => {
        if (accs.length) setAddr(accs[0])
      })
    }
  }, [])

  return (
    <div>
      {addr ? <b>{addr.slice(0,6)}…{addr.slice(-4)}</b> :
        <button onClick={connect}>Connect Wallet</button>}
    </div>
  )
}
