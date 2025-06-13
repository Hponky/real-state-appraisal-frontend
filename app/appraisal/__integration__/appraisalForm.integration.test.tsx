// Tests de integración para el formulario de avalúo
// Cubrirán el flujo completo de llenado y envío del formulario.

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppraisalForm from '../page'; // Assuming the form component is exported as default from page.tsx
import { appraisalApiService } from '../../services/appraisalApiService';
import { placesApiService } from '../../services/placesApi';
import { useRouter } from 'next/navigation';
import { AppraisalFormData } from '../hooks/appraisalFormSchema'; // Import the actual type

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

// Define MockFileReader outside describe block with minimal implementation
class MockFileReader {
    result: string | ArrayBuffer | null = null;
    readyState: number = 0; // 0 = EMPTY, 1 = LOADING, 2 = DONE

    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL = jest.fn((file: Blob) => {
        this.readyState = 1; // LOADING
        setTimeout(() => {
            this.result = `data:${file.type};base64,mock_encoded_${file.name}`;
            this.readyState = 2; // DONE
        }, 10);
    });
}

const setupMockFileReader = (): MockFileReader[] => {
    const mockFileReaders: MockFileReader[] = [];
    jest.spyOn(global, 'FileReader').mockImplementation(() => {
        const reader = new MockFileReader();
        mockFileReaders.push(reader);
        return reader as unknown as FileReader; // Cast to FileReader
    });
    return mockFileReaders;
};


