import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationFields } from '../LocationFields';
import { AppraisalFormData } from '../../hooks/appraisalFormSchema';
import '@testing-library/jest-dom';
import { useFormContext } from 'react-hook-form';

// Mock the shadcn/ui select component to behave like a native select for testing purposes.
jest.mock('@/components/ui/select', () => {
  const React = require('react');

  // Helper to get display name for mocked components
  const getDisplayName = (Component: any) => {
    return Component.displayName || Component.name || null;
  };

  return {
    Select: ({ value, onValueChange, disabled, children }: any) => {
      const childrenArray = React.Children.toArray(children);

      const selectTrigger = childrenArray.find(
        (child: any) => React.isValidElement(child) && getDisplayName(child.type) === 'SelectTrigger'
      );
      const selectContent = childrenArray.find(
        (child: any) => React.isValidElement(child) && getDisplayName(child.type) === 'SelectContent'
      );

      const selectValuePlaceholder = selectTrigger
        ? React.Children.toArray(selectTrigger.props.children).find(
            (child: any) => React.isValidElement(child) && getDisplayName(child.type) === 'SelectValue'
          )?.props.placeholder
        : '';

      const options = selectContent
        ? React.Children.toArray(selectContent.props.children).map((item: any) => {
            if (React.isValidElement(item) && getDisplayName(item.type) === 'SelectItem') {
              return (
                <option key={item.props.value} value={item.props.value}>
                  {item.props.children}
                </option>
              );
            }
            return null;
          })
        : [];

      return (
        <select
          data-testid="mock-select" // Add a test ID for the native select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          // Associate with label if present, assuming LocationFields passes aria-label or id
          aria-label={selectTrigger?.props['aria-label'] || ''}
        >
          {selectValuePlaceholder && <option value="" disabled>{selectValuePlaceholder}</option>}
          {options}
        </select>
      );
    },
    SelectTrigger: ({ children, ...props }: any) => {
      const Trigger = (p: any) => <button {...p}>{children}</button>;
      Trigger.displayName = 'SelectTrigger';
      return <Trigger {...props} />;
    },
    SelectValue: ({ placeholder }: any) => {
      return <span data-testid="select-value">{placeholder}</span>;
    },
    SelectItem: ({ value, children }: any) => {
      return <div data-testid={`select-item-${value}`} data-value={value}>{children}</div>;
    },
  };
});


// Mock useFormContext
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: jest.fn(),
}));

