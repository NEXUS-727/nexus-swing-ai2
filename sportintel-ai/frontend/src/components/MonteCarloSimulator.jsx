import { useState } from 'react'

import { runSimulation } from '../api/simulationAPI'
import SimulationChart from './SimulationChart'

const initialForm = {
  capital_inicial: 1000,
  riesgo: 0.02,
  cuota: 1.9,
  tasa_acierto: 0.6,
  num_jugadas: 50,
}

const buildEstimatedSeries = ({ capitalInicial, capitalObjetivo, numJugadas }) => {
  if (!numJugadas || numJugadas < 1) return []

  const ratio = capitalInicial > 0 ? capitalObjetivo / capitalInicial : 1

  return Array.from({ length: numJugadas }, (_, index) => {
    const step = index + 1
    const progress = step / numJugadas
    const estimated = capitalInicial * ratio ** progress
    return Number(estimated.toFixed(2))
  })
}

function MonteCarloSimulator() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [chartResults, setChartResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'num_jugadas' ? Number.parseInt(value || '0', 10) : Number.parseFloat(value || '0'),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...form,
        num_jugadas: Number.isNaN(form.num_jugadas) ? 0 : form.num_jugadas,
      }
      const data = await runSimulation(payload)
      setResult(data)
      setChartResults(
        buildEstimatedSeries({
          capitalInicial: payload.capital_inicial,
          capitalObjetivo: data.capital_promedio,
          numJugadas: payload.num_jugadas,
        }),
      )
    } catch (submitError) {
      setError('No se pudo ejecutar la simulación. Verifica que el backend esté activo.')
      setResult(null)
      setChartResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (formato) => {
    if (!result) return

    setDownloading(formato)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formato, resultados: result }),
      })

      if (!response.ok) {
        throw new Error('Error al exportar')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = formato === 'pdf' ? 'reporte_sportintel_ai.pdf' : 'reporte_sportintel_ai.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (exportError) {
      setError('No se pudo exportar el reporte. Verifica que el backend esté activo.')
    } finally {
      setDownloading('')
    }
  }

  return (
    <section className="w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
      <h2 className="mb-6 text-2xl font-semibold text-cyan-300">Simulador Monte Carlo</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Capital inicial
          <input
            type="number"
            step="0.01"
            name="capital_inicial"
            value={form.capital_inicial}
            onChange={handleChange}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Riesgo
          <input
            type="number"
            step="0.001"
            name="riesgo"
            value={form.riesgo}
            onChange={handleChange}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Cuota
          <input
            type="number"
            step="0.01"
            name="cuota"
            value={form.cuota}
            onChange={handleChange}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Tasa de acierto
          <input
            type="number"
            step="0.001"
            name="tasa_acierto"
            value={form.tasa_acierto}
            onChange={handleChange}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200 md:col-span-2">
          Número de jugadas
          <input
            type="number"
            step="1"
            name="num_jugadas"
            value={form.num_jugadas}
            onChange={handleChange}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 mt-2 rounded-xl bg-cyan-500 px-5 py-3 text-base font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-700"
        >
          {loading ? 'Simulando...' : 'Ejecutar simulación'}
        </button>
      </form>

      {error && <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</p>}

      {result && (
        <div className="mt-8 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
          <h3 className="mb-4 text-xl font-semibold text-cyan-300">Resultados de simulación</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-950/70 p-4 text-center">
              <p className="text-sm text-slate-400">Capital promedio</p>
              <p className="mt-1 text-3xl font-extrabold text-emerald-300">{result.capital_promedio}</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4 text-center">
              <p className="text-sm text-slate-400">Capital mediano</p>
              <p className="mt-1 text-3xl font-extrabold text-indigo-300">{result.capital_mediano}</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4 text-center">
              <p className="text-sm text-slate-400">Prob. ganancia</p>
              <p className="mt-1 text-3xl font-extrabold text-cyan-300">{(result.prob_ganancia * 100).toFixed(2)}%</p>
            </div>
          </div>

          {result.importancia_variables && (
            <p className="mt-5 rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 text-sm leading-7 text-gray-300">
              <strong className="text-cyan-300">Importancia de variables:</strong>
              <br />
              Tasa de acierto: {(result.importancia_variables.tasa_acierto * 100).toFixed(2)}%
              <br />
              Riesgo: {(result.importancia_variables.riesgo * 100).toFixed(2)}%
              <br />
              Cuota: {(result.importancia_variables.cuota * 100).toFixed(2)}%
              <br />
              Número de jugadas: {(result.importancia_variables.num_jugadas * 100).toFixed(2)}%
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={downloading !== ''}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
            >
              {downloading === 'pdf' ? 'Descargando PDF...' : 'Descargar PDF'}
            </button>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              disabled={downloading !== ''}
              className="rounded-xl bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-700"
            >
              {downloading === 'csv' ? 'Descargando CSV...' : 'Descargar CSV'}
            </button>
          </div>
        </div>
      )}

      <SimulationChart results={chartResults} />
    </section>
  )
}

export default MonteCarloSimulator
