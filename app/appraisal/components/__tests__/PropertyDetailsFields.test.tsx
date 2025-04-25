import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyDetailsFields } from '../PropertyDetailsFields';
import { AppraisalFormData } from '../../appraisalFormSchema';
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
  SelectTrigger: ({ children, ...props }: any) => <option {...props}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
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


    expect(areaInput).toHaveValue(null); // Value is null initially, renders as empty string
    expect(stratumSelect).toHaveValue('');
    expect(propertyTypeSelect).toHaveValue('');
    expect(adminFeeInput).toHaveValue(null); // Value is null initially, renders as empty string

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
    expect(mockHandleNumericChange).toHaveBeenCalledWith('area', newArea);
  });

  test('calls handleNumericChange when Administración input changes', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const adminFeeInput = screen.getByLabelText(/Administración \(COP\)/i);
    const newAdminFee = '350000';

    fireEvent.change(adminFeeInput, { target: { value: newAdminFee } });

    expect(mockHandleNumericChange).toHaveBeenCalledTimes(1);
    expect(mockHandleNumericChange).toHaveBeenCalledWith('adminFee', newAdminFee);
  });

  test('calls setFormData when Estrato select changes', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const stratumSelect = screen.getByLabelText(/Estrato/i).closest('div')?.querySelector('select');

    fireEvent.change(stratumSelect!, { target: { value: '4' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      stratum: '4',
    });
  });

  test('calls setFormData when Tipo de Inmueble select changes', () => {
    render(<PropertyDetailsFields {...defaultProps} />);
    const propertyTypeSelect = screen.getByLabelText(/Tipo de Inmueble/i).closest('div')?.querySelector('select');

    fireEvent.change(propertyTypeSelect!, { target: { value: 'Casa' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      propertyType: 'Casa',
    });
  });

  test('displays error messages', () => {
    const errors = {
      area: 'Area is required',
      stratum: 'Stratum is required',
      propertyType: 'Property type is required',
      adminFee: 'Admin fee is required',
    };
    render(<PropertyDetailsFields {...defaultProps} errors={errors} />);

    expect(screen.getByText('Area is required')).toBeInTheDocument();
    expect(screen.getByText('Stratum is required')).toBeInTheDocument();
    expect(screen.getByText('Property type is required')).toBeInTheDocument();
    expect(screen.getByText('Admin fee is required')).toBeInTheDocument();
  });
});