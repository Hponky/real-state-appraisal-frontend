import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyDetailsFields } from '../PropertyDetailsFields';
import { AppraisalFormData } from '../../hooks/appraisalFormSchema';
import '@testing-library/jest-dom';

// Mock shadcn/ui components
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, type, ...props }: any) => (
    <input value={value} onChange={onChange} type={type} {...props} data-testid="input" />
  ),
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, disabled, children }: any) => (
    <select data-testid="select" value={value} onChange={(e) => onValueChange(e.target.value)} disabled={disabled}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));


describe('PropertyDetailsFields', () => {
  const mockSetFormData = jest.fn();
  const mockHandleNumericChange = jest.fn();
  const defaultFormData: AppraisalFormData = {
    department: '',
    city: '',
    address: '',
    documento_ficha_predial_catastral: false,
    property_type: '',
    estrato: '',
    built_area: undefined,
    pot_restriccion_uso_suelo: { selected: false },
    pot_restriccion_edificabilidad: { selected: false },
    pot_restriccion_altura: { selected: false },
    pot_afectacion_via_publica: { selected: false },
    pot_afectacion_ronda_hidrica: { selected: false },
    pot_afectacion_infraestructura_servicios_publicos: { selected: false },
    pot_otra_restriccion_pot: { selected: false },
    zona_declaratoria_especial: { aplica: false, otras_restricciones_seleccion: "No aplica" },
    contrato_escrito_vigente: '',
    preferencia_requisito_futuro_contrato: '',
    responsable_servicios_publicos: '',
    gravamenes_cargas_seleccionados: [],
    litigios_proceso_judicial_seleccionados: [],
    impuestoPredialAlDia: undefined,
    acceso_servicios_publicos: '',
    serviciosConectadosFuncionando: undefined,
    deudasServiciosPublicos: undefined,
    condiciones_seguridad_salubridad: '',
    cumpleNormasSismoresistencia: undefined,
    riesgosEvidentesHabitabilidad: undefined,
    seguros_obligatorios_recomendables: '',
    cuentaPolizaSeguroVigente: undefined,
    documento_certificado_tradicion_libertad: false,
    documento_escritura_publica: false,
    documento_recibo_impuesto_predial: false,
    documento_paz_salvo_administracion: false,
    documento_reglamento_ph: false,
    legal_declarations: {
      declaracion_veracidad: false,
      entendimiento_alcance_analisis: false,
      declaracion_propiedad_exclusiva: false,
      declaracion_uso_previsto: false,
      declaracion_cumplimiento_normas: false,
      declaracion_sin_litigios: false,
      declaracion_servidumbres: false,
      declaracion_sin_afectaciones: false,
      declaracion_impuestos_pagados: false,
      declaracion_sin_deudas_asociacion: false,
      declaracion_informacion_completa: false,
      informacionVerazCompleta: false,
      entendimientoAnalisisLegal: false,
      autorizacionTratamientoDatos: false,
    },
    expectedValue: 0,
    images: [],
    admin_fee: undefined,
    ph_aplica: false,
    ph_sometido_ley_675: false,
    ph_reglamento_interno: false,
    ph_reglamento_cubre_aspectos: false,
    ph_escritura_registrada: false,
  };
  const mockHandleStringChange = jest.fn();
  const defaultProps = {
    formData: defaultFormData,
    setFormData: mockSetFormData,
    errors: {},
    handleNumericChange: mockHandleNumericChange,
    handleStringChange: mockHandleStringChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with default props', () => {
    render(<PropertyDetailsFields {...defaultProps} />);

    expect(screen.getByLabelText(/Área \(m²\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estrato/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Inmueble/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Administración \(COP\)/i)).toBeInTheDocument();

    const areaInput = screen.getByLabelText(/Área \(m²\)/i) as HTMLInputElement;
    const stratumSelect = screen.getByLabelText(/Estrato/i).closest('div')?.querySelector('select');
    const propertyTypeSelect = screen.getByLabelText(/Tipo de Inmueble/i).closest('div')?.querySelector('select');
    const adminFeeInput = screen.getByLabelText(/Administración \(COP\)/i) as HTMLInputElement;


    expect(areaInput).toHaveValue(''); // Value is null initially, renders as empty string
    expect(stratumSelect).toHaveValue('');
    expect(propertyTypeSelect).toHaveValue('');
    expect(adminFeeInput).toHaveValue(''); // Value is null initially, renders as empty string

    expect(areaInput).toHaveAttribute('type', 'number');
    expect(areaInput).toHaveAttribute('min', '0');
    expect(adminFeeInput).toHaveAttribute('type', 'number');
    expect(adminFeeInput).toHaveAttribute('min', '0');

    expect(screen.queryByText(/text-destructive/i)).toBeNull(); // No error messages
  });

  test('renders correct options for Estrato select', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const stratumSelect = screen.getByLabelText(/Estrato/i).closest('div')?.querySelector('select');

    expect(stratumSelect).toHaveLength(7); // 6 options + 1 placeholder
    [1, 2, 3, 4, 5, 6].forEach(stratum => {
      expect(screen.getByRole('option', { name: `Estrato ${stratum}` })).toBeInTheDocument();
    });
  });

  test('renders correct options for Tipo de Inmueble select', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const propertyTypeSelect = screen.getByLabelText(/Tipo de Inmueble/i).closest('div')?.querySelector('select');

    expect(propertyTypeSelect).toHaveLength(9); // 8 options + 1 placeholder
    ['Apartamento', 'Casa', 'Casa lote', 'Casa Recreo', 'Edificio', 'Local Comercial', 'Oficina', 'Garaje'].forEach(type => {
      expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
    });
  });

  test('calls handleNumericChange when Area input changes', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const areaInput = screen.getByLabelText(/Área \(m²\)/i);
    const newArea = '120.5';

    fireEvent.change(areaInput, { target: { value: newArea } });

    expect(mockHandleNumericChange).toHaveBeenCalledTimes(1);
    expect(mockHandleNumericChange).toHaveBeenCalledWith('built_area', newArea);
  });

  test('calls handleNumericChange when Administración input changes', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const adminFeeInput = screen.getByLabelText(/Administración \(COP\)/i);
    const newAdminFee = '350000';

    fireEvent.change(adminFeeInput, { target: { value: newAdminFee } });

    expect(mockHandleNumericChange).toHaveBeenCalledTimes(1);
    expect(mockHandleNumericChange).toHaveBeenCalledWith('admin_fee', newAdminFee);
  });

  test('calls setFormData when Estrato select changes', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const stratumSelect = screen.getByLabelText(/Estrato/i).closest('div')?.querySelector('select');

    fireEvent.change(stratumSelect!, { target: { value: '4' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      estrato: '4',
    });
  });

  test('calls setFormData when Tipo de Inmueble select changes', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const propertyTypeSelect = screen.getByLabelText(/Tipo de Inmueble/i).closest('div')?.querySelector('select');

    fireEvent.change(propertyTypeSelect!, { target: { value: 'Casa' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      property_type: 'Casa',
    });
  });

  test('displays error messages', () => {
    const errors = {
      built_area: 'Area is required',
      estrato: 'Stratum is required',
      property_type: 'Property type is required',
      admin_fee: 'Admin fee is required',
    };
    render(<PropertyDetailsFields {...defaultProps} errors={errors} />);

    expect(screen.getByText('Area is required')).toBeInTheDocument();
    expect(screen.getByText('Stratum is required')).toBeInTheDocument();
    expect(screen.getByText('Property type is required')).toBeInTheDocument();
    expect(screen.getByText('Admin fee is required')).toBeInTheDocument();
  });
});
