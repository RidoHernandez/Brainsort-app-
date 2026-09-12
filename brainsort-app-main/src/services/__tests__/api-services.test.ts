import { authService } from '../auth.service';
import { badgesService } from '../badges.service';
import { diagnosticsService } from '../diagnostics.service';
import { exerciseService } from '../exercise.service';
import { learningPathService } from '../learning-path.service';
import { libraryService } from '../library.service';
import { offlineService } from '../offline.service';
import { progressService } from '../progress.service';
import { simulationService } from '../simulation.service';
import { syncService } from '../sync.service';
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

describe('frontend API services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('usa endpoints publicos correctos para auth', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({ token: 't1', refreshToken: 'r1', usuario: {} })
      .mockResolvedValueOnce({ token: 't2', refreshToken: 'r2', usuario: {} })
      .mockResolvedValueOnce({ token: 't3', refreshToken: 'r3' });

    await authService.register({
      nombre: 'Ada Lovelace',
      correo: 'ada@example.com',
      rol: 'Estudiante',
      contrasena: 'Password123',
    });
    await authService.login({
      correo: 'ada@example.com',
      contrasena: 'Password123',
    });
    await authService.refresh('refresh-token');

    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      1,
      '/auth/register',
      {
        nombre: 'Ada Lovelace',
        correo: 'ada@example.com',
        rol: 'Estudiante',
        contrasena: 'Password123',
      },
      { public: true },
    );
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      2,
      '/auth/login',
      { correo: 'ada@example.com', contrasena: 'Password123' },
      { public: true },
    );
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      3,
      '/auth/refresh',
      { refreshToken: 'refresh-token' },
      { public: true },
    );
  });

  it('consume biblioteca publica y detalle autenticado', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ categorias: [], totalAlgoritmos: 0, algoritmos: [] })
      .mockResolvedValueOnce({ id: 'algo-1', pseudocode: [] });

    await libraryService.getLibrary();
    await libraryService.getAlgorithm('algo-1');

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/biblioteca',
      { public: true },
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      '/algoritmos/algo-1',
      { public: false },
    );
  });

  it('envia simulaciones con dataset personalizado autenticado', async () => {
    const request = {
      algoritmoId: 'algo-1',
      conjuntoDeDatos: {
        valores: [5, 2, 8, 1],
        tipoOrigen: 'Personalizado' as const,
        tamano: 4,
      },
    };
    mockedApiClient.post.mockResolvedValueOnce({
      simulacion: { velocidadReproduccion: 1, estadoActual: 'Pausa', pasoActual: 0 },
      pseudocode: [],
      totalPasos: 0,
      pasos: [],
    });

    await simulationService.runSimulation(request);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/simulaciones',
      request,
      { public: false },
    );
  });

  it('consume ejercicios y envia respuestas con payload esperado', async () => {
    mockedApiClient.get.mockResolvedValueOnce([]);
    mockedApiClient.post.mockResolvedValueOnce({
      correcto: false,
      feedback: 'Intenta de nuevo',
      feedbackNegativo: 'Intenta de nuevo',
      puntosGanados: 0,
      puntosTotales: 10,
      rachaDias: 0,
      posicionRanking: 5,
      nivelActual: 1,
    });

    await exerciseService.getExercises('algo-1');
    await exerciseService.answerExercise('ej-1', 'B');

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/ejercicios/algo-1',
      { public: false },
    );
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/ejercicios/ej-1/responder',
      { respuesta: 'B' },
      { public: false },
    );
  });

  it('consume progreso, ranking e insignias protegidos', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ puntosTotales: 0, insignias: [] })
      .mockResolvedValueOnce({ ranking: [], total: 0 })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await progressService.getUserProgress();
    await progressService.getLeaderboard(10, 20);
    await badgesService.getAllBadges();
    await badgesService.getUserBadges();

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/progreso/me',
      { public: false },
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      '/progreso/ranking?limit=10&offset=20',
      { public: false },
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      3,
      '/insignias',
      { public: false },
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      4,
      '/insignias/me',
      { public: false },
    );
  });

  it('consume diagnostico y ruta de aprendizaje protegidos', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ id: 'ruta-1', createdAt: '2026-05-17', algoritmos: [] });
    mockedApiClient.post.mockResolvedValueOnce({
      puntaje: 80,
      rutaGenerada: 'ruta-1',
      algoritmosSugeridos: 4,
    });

    await diagnosticsService.getPreguntas();
    await diagnosticsService.evaluar([0, 1, 2]);
    await learningPathService.getMiRuta();

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/diagnostico/preguntas',
      { public: false },
    );
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/diagnostico/evaluar',
      { respuestas: [0, 1, 2] },
      { public: false },
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      '/ruta-aprendizaje/me',
      { public: false },
    );
  });

  it('consume modulos offline y sincronizacion protegidos', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        algoritmoId: 'algo-1',
        version: '1.0.0',
        meta: { id: 'algo-1' },
        pseudocode: [],
        ejercicios: [],
      });
    mockedApiClient.post.mockResolvedValueOnce({
      sincronizados: 1,
      puntosActualizados: 10,
    });

    await offlineService.listOfflineModules();
    await offlineService.downloadModule('algo-1');
    await syncService.syncProgress([
      {
        algoritmoId: 'algo-1',
        fechaInicio: '2026-05-17T10:00:00Z',
        fechaFin: '2026-05-17T10:05:00Z',
        pasosCompletados: 10,
        completada: true,
      },
    ]);

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      '/modules/offline',
      { public: false },
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      '/modules/offline/algo-1/download',
      { public: false },
    );
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/progress/sync',
      {
        sesiones: [
          {
            algoritmoId: 'algo-1',
            fechaInicio: '2026-05-17T10:00:00Z',
            fechaFin: '2026-05-17T10:05:00Z',
            pasosCompletados: 10,
            completada: true,
          },
        ],
      },
      { public: false },
    );
  });
});
