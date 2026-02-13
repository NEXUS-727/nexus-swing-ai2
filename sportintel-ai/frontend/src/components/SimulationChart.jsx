import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

function SimulationChart({ results = [] }) {
  if (!results.length) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center text-slate-300">
        Ejecuta una simulación para ver resultados
      </div>
    )
  }

  const labels = results.map((_, index) => index + 1)

  const data = {
    labels,
    datasets: [
      {
        label: 'Capital estimado',
        data: results,
        borderColor: 'rgba(34, 211, 238, 1)',
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Número de jugadas',
          color: '#94a3b8',
        },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      y: {
        title: {
          display: true,
          text: 'Capital estimado',
          color: '#94a3b8',
        },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
    },
  }

  return (
    <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-5 shadow-xl">
      <h3 className="mb-4 text-lg font-semibold text-cyan-300">Evolución del capital</h3>
      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default SimulationChart
