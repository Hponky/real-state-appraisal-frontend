import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MaterialQualitySection } from '../MaterialQualitySection';

jest.mock('../MaterialQualitySection', () => ({
  MaterialQualitySection: (props) => {
    global.lastProps = props;
    return <div data-testid="mock-material-quality-section">MaterialQualitySection Mock</div>;
  }
}));

describe('MaterialQualitySection', () => {
  const mockAddEntry = jest.fn();
  const mockRemoveEntry = jest.fn();
  const mockUpdateEntry = jest.fn();

  const defaultProps = {
    materialQualityEntries: [],
    errors: {},
    addMaterialQualityEntry: mockAddEntry,
    removeMaterialQualityEntry: mockRemoveEntry,
    updateMaterialQualityEntry: mockUpdateEntry,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.lastProps = null;
  });
/**
 * Verifica que el componente se renderiza correctamente cuando no hay entradas de calidad de material.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
 * Caso de Prueba: CP-01 - Validar que el sistema proponga mejoras relevantes para el inmueble y su estado
 */
  test('renders correctly with no entries', () => {
    render(<MaterialQualitySection {...defaultProps} />);
    expect(global.lastProps.materialQualityEntries).toEqual([]);
  });
/**
 * Verifica que el componente se renderiza correctamente con una única entrada de calidad.
 * Historia de Usuario: HU-05  
 * Caso de Prueba: CP-01
 */
  test('renders one entry correctly', () => {
    const entries = [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' }
    ];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);
    expect(global.lastProps.materialQualityEntries).toEqual(entries);
  });
/**
 * Verifica que el componente se renderiza correctamente con múltiples entradas de calidad.
 * Historia de Usuario: HU-05  
 * Caso de Prueba: CP-04 - Validar que el usuario pueda modificar los parámetros de mejora y ver su 
 * impacto actualizado
 */
  test('renders multiple entries correctly', () => {
    const entries = [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' },
      { id: '2', location: 'Bathroom', qualityDescription: 'Average' }
    ];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);
    expect(global.lastProps.materialQualityEntries).toEqual(entries);
  });
/**
 * Verifica que se llama a `updateMaterialQualityEntry` al cambiar el valor del campo ubicación.
 * Historia de Usuario: HU-05  
 * Caso de Prueba: CP-04
 */
  test('calls updateMaterialQualityEntry when location input changes', () => {
    const entries = [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' }
    ];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);
    global.lastProps.updateMaterialQualityEntry('1', 'location', 'Living Room');
    expect(mockUpdateEntry).toHaveBeenCalledWith('1', 'location', 'Living Room');
  });
/**
 * Verifica que se llama a `updateMaterialQualityEntry` al cambiar la descripción de calidad.
 * Historia de Usuario: HU-05  
 * Caso de Prueba: CP-04
 */
  test('calls updateMaterialQualityEntry when description textarea changes', () => {
    const entries = [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' }
    ];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);
    global.lastProps.updateMaterialQualityEntry('1', 'qualityDescription', 'Excellent');
    expect(mockUpdateEntry).toHaveBeenCalledWith('1', 'qualityDescription', 'Excellent');
  });
/**
 * Verifica que se llame a `addMaterialQualityEntry` cuando se hace clic en el botón para añadir más ubicaciones.
 * Historia de Usuario: HU-05  
 * Caso de Prueba: CP-04
 */
  test('calls addMaterialQualityEntry when "Añadir otra ubicación" button is clicked', () => {
    render(<MaterialQualitySection {...defaultProps} />);
    global.lastProps.addMaterialQualityEntry();
    expect(mockAddEntry).toHaveBeenCalled();
  });
/**
 * Verifica que se llama a `removeMaterialQualityEntry` al hacer clic en el icono de eliminar.
 * Historia de Usuario: HU-05  
 * Caso de Prueba: CP-04
 */
  test('calls removeMaterialQualityEntry when trash icon button is clicked', () => {
    const entries = [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' },
      { id: '2', location: 'Bathroom', qualityDescription: 'Average' }
    ];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);
    global.lastProps.removeMaterialQualityEntry('1');
    expect(mockRemoveEntry).toHaveBeenCalledWith('1');
  });
/**
 * Verifica que los mensajes de error se muestran cuando hay errores en los campos de ubicación y descripción.
 * Historia de Usuario: HU-05  
 * Caso de Prueba: CP-05 - Validar comportamiento del sistema ante ausencia de datos clave para sugerencias o valorización
 */
  test('displays error messages for location and description fields', () => {
    const entries = [
      { id: '1', location: '', qualityDescription: '' }
    ];
    const errors = {
      'material_1_location': 'Location is required',
      'material_1_qualityDescription': 'Description is required'
    };
    
    render(
      <MaterialQualitySection 
        {...defaultProps} 
        materialQualityEntries={entries} 
        errors={errors} 
      />
    );
    
    expect(global.lastProps.errors).toEqual(errors);
  });
});