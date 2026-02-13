import { useState } from 'react'

import { compareStrategies } from '../api/simulationAPI'

const initialStrategy = {
  capital_inicial: 1000,
  riesgo: 0.02,
  cuota: 1.9,
  tasa_acierto: 0.58,
  num_jugadas: 60,
}

function StrategyComparator() {
  const [estrategia1, setEstrategia1] = useState(initialStrategy)
  const [estrategia2, setEstrategia2] = useState({ ...initialStrategy, riesgo: 0.03, cuota: 2.0, tasa_acierto: 0.55 })
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target
    setter((prev) => ({
      ...prev,
      [name]: name === 'num_jugadas' ? Number.parseInt(value || '0', 10) : Number.parseFloat(value || '0'),
    }))
  }

  const handleCompare = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        estrategia_1: { ...estrategia1, num_jugadas: Number.isNaN(estrategia1.num_jugadas) ? 0 : estrategia1.num_jugadas },
        estrategia_2: { ...estrategia2, num_jugadas: Number.isNaN(estrategia2.num_jugadas) ? 0 : estrategia2.num_jugadas },
      }
      const data = await compareStrategies(payload)
      setResultado(data)
    } catch {
      setResultado(null)
      setError('No se pudo comparar estrategias. Verifica que el backend esté activo.')
    } finally {
      setLoading(false)
    }
  }

  const renderForm = (title, strategy, onChange) => (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-cyan-300">{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm text-slate-300">
          Capital inicial
          <input type="number" step="0.01" name="capital_inicial" value={strategy.capital_inicial} onChange={onChange} required className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Riesgo
          <input type="number" step="0.001" name="riesgo" value={strategy.riesgo} onChange={onChange} required className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Cuota
          <input type="number" step="0.01" name="cuota" value={strategy.cuota} onChange={onChange} required className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Tasa de acierto
          <input type="number" step="0.001" name="tasa_acierto" value={strategy.tasa_acierto} onChange={onChange} required className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Número de jugadas
          <input type="number" step="1" name="num_jugadas" value={strategy.num_jugadas} onChange={onChange} required className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none" />
        </label>
      </div>
    </div>
  )

  const winner = resultado?.mejor_estrategia

  return (
    <section className="mt-10 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-2xl">
      <h2 className="mb-6 text-2xl font-semibold text-cyan-300">Comparador de Estrategias</h2>

      <form onSubmit={handleCompare} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {renderForm('Estrategia 1', estrategia1, handleChange(setEstrategia1))}
          {renderForm('Estrategia 2', estrategia2, handleChange(setEstrategia2))}
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-700">
          {loading ? 'Comparando...' : 'Comparar estrategias'}
        </button>
      </form>

      {error && <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</p>}

      {resultado && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className={`rounded-xl border p-5 ${winner === '1' ? 'border-emerald-400 bg-emerald-500/15' : 'border-slate-700 bg-slate-950/60'}`}>
            <p className="text-sm uppercase tracking-wide text-slate-300">Estrategia 1</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-300">Capital promedio: {resultado.estrategia_1.capital_promedio}</p>
            <p className="mt-1 text-lg text-cyan-200">Prob. ganancia: {(resultado.estrategia_1.prob_ganancia * 100).toFixed(2)}%</p>
          </div>

          <div className={`rounded-xl border p-5 ${winner === '2' ? 'border-emerald-400 bg-emerald-500/15' : 'border-slate-700 bg-slate-950/60'}`}>
            <p className="text-sm uppercase tracking-wide text-slate-300">Estrategia 2</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-300">Capital promedio: {resultado.estrategia_2.capital_promedio}</p>
            <p className="mt-1 text-lg text-cyan-200">Prob. ganancia: {(resultado.estrategia_2.prob_ganancia * 100).toFixed(2)}%</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default StrategyComparator
