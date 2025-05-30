import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationFields } from '../LocationFields';
import { AppraisalFormData } from '../../hooks/appraisalFormSchema';
import '@testing-library/jest-dom';

// Mock the shadcn/ui select component as it requires specific DOM structure and context
// This is a simplified mock, adjust if more complex interactions are needed
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, disabled, children }: any) => (
    <select data-testid="select" value={value} onChange={(e) => onValueChange(e.target.value)} disabled={disabled}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children, ...props }: any) => <option {...props}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));


describe('LocationFields', () => {
  const mockSetFormData = jest.fn();
  const defaultFormData: AppraisalFormData = {
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
    const errors = {
      department: 'Department is required',
      city: 'City is required',
      address: 'Address is required',
    };
    render(<LocationFields {...defaultProps} errors={errors} />);

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