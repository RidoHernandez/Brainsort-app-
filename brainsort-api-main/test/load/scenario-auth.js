import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './k6-options.js';

export function authScenario() {
  const url = `${BASE_URL}/auth/login`;

  // Simulamos un login con el usuario default creado por las seeds
  const payload = JSON.stringify({
    email: 'estudiante@example.com',
    contrasena: 'Pass1234!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
}
