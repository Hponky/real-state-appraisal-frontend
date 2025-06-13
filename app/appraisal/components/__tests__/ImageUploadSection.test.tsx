import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUploadSection } from '../ImageUploadSection';
import '@testing-library/jest-dom';

jest.mock('lucide-react', () => ({
  Upload: () => <svg data-testid="upload-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));


describe('ImageUploadSection', () => {
  const mockHandleImageUpload = jest.fn();
  const mockRemoveImage = jest.fn();
  const defaultProps = {
    images: [],
    errors: {},
    handleImageUpload: mockHandleImageUpload,
    removeImage: mockRemoveImage,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
/**
 * Verifica que el componente se renderiza correctamente sin imágenes ni errores.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-04 - Validar carga de imágenes en formatos permitidos
 */
  test('renders correctly with no images and no errors', () => {
    render(<ImageUploadSection {...defaultProps} />);

    expect(screen.getByLabelText(/Fotografías del Inmueble/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i)).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull(); 
    expect(screen.queryByText(/Máximo de 30 imágenes alcanzado/i)).toBeNull();
    expect(screen.queryByText(/text-destructive/i)).toBeNull(); 
  });
/**
 * Verifica que se llama a `handleImageUpload` cuando el usuario selecciona archivos.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-04 - Validar carga de imágenes en formatos permitidos
 */
  test('calls handleImageUpload when files are selected', () => {
    render(<ImageUploadSection {...defaultProps} />);
    const fileInput = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i);
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(mockHandleImageUpload).toHaveBeenCalledTimes(1);
    expect(mockHandleImageUpload).toHaveBeenCalledWith(expect.any(Object)); 
  });
/**
 * Verifica que se rendericen las imágenes cuando se proporcionan URLs.
 * Historia de Usuario: HU-03 - Modificar Información del Inmueble Antes del Análisis Final  
 * Caso de Prueba: CP-03 - Validar que el usuario pueda agregar nuevas fotografías antes del envío
 */
  test('renders image previews when images are provided', () => {
    const images = ['mock-url-1.jpg', 'mock-url-2.png'];
    render(<ImageUploadSection {...defaultProps} images={images} />);
    const imgElements = screen.getAllByRole('img');
    expect(imgElements).toHaveLength(images.length);
    expect(imgElements[0]).toHaveAttribute('src', images[0]);
    expect(imgElements[1]).toHaveAttribute('src', images[1]);
    expect(screen.getAllByRole('button', { name: /Eliminar imagen/i })).toHaveLength(images.length);
  });
/**
 * Verifica que se invoque la función `removeImage` con el índice correcto al hacer clic en "Eliminar".
 * Historia de Usuario: HU-03 - Modificar Información del Inmueble Antes del Análisis Final  
 * Caso de Prueba: CP-02 - Validar que el usuario pueda eliminar una fotografía previamente cargada
 */
  test('calls removeImage with correct index when remove button is clicked', () => {
    const images = ['mock-url-1.jpg', 'mock-url-2.png'];
    render(<ImageUploadSection {...defaultProps} images={images} />);
    const removeButtons = screen.getAllByRole('button', { name: /Eliminar imagen/i });

    fireEvent.click(removeButtons[0]);
    expect(mockRemoveImage).toHaveBeenCalledTimes(1);
    expect(mockRemoveImage).toHaveBeenCalledWith(0);
    fireEvent.click(removeButtons[1]);
    expect(mockRemoveImage).toHaveBeenCalledTimes(2);
    expect(mockRemoveImage).toHaveBeenCalledWith(1);
  });
/**
 * Verifica que se muestre el mensaje de error cuando hay errores asociados a imágenes.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-05 - Validar error al cargar archivos en formatos no permitidos
 */
  test('displays error message when image error is present', () => {
    const errors = { images: 'Error uploading file' };
    render(<ImageUploadSection {...defaultProps} errors={errors} />);
    expect(screen.getByText('Error uploading file')).toBeInTheDocument();
    expect(screen.getByText('Error uploading file')).toHaveClass('text-destructive');
  });
/**
 * Verifica que se desactive el input y se muestre un mensaje cuando se alcanza el máximo de imágenes.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-10 - Validar límite máximo de imágenes cargadas
 */
  test('disables input and shows limit message when max images reached', () => {
    const manyImages = Array(30).fill('mock-url.jpg');
    render(<ImageUploadSection {...defaultProps} images={manyImages} />);
    expect(screen.getByText("Máximo de 30 imágenes alcanzado")).toBeInTheDocument();
    const fileInputs = document.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(0);
    expect(fileInputs[0]).toBeDisabled();
    const limitContainer = screen.getByText("Máximo de 30 imágenes alcanzado").parentElement;
    expect(limitContainer).toHaveClass('opacity-50');
    expect(limitContainer).toHaveClass('cursor-not-allowed');
  });
  /*-------------------------------------------------------------------------------------*/
/**
 * @description
 * Este test valida que el usuario pueda subir un archivo PDF como plano del inmueble y que el sistema lo acepte correctamente como carga opcional.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-09 - Validar carga opcional de planos del inmueble en PDF
 */
  test('should handle PDF file upload', async () => {
  render(<ImageUploadSection {...defaultProps} />);

  const fileInput = document.querySelector('input[type="file"]');
  const file = new File(['test'], 'plano.pdf', { type: 'application/pdf' });

  fireEvent.change(fileInput, { target: { files: [file] } });

  expect(mockHandleImageUpload).toHaveBeenCalled();
  expect(mockHandleImageUpload.mock.calls[0][0].target.files[0].name).toBe('plano.pdf');
});
  
});