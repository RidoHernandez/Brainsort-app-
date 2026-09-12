import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './k6-options.js';

export function syncScenario() {
  const url = `${BASE_URL}/sync/progress`;

  // Payload de simulación offline
  const payload = JSON.stringify({
    sesiones: [
      {
        algoritmoId: '1',
        completada: true,
        puntosObtenidos: 100,
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date().toISOString(),
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // Simulamos que el token de Auth no es válido o que pasa,
      // esto evaluará el middleware y rechazo en caso de no tener DB de prueba.
      'Authorization': 'Bearer INVALID_TOKEN_FOR_STRESS_TEST'
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    // Si no pasamos token válido por defecto, 401 es lo esperado
    'status is 201 or 401': (r) => r.status === 201 || r.status === 401,
  });
}