describe('Appraisal Form Integration Tests', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({ push: mockPush });

        mockPlacesApiService.getPlaces.mockResolvedValue([
            { id: 1, departamento: 'Cundinamarca', ciudades: ['Bogota', 'Chia'] },
            { id: 2, departamento: 'Antioquia', ciudades: ['Medellin'] },
        ]);

        mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined);
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
        fireEvent.change(screen.getByLabelText(/Valor Esperado \(COP\)/i), { target: { value: '250000000' } });

        // Toggle legal sections on
        fireEvent.click(screen.getByLabelText(/Incluir Secciones Legales \(Opcional\)/i));
        await waitFor(() => {
            expect(screen.getByText(/Sección B: Propiedad Horizontal/i)).toBeInTheDocument();
        });

        // Fill out some legal section fields (PH, Zona Declaratoria Especial, Legal Declarations)
        // PH Fields
        fireEvent.click(screen.getByLabelText(/Aplica Propiedad Horizontal/i)); // Toggle PH on
        fireEvent.click(screen.getByLabelText(/Sí, está sometido a la Ley 675 de 2001/i));
        fireEvent.click(screen.getByLabelText(/Sí, existe un reglamento interno/i));
        fireEvent.click(screen.getByLabelText(/Sí, el reglamento cubre aspectos relevantes/i));
        fireEvent.click(screen.getByLabelText(/Sí, la escritura está registrada/i));
        fireEvent.change(screen.getByLabelText(/Tipo de Propiedad/i).closest('div')?.querySelector('select')!, { target: { value: 'Residencial' } });
        fireEvent.change(screen.getByLabelText(/Nombre del Conjunto o Edificio/i), { target: { value: 'Conjunto Residencial Ejemplo' } });
        fireEvent.change(screen.getByLabelText(/NIT de la Copropiedad/i), { target: { value: '900123456-7' } });
        fireEvent.click(screen.getByLabelText(/Sí, el Reglamento de Propiedad Horizontal está inscrito/i));
        fireEvent.click(screen.getByLabelText(/No, no existen deudas por cuotas de administración/i));

        // Zona Declaratoria Especial
        fireEvent.click(screen.getByLabelText(/Aplica Zona de Declaratoria Especial/i)); // Toggle on
        fireEvent.change(screen.getByLabelText(/Tipo de Declaratoria Especial/i).closest('div')?.querySelector('select')!, { target: { value: 'Histórica (Bien de Interés Cultural - BIC)' } });
        fireEvent.change(screen.getByLabelText(/Fuente de la Declaratoria/i), { target: { value: 'Decreto 123 de 2020' } });
        fireEvent.click(screen.getByLabelText(/Sí, esta declaratoria impone obligaciones económicas o de mantenimiento específicas al propietario/i));

        // Documentos (Section G)
        fireEvent.click(screen.getByLabelText(/Certificado de Tradición y Libertad/i));
        fireEvent.click(screen.getByLabelText(/Escritura Pública del Inmueble/i));
        fireEvent.click(screen.getByLabelText(/Recibo de Impuesto Predial/i));
        fireEvent.click(screen.getByLabelText(/Paz y Salvo de Administración/i));
        fireEvent.click(screen.getByLabelText(/Reglamento de Propiedad Horizontal/i));
        fireEvent.change(screen.getByLabelText(/Otros documentos relevantes/i), { target: { value: 'Plano arquitectónico' } });

        // Legal Declarations (Section H)
        fireEvent.click(screen.getByLabelText(/Declaro que la información proporcionada es veraz y completa/i));
        fireEvent.click(screen.getByLabelText(/Entiendo el alcance del análisis legal/i));
        fireEvent.click(screen.getByLabelText(/Autorizo el tratamiento de mis datos personales/i));


        // Mock image file upload
        const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
        const fileInput = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i).closest('label')?.nextElementSibling as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        const mockFileReaders = setupMockFileReader();


        // Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Continuar y Evaluar/i }));

        // Simulate FileReader loading and wait for it to complete
        await act(async () => {
            if (fileInput.files && fileInput.files.length > 0) {
                mockFileReaders[0].readAsDataURL(fileInput.files[0]);
            }
        });
        await waitFor(() => expect(mockFileReaders[0].readyState).toBe(FileReader.DONE));

        // Wait for the submission to complete
        await waitFor(() => {
            expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledTimes(1);
        });


        // Verify appraisalApiService.submitAppraisal was called with correct data
        // The first argument is requestId, the second is the data object
        const requestIdArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
        const dataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][1] as unknown as AppraisalFormData; // Added unknown cast

        expect(typeof requestIdArg).toBe('string'); // requestId should be a string (uuid)
        expect(dataArg).toBeDefined();
        expect(dataArg.department).toBe('Cundinamarca');
        expect(dataArg.city).toBe('Bogota');
        expect(dataArg.address).toBe('Calle 123 #45-67');
        expect(dataArg.built_area).toBe(150); // Area should be a number
        expect(dataArg.estrato).toBe('4'); // Estrato should be a string
        expect(dataArg.admin_fee).toBe(200000); // Administracion should be a number
        expect(dataArg.property_type).toBe('Casa');
        expect(dataArg.expectedValue).toBe(250000000); // Valor Esperado should be a number

        // Verify PH Fields
        expect(dataArg.ph_aplica).toBe(true);
        expect(dataArg.ph_sometido_ley_675).toBe(true);
        expect(dataArg.ph_reglamento_interno).toBe(true);
        expect(dataArg.ph_reglamento_cubre_aspectos).toBe(true);
        expect(dataArg.ph_escritura_registrada).toBe(true);
        expect(dataArg.ph_tipo_propiedad).toBe('Residencial');
        expect(dataArg.ph_nombre_conjunto).toBe('Conjunto Residencial Ejemplo');
        expect(dataArg.ph_nit_copropiedad).toBe('900123456-7');
        expect(dataArg.reglamentoPropiedadHorizontalInscrito).toBe(true);
        expect(dataArg.deudasCuotasAdministracion).toBe(false);

        // Verify Zona Declaratoria Especial
        expect(dataArg.zona_declaratoria_especial.aplica).toBe(true);
        expect(dataArg.zona_declaratoria_especial.tipo).toBe('Histórica (Bien de Interés Cultural - BIC)');
        expect(dataArg.zona_declaratoria_especial.fuente).toBe('Decreto 123 de 2020');
        expect(dataArg.zona_declaratoria_especial.declaratoriaImponeObligaciones).toBe(true);

        // Verify Document Fields (Section G)
        expect(dataArg.documento_certificado_tradicion_libertad).toBe(true);
        expect(dataArg.documento_escritura_publica).toBe(true);
        expect(dataArg.documento_recibo_impuesto_predial).toBe(true);
        expect(dataArg.documento_paz_salvo_administracion).toBe(true);
        expect(dataArg.documento_reglamento_ph).toBe(true);
        expect(dataArg.documentos_otros).toBe('Plano arquitectónico');

        // Verify Legal Declarations (Section H)
        expect(dataArg.legal_declarations.declaracion_veracidad).toBe(true);
        expect(dataArg.legal_declarations.entendimiento_alcance_analisis).toBe(true);
        expect(dataArg.legal_declarations.autorizacionTratamientoDatos).toBe(true);
        expect(dataArg.legal_declarations.informacionVerazCompleta).toBe(true);
        expect(dataArg.legal_declarations.entendimientoAnalisisLegal).toBe(true);


        const imagesData = dataArg.images; // Now expecting File objects
        expect(imagesData).toHaveLength(1);
        expect(imagesData[0]).toBeInstanceOf(File);
        expect(imagesData[0].name).toBe('test.jpg');
        expect(imagesData[0].type).toBe('image/jpeg');


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
        fireEvent.click(screen.getByRole('button', { name: /Continuar y Evaluar/i }));

        // Wait for validation errors to appear
        await waitFor(() => {
            expect(screen.getByText('El departamento es requerido.')).toBeInTheDocument();
            expect(screen.getByText('La ciudad es requerida.')).toBeInTheDocument();
            expect(screen.getByText('La dirección es requerida.')).toBeInTheDocument();
            expect(screen.getByText('El área construida debe ser un número positivo.')).toBeInTheDocument();
            expect(screen.getByText('El estrato es requerido.')).toBeInTheDocument();
            expect(screen.getByText('El valor esperado debe ser un número positivo.')).toBeInTheDocument();
            expect(screen.getByText('Debe subir al menos una imagen del inmueble.')).toBeInTheDocument();
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
        fireEvent.click(screen.getByRole('button', { name: /Continuar y Evaluar/i }));

        // Wait for validation errors to appear
        await waitFor(() => {
            expect(screen.getByText('La dirección es requerida.')).toBeInTheDocument();
            expect(screen.getByText('El área construida debe ser un número positivo.')).toBeInTheDocument();
            expect(screen.getByText('El estrato es requerido.')).toBeInTheDocument();
            expect(screen.getByText('La administración debe ser un número positivo.')).toBeInTheDocument();
            expect(screen.getByText('El valor esperado debe ser un número positivo.')).toBeInTheDocument();
            expect(screen.getByText('Debe subir al menos una imagen del inmueble.')).toBeInTheDocument(); // Image is still missing
        });

        // Verify that appraisalApiService.submitAppraisal was NOT called
        expect(mockAppraisalApiService.submitAppraisal).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    test('should successfully submit the form with multiple images', async () => { // Updated test name
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

        // Toggle legal sections on
        fireEvent.click(screen.getByLabelText(/Incluir Secciones Legales \(Opcional\)/i));
        await waitFor(() => {
            expect(screen.getByText(/Sección B: Propiedad Horizontal/i)).toBeInTheDocument();
        });

        // Fill out some legal section fields (PH, Zona Declaratoria Especial, Legal Declarations)
        // PH Fields
        fireEvent.click(screen.getByLabelText(/Aplica Propiedad Horizontal/i)); // Toggle PH on
        fireEvent.click(screen.getByLabelText(/Sí, está sometido a la Ley 675 de 2001/i));
        fireEvent.click(screen.getByLabelText(/Sí, existe un reglamento interno/i));
        fireEvent.click(screen.getByLabelText(/Sí, el reglamento cubre aspectos relevantes/i));
        fireEvent.click(screen.getByLabelText(/Sí, la escritura está registrada/i));
        fireEvent.change(screen.getByLabelText(/Tipo de Propiedad/i).closest('div')?.querySelector('select')!, { target: { value: 'Residencial' } });
        fireEvent.change(screen.getByLabelText(/Nombre del Conjunto o Edificio/i), { target: { value: 'Conjunto Residencial Ejemplo 2' } });
        fireEvent.change(screen.getByLabelText(/NIT de la Copropiedad/i), { target: { value: '900765432-1' } });
        fireEvent.click(screen.getByLabelText(/Sí, el Reglamento de Propiedad Horizontal está inscrito/i));
        fireEvent.click(screen.getByLabelText(/No, no existen deudas por cuotas de administración/i));

        // Zona Declaratoria Especial
        fireEvent.click(screen.getByLabelText(/Aplica Zona de Declaratoria Especial/i)); // Toggle on
        fireEvent.change(screen.getByLabelText(/Tipo de Declaratoria Especial/i).closest('div')?.querySelector('select')!, { target: { value: 'Cultural' } });
        fireEvent.change(screen.getByLabelText(/Fuente de la Declaratoria/i), { target: { value: 'Acuerdo 456 de 2021' } });
        fireEvent.click(screen.getByLabelText(/No, esta declaratoria no impone obligaciones económicas o de mantenimiento específicas al propietario/i));

        // Documentos (Section G)
        fireEvent.click(screen.getByLabelText(/Certificado de Tradición y Libertad/i));
        fireEvent.click(screen.getByLabelText(/Escritura Pública del Inmueble/i));
        fireEvent.click(screen.getByLabelText(/Recibo de Impuesto Predial/i));
        fireEvent.click(screen.getByLabelText(/Paz y Salvo de Administración/i));
        fireEvent.click(screen.getByLabelText(/Reglamento de Propiedad Horizontal/i));
        fireEvent.change(screen.getByLabelText(/Otros documentos relevantes/i), { target: { value: 'Certificado de libertad y tradición' } });

        // Legal Declarations (Section H)
        fireEvent.click(screen.getByLabelText(/Declaro que la información proporcionada es veraz y completa/i));
        fireEvent.click(screen.getByLabelText(/Entiendo el alcance del análisis legal/i));
        fireEvent.click(screen.getByLabelText(/Autorizo el tratamiento de mis datos personales/i));


        // Mock multiple image file uploads
        const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
        const file2 = new File(['dummy2'], 'image2.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i).closest('label')?.nextElementSibling as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file1, file2] } });

        const mockFileReaders = setupMockFileReader();


        // Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Continuar y Evaluar/i }));

        // Simulate FileReader loading for both files and wait for them to complete
        await act(async () => {
            if (fileInput.files && fileInput.files.length > 0) {
                mockFileReaders[0].readAsDataURL(fileInput.files[0]);
                mockFileReaders[1].readAsDataURL(fileInput.files[1]);
            }
        });
        await waitFor(() => expect(mockFileReaders[0].readyState).toBe(FileReader.DONE));
        await waitFor(() => expect(mockFileReaders[1].readyState).toBe(FileReader.DONE));


        // Wait for the submission to complete
        await waitFor(() => {
            expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledTimes(1);
        });


        // Verify appraisalApiService.submitAppraisal was called with correct data
        // The first argument is requestId, the second is the data object
        const requestIdArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
        const dataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][1] as unknown as AppraisalFormData; // Added unknown cast

        expect(typeof requestIdArg).toBe('string'); // requestId should be a string (uuid)
        expect(dataArg).toBeDefined();
        expect(dataArg.department).toBe('Cundinamarca');
        expect(dataArg.city).toBe('Bogota');
        expect(dataArg.address).toBe('Calle Principal');
        expect(dataArg.built_area).toBe(200);
        expect(dataArg.estrato).toBe('5');
        expect(dataArg.admin_fee).toBe(300000);
        expect(dataArg.property_type).toBe('Apartamento');
        expect(dataArg.expectedValue).toBe(300000000);

        // Verify PH Fields
        expect(dataArg.ph_aplica).toBe(true);
        expect(dataArg.ph_sometido_ley_675).toBe(true);
        expect(dataArg.ph_reglamento_interno).toBe(true);
        expect(dataArg.ph_reglamento_cubre_aspectos).toBe(true);
        expect(dataArg.ph_escritura_registrada).toBe(true);
        expect(dataArg.ph_tipo_propiedad).toBe('Residencial');
        expect(dataArg.ph_nombre_conjunto).toBe('Conjunto Residencial Ejemplo 2');
        expect(dataArg.ph_nit_copropiedad).toBe('900765432-1');
        expect(dataArg.reglamentoPropiedadHorizontalInscrito).toBe(true);
        expect(dataArg.deudasCuotasAdministracion).toBe(false);

        // Verify Zona Declaratoria Especial
        expect(dataArg.zona_declaratoria_especial.aplica).toBe(true);
        expect(dataArg.zona_declaratoria_especial.tipo).toBe('Cultural');
        expect(dataArg.zona_declaratoria_especial.fuente).toBe('Acuerdo 456 de 2021');
        expect(dataArg.zona_declaratoria_especial.declaratoriaImponeObligaciones).toBe(false);

        // Verify Document Fields (Section G)
        expect(dataArg.documento_certificado_tradicion_libertad).toBe(true);
        expect(dataArg.documento_escritura_publica).toBe(true);
        expect(dataArg.documento_recibo_impuesto_predial).toBe(true);
        expect(dataArg.documento_paz_salvo_administracion).toBe(true);
        expect(dataArg.documento_reglamento_ph).toBe(true);
        expect(dataArg.documentos_otros).toBe('Certificado de libertad y tradición');

        // Verify Legal Declarations (Section H)
        expect(dataArg.legal_declarations.declaracion_veracidad).toBe(true);
        expect(dataArg.estrato).toBe('5');
        expect(dataArg.admin_fee).toBe(300000);
        expect(dataArg.property_type).toBe('Apartamento');
        expect(dataArg.expectedValue).toBe(300000000);

        // Verify PH Fields
        expect(dataArg.ph_aplica).toBe(true);
        expect(dataArg.ph_sometido_ley_675).toBe(true);
        expect(dataArg.ph_reglamento_interno).toBe(true);
        expect(dataArg.ph_reglamento_cubre_aspectos).toBe(true);
        expect(dataArg.ph_escritura_registrada).toBe(true);
        expect(dataArg.ph_tipo_propiedad).toBe('Residencial');
        expect(dataArg.ph_nombre_conjunto).toBe('Conjunto Residencial Ejemplo 2');
        expect(dataArg.ph_nit_copropiedad).toBe('900765432-1');
        expect(dataArg.reglamentoPropiedadHorizontalInscrito).toBe(true);
        expect(dataArg.deudasCuotasAdministracion).toBe(false);

        // Verify Zona Declaratoria Especial
        expect(dataArg.zona_declaratoria_especial.aplica).toBe(true);
        expect(dataArg.zona_declaratoria_especial.tipo).toBe('Cultural');
        expect(dataArg.zona_declaratoria_especial.fuente).toBe('Acuerdo 456 de 2021');
        expect(dataArg.zona_declaratoria_especial.declaratoriaImponeObligaciones).toBe(false);

        // Verify Document Fields (Section G)
        expect(dataArg.documento_certificado_tradicion_libertad).toBe(true);
        expect(dataArg.documento_escritura_publica).toBe(true);
        expect(dataArg.documento_recibo_impuesto_predial).toBe(true);
        expect(dataArg.documento_paz_salvo_administracion).toBe(true);
        expect(dataArg.documento_reglamento_ph).toBe(true);
        expect(dataArg.documentos_otros).toBe('Certificado de libertad y tradición');

        // Verify Legal Declarations (Section H)
        expect(dataArg.legal_declarations.declaracion_veracidad).toBe(true);
        expect(dataArg.legal_declarations.entendimiento_alcance_analisis).toBe(true);
        expect(dataArg.legal_declarations.autorizacionTratamientoDatos).toBe(true);
        expect(dataArg.legal_declarations.informacionVerazCompleta).toBe(true);
        expect(dataArg.legal_declarations.entendimientoAnalisisLegal).toBe(true);


        const imagesData = dataArg.images;
        expect(imagesData).toHaveLength(2);
        expect(imagesData[0]).toBeInstanceOf(File);
        expect(imagesData[0].name).toBe('image1.jpg');
        expect(imagesData[0].type).toBe('image/jpeg');
        expect(imagesData[1]).toBeInstanceOf(File);
        expect(imagesData[1].name).toBe('image2.png');
        expect(imagesData[1].type).toBe('image/png');


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
