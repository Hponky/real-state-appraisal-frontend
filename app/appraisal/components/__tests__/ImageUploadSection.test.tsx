import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUploadSection } from '../ImageUploadSection';
import '@testing-library/jest-dom';

// Mock the lucide-react icons to avoid potential issues in test environment
jest.mock('lucide-react', () => ({
  Upload: () => <svg data-testid="upload-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

// Mock framer-motion components
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

  test('renders correctly with no images and no errors', () => {
    render(<ImageUploadSection {...defaultProps} />);

    expect(screen.getByLabelText(/Fotografías del Inmueble/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i)).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull(); // No images should be displayed
    expect(screen.queryByText(/Máximo de 30 imágenes alcanzado/i)).toBeNull();
    expect(screen.queryByText(/text-destructive/i)).toBeNull(); // No error message
  });

  test('calls handleImageUpload when files are selected', () => {
    render(<ImageUploadSection {...defaultProps} />);
    const fileInput = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i).closest('label')?.nextElementSibling as HTMLInputElement;

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockHandleImageUpload).toHaveBeenCalledTimes(1);
    expect(mockHandleImageUpload).toHaveBeenCalledWith(expect.any(Object)); // Check if called with an event object
  });

  test('renders image previews when images are provided', () => {
    const images = ['mock-url-1.jpg', 'mock-url-2.png'];
    render(<ImageUploadSection {...defaultProps} images={images} />);

    const imgElements = screen.getAllByRole('img');
    expect(imgElements).toHaveLength(images.length);
    expect(imgElements[0]).toHaveAttribute('src', images[0]);
    expect(imgElements[1]).toHaveAttribute('src', images[1]);

    expect(screen.getAllByRole('button', { name: /Eliminar imagen/i })).toHaveLength(images.length);
  });

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

  test('displays error message when image error is present', () => {
    const errors = { images: 'Error uploading file' };
    render(<ImageUploadSection {...defaultProps} errors={errors} />);

    expect(screen.getByText('Error uploading file')).toBeInTheDocument();
    expect(screen.getByText('Error uploading file')).toHaveClass('text-destructive');
  });

  test('disables input and shows limit message when max images reached', () => {
    const manyImages = Array(30).fill('mock-url.jpg');
    render(<ImageUploadSection {...defaultProps} images={manyImages} />);

    const fileInput = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i).closest('label')?.nextElementSibling as HTMLInputElement;
    const uploadLabel = screen.getByLabelText(/Arrastre las imágenes aquí o haga clic para seleccionar/i);


    expect(fileInput).toBeDisabled();
    expect(uploadLabel).toHaveClass('opacity-50'); // Check for visual indication of disabled state
    expect(uploadLabel).toHaveClass('cursor-not-allowed'); // Check for cursor style
    expect(screen.getByText("Máximo de 30 imágenes alcanzado")).toBeInTheDocument();
    expect(screen.queryByText("Arrastre las imágenes aquí o haga clic para seleccionar")).toBeNull(); // Original message should not be visible
  });
});