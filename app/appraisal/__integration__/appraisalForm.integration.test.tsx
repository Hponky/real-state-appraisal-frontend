// Tests de integración para el formulario de avalúo
// Cubrirán el flujo completo de llenado y envío del formulario.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppraisalForm } from '../page'; // Assuming the form component is exported from page.tsx
import { appraisalApiService } from '../../services/appraisalApiService';
import { placesApiService } from '../../services/placesApi';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('../../services/appraisalApiService');
jest.mock('../../services/placesApi');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock shadcn/ui components used in the form
// These mocks should be more realistic than the simple mocks in unit tests
// if they are critical to the integration flow.
// For now, we can reuse the simplified mocks if they are sufficient.
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

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, type, ...props }: any) => (
    <input value={value} onChange={onChange} type={type} {...props} data-testid="input" />
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

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Upload: () => <svg data-testid="upload-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
}));

// Mock framer-motion components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));


const mockAppraisalApiService = appraisalApiService as jest.Mocked<typeof appraisalApiService>;
const mockPlacesApiService = placesApiService as jest.Mocked<typeof placesApiService>;
const mockUseRouter = useRouter as jest.Mock;


describe('Appraisal Form Integration Tests', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({ push: mockPush });

        // Default mock for placesApiService
        mockPlacesApiService.getPlaces.mockResolvedValue([
            { id: 1, departamento: 'Cundinamarca', ciudades: ['Bogota', 'Chia'] },
            { id: 2, departamento: 'Antioquia', ciudades: ['Medellin'] },
        ]);

        // Default mock for appraisalApiService
        mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined); // Simulate success
    });

    test('should successfully submit the form with valid data', async () => {
        render(<AppraisalForm />);

        // Wait for places data to load and selects to be enabled
        await waitFor(() => {
            expect(screen.getByLabelText(/Departamento/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Ciudad/i)).toBeDisabled(); // City should be disabled initially
        });

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select')!, { target: { value: 'Cundinamarca' } });

        // Wait for cities to load
        await waitFor(() => {
             expect(screen.getByLabelText(/Ciudad/i)).not.toBeDisabled();
        });

        fireEvent.change(screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select')!, { target: { value: 'Bogota' } });
        fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: 'Calle 123 #45-67' } });
        fireEvent.change(screen.getByLabelText(/Área \(m²\)/i), { target: { value: '150' } });
        fireEvent.change(screen.getByLabelText(/Estrato/i).closest('div')?.querySelector('select')!, { target: { value: '4' } });
        fireEvent.change(screen.getByLabelText(/Administración \(COP\)/i), { target: { value: '200000' } });
        fireEvent.change(screen.getByLabelText(/Tipo de Inmueble/i).closest('div')?.querySelector('select')!, { target: { value: 'Casa' } });

        // Add and fill material quality entry
        fireEvent.click(screen.getByRole('button', { name: /Añadir otra ubicación/i }));
        const locationInputs = screen.getAllByLabelText('Sitio del Inmueble');
        const descriptionTextareas = screen.getAllByLabelText('Descripción de Calidad');
        fireEvent.change(locationInputs[0], { target: { value: 'Cocina' } });
        fireEvent.change(descriptionTextareas[0], { target: { value: 'Remodelada' } });


        // Mock image file upload
        const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
        const fileInput = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i).closest('label')?.nextElementSibling as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Mock FileReader for image conversion
        const mockReadAsDataURL = jest.fn();
        const mockFileReader = {
          onloadend: null as any,
          onerror: null as any,
          readAsDataURL: mockReadAsDataURL,
        };
        jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);


        // Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Enviar Avalúo/i }));

        // Simulate FileReader loading
        await act(async () => {
            if (mockFileReader.onloadend) {
                mockFileReader.onloadend({ target: { result: 'data:image/jpeg;base64,encoded_test_image' } } as any);
            }
        });

        // Wait for the submission to complete
        await waitFor(() => {
            expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledTimes(1);
        });


        // Verify appraisalApiService.submitAppraisal was called with correct data
        const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
        expect(formDataArg instanceof FormData).toBe(true);
        expect(formDataArg.get('departamento')).toBe('Cundinamarca');
        expect(formDataArg.get('ciudad')).toBe('Bogota');
        expect(formDataArg.get('direccion')).toBe('Calle 123 #45-67');
        expect(formDataArg.get('area')).toBe('150');
        expect(formDataArg.get('estrato')).toBe('4');
        expect(formDataArg.get('administracion')).toBe('200000');
        expect(formDataArg.get('tipo_inmueble')).toBe('Casa');

        const materialQualityDetails = JSON.parse(formDataArg.get('material_quality_details') as string);
        expect(materialQualityDetails).toHaveLength(1);
        expect(materialQualityDetails[0].location).toBe('Cocina');
        expect(materialQualityDetails[0].qualityDescription).toBe('Remodelada');

        const imagesData = JSON.parse(formDataArg.get('images') as string);
         expect(imagesData).toEqual(['data:image/jpeg;base64,encoded_test_image']);


        // Verify navigation to results page
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
    });

    test('should display validation errors when submitting with missing required fields', async () => {
        render(<AppraisalForm />);

        // Wait for places data to load (to ensure selects are rendered)
        await waitFor(() => {
            expect(screen.getByLabelText(/Departamento/i)).not.toBeDisabled();
        });

        // Do NOT fill out any required fields

        // Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Enviar Avalúo/i }));

        // Wait for validation errors to appear
        await waitFor(() => {
            expect(screen.getByText('Seleccione un departamento')).toBeInTheDocument();
            expect(screen.getByText('Seleccione una ciudad')).toBeInTheDocument();
            expect(screen.getByText('Ingrese una dirección válida')).toBeInTheDocument();
            expect(screen.getByText('Ingrese un área numérica positiva')).toBeInTheDocument();
            expect(screen.getByText('Seleccione un estrato')).toBeInTheDocument();
            expect(screen.getByText('Ingrese el valor esperado')).toBeInTheDocument();
            expect(screen.getByText('Seleccione el tipo de inmueble')).toBeInTheDocument();
            expect(screen.getByText('Cargue al menos una imagen')).toBeInTheDocument();
        });

        // Verify that appraisalApiService.submitAppraisal was NOT called
        expect(mockAppraisalApiService.submitAppraisal).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    test('should display validation errors when submitting with invalid data', async () => {
        render(<AppraisalForm />);

         // Wait for places data to load (to ensure selects are rendered)
        await waitFor(() => {
            expect(screen.getByLabelText(/Departamento/i)).not.toBeDisabled();
        });

        // Fill out some fields with invalid data
        fireEvent.change(screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select')!, { target: { value: 'Cundinamarca' } });
         await waitFor(() => {
             expect(screen.getByLabelText(/Ciudad/i)).not.toBeDisabled();
        });
        fireEvent.change(screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select')!, { target: { value: 'Bogota' } });
        fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: '' } }); // Missing address
        fireEvent.change(screen.getByLabelText(/Área \(m²\)/i), { target: { value: '-100' } }); // Invalid area
        fireEvent.change(screen.getByLabelText(/Estrato/i).closest('div')?.querySelector('select')!, { target: { value: '' } }); // Missing stratum
        fireEvent.change(screen.getByLabelText(/Administración \(COP\)/i), { target: { value: '-50' } }); // Invalid admin fee
        fireEvent.change(screen.getByLabelText(/Tipo de Inmueble/i).closest('div')?.querySelector('select')!, { target: { value: 'Casa' } });
        fireEvent.change(screen.getByLabelText(/Valor Esperado \(COP\)/i), { target: { value: 'abc' } }); // Invalid expected value

        // Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Enviar Avalúo/i }));

        // Wait for validation errors to appear
        await waitFor(() => {
            expect(screen.getByText('Ingrese una dirección válida')).toBeInTheDocument();
            expect(screen.getByText('Ingrese un área numérica positiva')).toBeInTheDocument();
            expect(screen.getByText('Seleccione un estrato')).toBeInTheDocument();
            expect(screen.getByText('Ingrese una administración numérica no negativa')).toBeInTheDocument();
             // Depending on Zod's error message for non-numeric expectedValue after preprocess
            expect(screen.getByText('Ingrese un valor numérico para el valor esperado')).toBeInTheDocument();
             expect(screen.getByText('Cargue al menos una imagen')).toBeInTheDocument(); // Image is still missing
        });

        // Verify that appraisalApiService.submitAppraisal was NOT called
        expect(mockAppraisalApiService.submitAppraisal).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    test('should successfully submit the form with multiple material quality entries and multiple images', async () => {
        render(<AppraisalForm />);

        // Wait for places data to load
        await waitFor(() => {
            expect(screen.getByLabelText(/Departamento/i)).not.toBeDisabled();
        });

        // Fill out required fields with valid data
        fireEvent.change(screen.getByLabelText(/Departamento/i).closest('div')?.querySelector('select')!, { target: { value: 'Cundinamarca' } });
        await waitFor(() => {
             expect(screen.getByLabelText(/Ciudad/i)).not.toBeDisabled();
        });
        fireEvent.change(screen.getByLabelText(/Ciudad/i).closest('div')?.querySelector('select')!, { target: { value: 'Bogota' } });
        fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: 'Calle Principal' } });
        fireEvent.change(screen.getByLabelText(/Área \(m²\)/i), { target: { value: '200' } });
        fireEvent.change(screen.getByLabelText(/Estrato/i).closest('div')?.querySelector('select')!, { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Administración \(COP\)/i), { target: { value: '300000' } });
        fireEvent.change(screen.getByLabelText(/Tipo de Inmueble/i).closest('div')?.querySelector('select')!, { target: { value: 'Apartamento' } });
        fireEvent.change(screen.getByLabelText(/Valor Esperado \(COP\)/i), { target: { value: '300000000' } });


        // Add and fill multiple material quality entries
        fireEvent.click(screen.getByRole('button', { name: /Añadir otra ubicación/i })); // Add first entry
        fireEvent.click(screen.getByRole('button', { name: /Añadir otra ubicación/i })); // Add second entry

        const locationInputs = screen.getAllByLabelText('Sitio del Inmueble');
        const descriptionTextareas = screen.getAllByLabelText('Descripción de Calidad');

        fireEvent.change(locationInputs[0], { target: { value: 'Sala' } });
        fireEvent.change(descriptionTextareas[0], { target: { value: 'Piso de madera' } });

        fireEvent.change(locationInputs[1], { target: { value: 'Baño principal' } });
        fireEvent.change(descriptionTextareas[1], { target: { value: 'Acabados de lujo' } });


        // Mock multiple image file uploads
        const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
        const file2 = new File(['dummy2'], 'image2.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i).closest('label')?.nextElementSibling as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file1, file2] } });

        // Mock FileReader for image conversion
        const mockReadAsDataURL = jest.fn();
        const mockFileReader = {
          onloadend: null as any,
          onerror: null as any,
          readAsDataURL: mockReadAsDataURL,
        };
        jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);


        // Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Enviar Avalúo/i }));

        // Simulate FileReader loading for both files
        await act(async () => {
            if (mockFileReader.onloadend) {
                mockFileReader.onloadend({ target: { result: 'data:image/jpeg;base64,encoded_image1' } } as any);
            }
        });
         await act(async () => {
            if (mockFileReader.onloadend) {
                mockFileReader.onloadend({ target: { result: 'data:image/png;base64,encoded_image2' } } as any);
            }
        });


        // Wait for the submission to complete
        await waitFor(() => {
            expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledTimes(1);
        });


        // Verify appraisalApiService.submitAppraisal was called with correct data
        const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
        expect(formDataArg instanceof FormData).toBe(true);
        expect(formDataArg.get('departamento')).toBe('Cundinamarca');
        expect(formDataArg.get('ciudad')).toBe('Bogota');
        expect(formDataArg.get('direccion')).toBe('Calle Principal');
        expect(formDataArg.get('area')).toBe('200');
        expect(formDataArg.get('estrato')).toBe('5');
        expect(formDataArg.get('administracion')).toBe('300000');
        expect(formDataArg.get('tipo_inmueble')).toBe('Apartamento');
        expect(formDataArg.get('valor_esperado')).toBe('300000000');


        const materialQualityDetails = JSON.parse(formDataArg.get('material_quality_details') as string);
        expect(materialQualityDetails).toHaveLength(2);
        expect(materialQualityDetails).toEqual(expect.arrayContaining([
             expect.objectContaining({ location: 'Sala', qualityDescription: 'Piso de madera' }),
             expect.objectContaining({ location: 'Baño principal', qualityDescription: 'Acabados de lujo' }),
        ]));


        const imagesData = JSON.parse(formDataArg.get('images') as string);
         expect(imagesData).toEqual([
             'data:image/jpeg;base64,encoded_image1',
             'data:image/png;base64,encoded_image2',
         ]);


        // Verify navigation to results page
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
    });


    // Remaining integration tests to add:
    // - Submission when places API fails
    // - Submission when appraisal API fails
    // - Interaction with image removal
    // - Interaction with material quality entry removal

});