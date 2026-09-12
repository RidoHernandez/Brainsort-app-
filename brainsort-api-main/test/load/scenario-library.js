import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './k6-options.js';

export function libraryScenario() {
  const url = `${BASE_URL}/algorithms`;

  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has algorithms array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && Array.isArray(body.data.algoritmos);
      } catch (e) {
        return false;
      }
    },
  });
}