describe('LocationFields', () => {
  const mockSetFormData = jest.fn();
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
    zona_declaratoria_especial: { aplica: false, otras_restricciones_seleccion: 'No aplica' },
    contrato_escrito_vigente: '',
    preferencia_requisito_futuro_contrato: '',
    responsable_servicios_publicos: '',
    gravamenes_cargas_seleccionados: [],
    litigios_proceso_judicial_seleccionados: [],
    impuestoPredialAlDia: false,
    acceso_servicios_publicos: '',
    serviciosConectadosFuncionando: false,
    deudasServiciosPublicos: false,
    condiciones_seguridad_salubridad: '',
    cumpleNormasSismoresistencia: false,
    riesgosEvidentesHabitabilidad: false,
    seguros_obligatorios_recomendables: '',
    cuentaPolizaSeguroVigente: false,
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
    reglamentoPropiedadHorizontalInscrito: false,
    deudasCuotasAdministracion: false,
    ph_tipo_propiedad: undefined,
    ph_nombre_conjunto: '',
    ph_nit_copropiedad: '',
    ph_restriccion_arrendamiento: '',
    ph_cuotas_pendientes: '',
    ph_normativa_interna: '',
  };
  const defaultProps = {
    formData: defaultFormData,
    setFormData: mockSetFormData,
    departments: ['Dept A', 'Dept B'],
    cities: ['City X', 'City Y'],
    isLoadingPlaces: false,
    placesError: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with default props', () => {
    render(<LocationFields {...defaultProps} />);

    expect(screen.getByLabelText(/Departamento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ciudad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();

    const departmentSelect = screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select');
    const citySelect = screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select');
    const addressInput = screen.getByLabelText(/Dirección/i);


    expect(departmentSelect).toHaveValue('');
    expect(citySelect).toHaveValue('');
    expect(addressInput).toHaveValue('');
    expect(screen.queryByText(/text-destructive/i)).toBeNull(); // No error messages
  });

  test('renders department options', () => {
    render(<LocationFields {...defaultProps} />);
    const departmentSelect = screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select');

    expect(departmentSelect).toHaveLength(defaultProps.departments.length + 1); // +1 for placeholder
    expect(screen.getByRole('option', { name: 'Dept A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dept B' })).toBeInTheDocument();
  });

  test('renders city options when department is selected and cities are available', () => {
    const propsWithDepartment = {
      ...defaultProps,
      formData: { ...defaultFormData, department: 'Dept A' },
    };
    render(<LocationFields {...propsWithDepartment} />);
    const citySelect = screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select');


    expect(citySelect).toHaveLength(defaultProps.cities.length + 1); // +1 for placeholder
    expect(screen.getByRole('option', { name: 'City X' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'City Y' })).toBeInTheDocument();
    expect(citySelect).not.toBeDisabled();
  });

  test('disables city select when no department is selected', () => {
    render(<LocationFields {...defaultProps} />);
    const citySelect = screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select');

    expect(citySelect).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Seleccione departamento primero' })).toBeInTheDocument();
  });

  test('disables city select when no cities are available for selected department', () => {
    const propsWithDepartmentNoCities = {
      ...defaultProps,
      formData: { ...defaultFormData, department: 'Dept A' },
      cities: [],
    };
    render(<LocationFields {...propsWithDepartmentNoCities} />);
    const citySelect = screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select');

    expect(citySelect).toBeDisabled();
    expect(screen.getByRole('option', { name: 'No hay ciudades disponibles' })).toBeInTheDocument();
  });


  test('calls setFormData when department is selected', () => {
    render(<LocationFields {...defaultProps} />);
    const departmentSelect = screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select');

    fireEvent.change(departmentSelect!, { target: { value: 'Dept A' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      department: 'Dept A',
      city: '', // City should be reset
    });
  });

  test('calls setFormData when city is selected', () => {
    const propsWithDepartment = {
      ...defaultProps,
      formData: { ...defaultFormData, department: 'Dept A' },
    };
    render(<LocationFields {...propsWithDepartment} />);
    const citySelect = screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select');

    fireEvent.change(citySelect!, { target: { value: 'City X' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...propsWithDepartment.formData,
      city: 'City X',
    });
  });

  test('calls setFormData when address input changes', () => {
    render(<LocationFields {...defaultProps} />);
    const addressInput = screen.getByLabelText(/Dirección/i);
    const newAddress = 'New Address 123';

    fireEvent.change(addressInput, { target: { value: newAddress } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      address: newAddress,
    });
  });

  test('displays error messages', () => {
    const mockErrors = {
      department: { type: 'required', message: 'Department is required' },
      city: { type: 'required', message: 'City is required' },
      address: { type: 'required', message: 'Address is required' },
    };

    (useFormContext as jest.Mock).mockReturnValue({
      control: {
        _fields: {},
        _names: {
          mount: new Set(),
          unMount: new Set(),
          array: new Set(),
          watch: new Set(),
          focus: new Set(),
        },
        _formValues: {},
        _defaultValues: {},
        _formState: {
          isDirty: false,
          isValidating: false,
          dirtyFields: {},
          isSubmitted: false,
          isSubmitSuccessful: false,
          submitCount: 0,
          touchedFields: {},
          isSubmitting: false,
          isValid: false,
          errors: mockErrors, // Inject errors here
        },
        _proxyFormState: {
          isDirty: false,
          isValidating: false,
          dirtyFields: false,
          isSubmitted: false,
          isSubmitSuccessful: false,
          submitCount: false,
          touchedFields: false,
          isSubmitting: false,
          isValid: false,
          errors: true,
        },
        _subjects: {
          watch: {
            next: jest.fn(),
          },
          array: {
            next: jest.fn(),
          },
          state: {
            next: jest.fn(),
          },
        },
        _get: jest.fn(),
        _set: jest.fn(),
        _updateFormState: jest.fn(),
        _updateFieldArray: jest.fn(),
        _getFieldArray: jest.fn(),
      },
      formState: { errors: mockErrors }, // Provide errors in formState
      setValue: mockSetFormData,
      watch: jest.fn(() => defaultFormData),
    });

    render(<LocationFields {...defaultProps} />);

    expect(screen.getByText('Department is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(screen.getByText('Address is required')).toBeInTheDocument();
  });

  test('displays loading message for departments', () => {
    render(<LocationFields {...defaultProps} isLoadingPlaces={true} departments={[]} />);
    const departmentSelect = screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select');

    // Open the select to see the options
    fireEvent.mouseDown(departmentSelect!); // Simulate opening the select

    // Use waitFor because the content might render asynchronously
    waitFor(() => {
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  test('displays error message for departments', () => {
    render(<LocationFields {...defaultProps} placesError="Failed to load departments" departments={[]} />);
    const departmentSelect = screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select');

    // Open the select to see the options
    fireEvent.mouseDown(departmentSelect!); // Simulate opening the select

    // Use waitFor because the content might render asynchronously
    waitFor(() => {
        expect(screen.getByText('Error al cargar')).toBeInTheDocument();
    });
  });

  test('displays loading message for cities', () => {
    const propsWithDepartment = {
        ...defaultProps,
        formData: { ...defaultFormData, department: 'Dept A' },
        isLoadingPlaces: true,
        cities: [],
      };
    render(<LocationFields {...propsWithDepartment} />);
    const citySelect = screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select');

    // Open the select to see the options
    fireEvent.mouseDown(citySelect!); // Simulate opening the select

    // Use waitFor because the content might render asynchronously
    waitFor(() => {
        expect(screen.getByText('Cargando ciudades...')).toBeInTheDocument();
    });
  });

  test('displays error message for cities', () => {
    const propsWithDepartment = {
        ...defaultProps,
        formData: { ...defaultFormData, department: 'Dept A' },
        placesError: "Failed to load cities",
        cities: [],
      };
    render(<LocationFields {...propsWithDepartment} />);
    const citySelect = screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select');

    // Open the select to see the options
    fireEvent.mouseDown(citySelect!); // Simulate opening the select

    // Use waitFor because the content might render asynchronously
    waitFor(() => {
        expect(screen.getByText('Error al cargar ciudades')).toBeInTheDocument();
    });
  });
});
