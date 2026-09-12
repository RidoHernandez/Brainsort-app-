import { options } from './k6-options.js';
import { libraryScenario } from './scenario-library.js';
import { authScenario } from './scenario-auth.js';
import { syncScenario } from './scenario-sync.js';

export { options };

export default function () {
  // Simulamos un comportamiento mixto: 
  // 60% usuarios cargando biblioteca
  // 30% usuarios haciendo login
  // 10% usuarios sincronizando datos offline

  const rand = Math.random();

  if (rand < 0.6) {
    libraryScenario();
  } else if (rand < 0.9) {
    authScenario();
  } else {
    syncScenario();
  }
}
