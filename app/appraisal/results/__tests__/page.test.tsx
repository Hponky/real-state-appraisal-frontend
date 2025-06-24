import { render, screen, waitFor } from '@testing-library/react';
import Results from '../page';
import { useSearchParams } from 'next/navigation';

// Mock del hook useSearchParams de Next.js
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock de la función fetch global
global.fetch = jest.fn();

describe('Results Page', () => {
  const mockAppraisalData = {
    requestId: 'test-123',
    status: 'completed',
    results: {
      form_data: {
        ciudad: 'Bogota',
        tipo_inmueble: 'Apartamento',
        estrato: 4,
        area_usuario_m2: 80,
        direccion: 'Calle Falsa 123',
        analisis_mercado: {
          rango_mercado_cop: { min: 200000000, max: 250000000 },
          resumen_mercado: 'Mercado estable con demanda moderada.',
        },
        evaluacion_tecnica: {
          observaciones_tecnicas_clave: ['Buena estructura', 'Acabados modernos'],
        },
        valoracion_actual: {
          estimacion_arriendo_actual_cop: 1500000,
        },
        potencial_valorizacion: {
          arriendo_potencial_total_estimado_cop: 1800000,
          recomendaciones_valorizacion: [
            { recomendacion: 'Remodelar cocina', aumento_potencial_estimado_cop: 100000 },
            { recomendacion: 'Mejorar baños', aumento_potencial_estimado_cop: 50000 },
          ],
        },
      },
    },
  };

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('test-123'),
    });
  });

  test('should display loading state initially', () => {
    // Configurar fetch para que no resuelva inmediatamente
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Results />);
    expect(screen.getByText('Cargando resultados...')).toBeInTheDocument();
  });

  test('should display error message if no ID is found', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    render(<Results />);
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los resultados: No appraisal request ID found in the URL.')).toBeInTheDocument();
    });
  });

  test('should display error message if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<Results />);
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los resultados: Network error')).toBeInTheDocument();
    });
  });

  test('should display error message if API returns an error status', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Appraisal not found' }),
      status: 404,
    });

    render(<Results />);
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los resultados: Appraisal not found')).toBeInTheDocument();
    });
  });

  test('should display pending message if API status is pending', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'pending' }),
      status: 202,
    });

    render(<Results />);
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los resultados: Appraisal is still pending. Please wait or try refreshing.')).toBeInTheDocument();
    });
  });


  test('should display formatted appraisal data when status is completed', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAppraisalData,
      status: 200,
    });

    render(<Results />);

    await waitFor(() => {
      // Verificar que los datos generales se muestran
      expect(screen.getByText('Resultados del Peritaje')).toBeInTheDocument();
      expect(screen.getByText('Información General')).toBeInTheDocument();
      expect(screen.getByText('ID Solicitud: test-123')).toBeInTheDocument();
      expect(screen.getByText('Ciudad: Bogota')).toBeInTheDocument();
      expect(screen.getByText('Tipo de Inmueble: Apartamento')).toBeInTheDocument();
      expect(screen.getByText('Estrato: 4')).toBeInTheDocument();
      expect(screen.getByText('Área (m²): 80')).toBeInTheDocument();
      expect(screen.getByText('Dirección: Calle Falsa 123')).toBeInTheDocument();

      // Verificar que el análisis de mercado se muestra
      expect(screen.getByText('Análisis de Mercado')).toBeInTheDocument();
      expect(screen.getByText('Rango de Mercado (COP): 200000000 - 250000000')).toBeInTheDocument();
      expect(screen.getByText('Resumen: Mercado estable con demanda moderada.')).toBeInTheDocument();

      // Verificar que la evaluación técnica se muestra
      expect(screen.getByText('Evaluación Técnica')).toBeInTheDocument();
      expect(screen.getByText('Observaciones Clave:')).toBeInTheDocument();
      expect(screen.getByText('Buena estructura')).toBeInTheDocument();
      expect(screen.getByText('Acabados modernos')).toBeInTheDocument();

      // Verificar que la valoración actual se muestra
      expect(screen.getByText('Valoración Actual')).toBeInTheDocument();
      expect(screen.getByText('Estimación Arriendo Actual (COP): 1500000')).toBeInTheDocument();

      // Verificar que el potencial de valorización se muestra
      expect(screen.getByText('Potencial de Valorización')).toBeInTheDocument();
      expect(screen.getByText('Arriendo Potencial Estimado (COP): 1800000')).toBeInTheDocument();
      expect(screen.getByText('Recomendaciones:')).toBeInTheDocument();
      expect(screen.getByText('Remodelar cocina (Aumento Potencial Estimado: 100000 COP)')).toBeInTheDocument();
      expect(screen.getByText('Mejorar baños (Aumento Potencial Estimado: 50000 COP)')).toBeInTheDocument();
    });
  });
});