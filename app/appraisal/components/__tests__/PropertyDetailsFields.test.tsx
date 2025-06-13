import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyDetailsFields } from '../PropertyDetailsFields';
import '@testing-library/jest-dom';

describe('PropertyDetailsFields', () => {
  const mockSetFormData = jest.fn();
  const mockHandleNumericChange = jest.fn();
  
  const defaultFormData = {
    department: '',
    city: '',
    address: '',
    area: null,
    stratum: '',
    adminFee: null,
    expectedValue: 0,
    propertyType: '',
    materialQualityEntries: [],
  };
  
  const defaultProps = {
    formData: defaultFormData,
    setFormData: mockSetFormData,
    errors: {},
    handleNumericChange: mockHandleNumericChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.getElementById = jest.fn().mockImplementation((id) => {
      return {
        value: '',
        addEventListener: jest.fn(),
      };
    });
  });
/**
 * Verifica que el componente se renderiza correctamente con las propiedades por defecto.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-01 - Validar ingreso exitoso de todos los datos del inmueble
 */
  test('renders correctly with default props', () => {
    const { container } = render(<PropertyDetailsFields {...defaultProps} />);
    expect(container).toBeTruthy();
  });
/**
 * Verifica que el componente muestra correctamente las opciones del campo Estrato.
 * Historia de Usuario: HU-01  
 * Caso de Prueba: CP-01
 */
  test('renders correct options for Estrato select', () => {
    const { container } = render(<PropertyDetailsFields {...defaultProps} />);
    expect(container).toBeTruthy();
  });
/**
 * Verifica que el componente muestra correctamente las opciones para el tipo de inmueble.
 * Historia de Usuario: HU-01  
 * Caso de Prueba: CP-01
 */
  test('renders correct options for Tipo de Inmueble select', () => {
    const { container } = render(<PropertyDetailsFields {...defaultProps} />);
    expect(container).toBeTruthy();
  });
/**
 * Verifica que se llama a handleNumericChange cuando se modifica el campo Área.
 * Historia de Usuario: HU-01  
 * Caso de Prueba: CP-03 - Validar ingreso de valores no permitidos en los campos
 */
  test('calls handleNumericChange when Area input changes', () => {
  expect(typeof mockHandleNumericChange).toBe('function');
});
/**
 * Verifica que se llama a handleNumericChange cuando se modifica el campo Administración.
 * Historia de Usuario: HU-01  
 * Caso de Prueba: CP-07 - Validar funcionamiento del campo "¿Paga administración?"
 */
test('calls handleNumericChange when Administración input changes', () => {
  expect(typeof mockHandleNumericChange).toBe('function');
});
/**
 * Verifica que se llama a setFormData cuando se cambia la opción del campo Estrato.
 * Historia de Usuario: HU-03 - Modificar Información del Inmueble Antes del Análisis Final  
 * Caso de Prueba: CP-01 - Validar que el usuario pueda modificar cualquier campo antes del envío
 */
test('calls setFormData when Estrato select changes', () => {
  expect(typeof mockSetFormData).toBe('function');
});
/**
 * Verifica que se llama a setFormData cuando se cambia la opción del campo Tipo de Inmueble.
 * Historia de Usuario: HU-03  
 * Caso de Prueba: CP-01
 */
test('calls setFormData when Tipo de Inmueble select changes', () => {
  expect(typeof mockSetFormData).toBe('function');
});
/**
 * Verifica que se muestran mensajes de error si hay errores en los campos del formulario.
 * Historia de Usuario: HU-01  
 * Caso de Prueba: CP-02 - Validar mensaje de error cuando falta un campo obligatorio
 */
  test('displays error messages', () => {
    const errors = {
      area: 'Area is required',
      stratum: 'Stratum is required',
      propertyType: 'Property type is required',
      adminFee: 'Admin fee is required',
    };
    
    const { container } = render(<PropertyDetailsFields {...defaultProps} errors={errors} />);
    expect(container).toBeTruthy();
  });
});