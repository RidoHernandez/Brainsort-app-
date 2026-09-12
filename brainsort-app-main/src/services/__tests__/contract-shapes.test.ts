import { progressService } from '../progress.service';
import { syncService } from '../sync.service';
import { offlineService } from '../offline.service';
import { exerciseService } from '../exercise.service';
import { apiClient } from '../api';

jest.mock('../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('service contract shapes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('consume el ranking como objeto con ranking y total', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      ranking: [],
      total: 0,
    });

    const result = await progressService.getLeaderboard(20, 0);

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/progreso/ranking?limit=20&offset=0',
      { public: false },
    );
    expect(result).toEqual({ ranking: [], total: 0 });
  });

  it('envía completada al sincronizar sesiones offline', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      sincronizados: 1,
      puntosActualizados: 10,
    });

    await syncService.syncProgress([
      {
        algoritmoId: 'algo-1',
        fechaInicio: '2026-04-06T10:00:00Z',
        fechaFin: '2026-04-06T10:15:00Z',
        pasosCompletados: 45,
        completada: true,
      },
    ]);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/progress/sync',
      {
        sesiones: [
          {
            algoritmoId: 'algo-1',
            fechaInicio: '2026-04-06T10:00:00Z',
            fechaFin: '2026-04-06T10:15:00Z',
            pasosCompletados: 45,
            completada: true,
          },
        ],
      },
      { public: false },
    );
  });

  it('consume módulos offline con algoritmoId y version de nivel superior', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      algoritmoId: 'algo-1',
      version: '1.0.0',
      meta: {
        id: 'algo-1',
        nombre: 'Bubble Sort',
        descripcion: 'Ordenamiento básico',
        complejidadTiempo: 'O(n²)',
        complejidadEspacio: 'O(1)',
        categoria: 'Ordenamiento',
      },
      pseudocode: [],
      ejercicios: [],
    });

    const result = await offlineService.downloadModule('algo-1');

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/modules/offline/algo-1/download',
      { public: false },
    );
    expect(result.algoritmoId).toBe('algo-1');
    expect(result.version).toBe('1.0.0');
    expect(result.meta.id).toBe('algo-1');
  });

  it('consume feedback unificado y feedback específico de ejercicios', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      correcto: true,
      feedback: 'Correcto',
      feedbackPositivo: 'Correcto',
      puntosGanados: 10,
      puntosTotales: 10,
      rachaDias: 1,
      posicionRanking: 1,
      nivelActual: 1,
    });

    const result = await exerciseService.answerExercise('ex-1', 'respuesta');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/ejercicios/ex-1/responder',
      { respuesta: 'respuesta' },
      { public: false },
    );
    expect(result.correcto).toBe(true);
    expect(result.feedback).toBe('Correcto');
  });
});
