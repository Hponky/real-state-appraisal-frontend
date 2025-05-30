import { render, screen, fireEvent } from '@testing-library/react';
import { MaterialQualitySection } from '../MaterialQualitySection';
import { MaterialQualityEntry } from '../../hooks/useMaterialQualityEntries';
import '@testing-library/jest-dom';

// Mock shadcn/ui components
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} data-testid="input" />
  ),
}));
jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, ...props }: any) => (
    <textarea value={value} onChange={onChange} {...props} data-testid="textarea" />
  ),
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props} data-testid="button">
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
}));

// Mock framer-motion components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
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
  });

  test('renders correctly with no entries', () => {
    render(<MaterialQualitySection {...defaultProps} />);

    expect(screen.getByText('Detalles de Calidad de Materiales (Opcional)')).toBeInTheDocument();
    expect(screen.getByText('Añada detalles sobre la calidad de los materiales en diferentes ubicaciones del inmueble.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Añadir otra ubicación/i })).toBeInTheDocument();
    expect(screen.queryByTestId('input')).toBeNull(); // No input fields for entries
    expect(screen.queryByTestId('textarea')).toBeNull(); // No textarea fields for entries
    expect(screen.queryByTestId('trash-icon')).toBeNull(); // No remove button
  });

  test('renders one entry correctly', () => {
    const entries: MaterialQualityEntry[] = [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);

    expect(screen.getByLabelText('Ubicación 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Sitio del Inmueble')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción de Calidad')).toBeInTheDocument();

    const locationInput = screen.getByLabelText('Sitio del Inmueble') as HTMLInputElement;
    const descriptionTextarea = screen.getByLabelText('Descripción de Calidad') as HTMLTextAreaElement;

    expect(locationInput).toHaveValue('Kitchen');
    expect(descriptionTextarea).toHaveValue('Good');
    expect(screen.queryByTestId('trash-icon')).toBeNull(); // Remove button should not be present for single entry
  });

  test('renders multiple entries correctly', () => {
    const entries: MaterialQualityEntry[] = [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' },
      { id: '2', location: 'Bathroom', qualityDescription: 'Average' },
    ];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);

    expect(screen.getByLabelText('Ubicación 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Ubicación 2')).toBeInTheDocument();

    const locationInputs = screen.getAllByLabelText('Sitio del Inmueble') as HTMLInputElement[];
    const descriptionTextareas = screen.getAllByLabelText('Descripción de Calidad') as HTMLTextAreaElement[];
    const removeButtons = screen.getAllByTestId('trash-icon');


    expect(locationInputs).toHaveLength(2);
    expect(descriptionTextareas).toHaveLength(2);
    expect(removeButtons).toHaveLength(2); // Remove button should be present for multiple entries

    expect(locationInputs[0]).toHaveValue('Kitchen');
    expect(descriptionTextareas[0]).toHaveValue('Good');
    expect(locationInputs[1]).toHaveValue('Bathroom');
    expect(descriptionTextareas[1]).toHaveValue('Average');
  });

  test('calls updateMaterialQualityEntry when location input changes', () => {
    const entries: MaterialQualityEntry[] = [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);

    const locationInput = screen.getByLabelText('Sitio del Inmueble');
    const newLocation = 'Living Room';

    fireEvent.change(locationInput, { target: { value: newLocation } });

    expect(mockUpdateEntry).toHaveBeenCalledTimes(1);
    expect(mockUpdateEntry).toHaveBeenCalledWith('1', 'location', newLocation);
  });

  test('calls updateMaterialQualityEntry when description textarea changes', () => {
    const entries: MaterialQualityEntry[] = [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);

    const descriptionTextarea = screen.getByLabelText('Descripción de Calidad');
    const newDescription = 'Excellent';

    fireEvent.change(descriptionTextarea, { target: { value: newDescription } });

    expect(mockUpdateEntry).toHaveBeenCalledTimes(1);
    expect(mockUpdateEntry).toHaveBeenCalledWith('1', 'qualityDescription', newDescription);
  });

  test('calls addMaterialQualityEntry when "Añadir otra ubicación" button is clicked', () => {
    render(<MaterialQualitySection {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: /Añadir otra ubicación/i });

    fireEvent.click(addButton);

    expect(mockAddEntry).toHaveBeenCalledTimes(1);
  });

  test('calls removeMaterialQualityEntry when trash icon button is clicked', () => {
    const entries: MaterialQualityEntry[] = [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' },
      { id: '2', location: 'Bathroom', qualityDescription: 'Average' },
    ];
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} />);

    const removeButtons = screen.getAllByTestId('button').filter(button => button.querySelector('[data-testid="trash-icon"]'));

    fireEvent.click(removeButtons[0]);

    expect(mockRemoveEntry).toHaveBeenCalledTimes(1);
    expect(mockRemoveEntry).toHaveBeenCalledWith('1');
  });

  test('displays error messages for location and description fields', () => {
    const entries: MaterialQualityEntry[] = [{ id: '1', location: '', qualityDescription: '' }];
    const errors = {
      'material_1_location': 'Location is required',
      'material_1_qualityDescription': 'Description is required',
    };
    render(<MaterialQualitySection {...defaultProps} materialQualityEntries={entries} errors={errors} />);

    expect(screen.getByText('Location is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });
});