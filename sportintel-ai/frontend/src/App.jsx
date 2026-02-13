import { useState } from 'react'

import MonteCarloSimulator from './components/MonteCarloSimulator'
import StrategyComparator from './components/StrategyComparator'

function App() {
  const [mode, setMode] = useState('simulador')

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto mb-8 max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">SportIntel AI Running</h1>
        <p className="mt-2 text-slate-300">Simulador inteligente para análisis de estrategias deportivas.</p>
      </div>

      <div className="mx-auto mb-6 flex w-full max-w-5xl justify-center gap-3">
        <button
          type="button"
          onClick={() => setMode('simulador')}
          className={`rounded-xl px-5 py-2.5 font-semibold transition ${
            mode === 'simulador' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          Simulador Monte Carlo
        </button>
        <button
          type="button"
          onClick={() => setMode('comparador')}
          className={`rounded-xl px-5 py-2.5 font-semibold transition ${
            mode === 'comparador' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          Comparar estrategias
        </button>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <MonteCarloSimulator />
        {mode === 'comparador' && <StrategyComparator />}
      </div>
    </main>
  )
}

export default App
