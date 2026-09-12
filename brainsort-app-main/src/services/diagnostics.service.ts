import { apiClient } from './api';

export interface PreguntaDiagnostico {
  id: string;
  pregunta: string;
  opciones: string[];
}

export interface ResultadoEvaluacion {
  puntaje: number;
  rutaGenerada: string;
  algoritmosSugeridos: number;
}

export const diagnosticsService = {
  async getPreguntas(): Promise<PreguntaDiagnostico[]> {
    return apiClient.get<PreguntaDiagnostico[]>('/diagnostico/preguntas', {
      public: false,
    });
  },

  async evaluar(respuestas: number[]): Promise<ResultadoEvaluacion> {
    return apiClient.post<ResultadoEvaluacion>(
      '/diagnostico/evaluar',
      { respuestas },
      { public: false }
    );
  },
};
