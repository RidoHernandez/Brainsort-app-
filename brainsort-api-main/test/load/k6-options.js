export const BASE_URL = 'http://localhost:3000/api';

export const options = {
  // Simular cargas de usuarios concurrentes en fases (ramp-up, hold, ramp-down)
  stages: [
    { duration: '30s', target: 20 }, // Rampa de subida a 20 VUs en 30s
    { duration: '1m', target: 20 },  // Mantener 20 VUs por 1 minuto
    { duration: '30s', target: 50 }, // Pico a 50 VUs
    { duration: '1m', target: 50 },  // Mantener 50 VUs por 1 minuto
    { duration: '30s', target: 0 },  // Rampa de bajada a 0
  ],
  thresholds: {
    // El 95% de las solicitudes deben completarse en menos de 500ms
    http_req_duration: ['p(95)<500'],
    // La tasa de errores de las solicitudes HTTP debe ser inferior al 1%
    http_req_failed: ['rate<0.01'],
  },
};
