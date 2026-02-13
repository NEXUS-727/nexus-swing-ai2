import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

export const getPing = async () => {
  const response = await api.get('/ping')
  return response.data
}

export const getSports = async () => {
  const response = await api.get('/sports')
  return response.data
}

export const runSimulation = async (data) => {
  const response = await api.post('/simulate', data)
  return response.data
}

export const compareStrategies = async (data) => {
  const response = await api.post('/compare', data)
  return response.data
}
