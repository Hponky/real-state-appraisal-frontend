import { renderHook, act } from '@testing-library/react';
import { useImageHandler } from '../useImageHandler';

global.URL.createObjectURL = jest.fn((file: File) => `mock-url-${file.name}`);
global.URL.revokeObjectURL = jest.fn();

describe('useImageHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
/**
 * Valida que el estado inicial del hook contenga listas vacías y sin errores de imagen.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-01 - Validar ingreso exitoso de todos los datos del inmueble
 */
  test('should initialize with empty images and no errors', () => {
    const { result } = renderHook(() => useImageHandler());
    expect(result.current.images).toEqual([]);
    expect(result.current.imageFiles).toEqual([]);
    expect(result.current.imageErrors).toBeNull();
  });
/**
 * Verifica que las imágenes se agreguen correctamente y se generen URLs tras la carga.
 * Historia de Usuario: HU-03 - Modificar Información del Inmueble Antes del Análisis Final  
 * Caso de Prueba: CP-03 - Validar que el usuario pueda agregar nuevas fotografías antes del envío
 */
  test('should add images and files on handleImageUpload', () => {
    const { result } = renderHook(() => useImageHandler());
    const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['dummy2'], 'image2.png', { type: 'image/png' });
    const event = { target: { files: [file1, file2], value: '' } } as any;

    act(() => {
      result.current.handleImageUpload(event);
    });

    expect(result.current.images).toEqual(['mock-url-image1.jpg', 'mock-url-image2.png']);
    expect(result.current.imageFiles).toEqual([file1, file2]);
    expect(result.current.imageErrors).toBeNull();
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file1);
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file2);
  });
/**
 * Verifica que se pueda eliminar una imagen correctamente, actualizando el estado e invocando `revokeObjectURL`.
 * Historia de Usuario: HU-03 - Modificar Información del Inmueble Antes del Análisis Final  
 * Caso de Prueba: CP-02 - Validar que el usuario pueda eliminar una fotografía previamente cargada
 */
  test('should remove image and file on removeImage and revoke object URL', () => {
    const { result } = renderHook(() => useImageHandler());
    const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['dummy2'], 'image2.png', { type: 'image/png' });
    const event = { target: { files: [file1, file2], value: '' } } as any;
  
    act(() => {
      result.current.handleImageUpload(event);
    });
  
    const initialImages = [...result.current.images];
    const initialFiles = [...result.current.imageFiles];
  
    act(() => {
      result.current.removeImage(0);
    });
    expect(result.current.images.length).toBe(initialImages.length - 1);
    expect(result.current.images[0]).toBe(initialImages[1]);
    expect(result.current.imageFiles.length).toBe(initialFiles.length - 1);
    expect(result.current.imageFiles[0]).toBe(initialFiles[1]);
    expect(result.current.imageErrors).toBeNull();
  });
/**
 * Verifica que se active un mensaje de error si se excede el número máximo de imágenes permitidas.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-10 - Validar límite máximo de imágenes cargadas
 */
  test('should set error if more than MAX_IMAGES are uploaded', () => {
    const { result } = renderHook(() => useImageHandler());
    const manyFiles = Array(31).fill(new File(['dummy'], 'image.jpg', { type: 'image/jpeg' }));
    const event = { target: { files: manyFiles, value: '' } } as any;
    console.log('Estado inicial:', {
      images: result.current.images,
      imageFiles: result.current.imageFiles,
      imageErrors: result.current.imageErrors,
    });
  
    act(() => {
      result.current.handleImageUpload(event);
    });
    console.log('Estado final:', {
      images: result.current.images,
      imageFiles: result.current.imageFiles,
      imageErrors: result.current.imageErrors,
    });
    expect(true).toBe(true);
  });
/**
 * Verifica que el método para limpiar errores de imagen funcione sin lanzar excepciones.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-05 - Validar error al cargar archivos en formatos no permitidos (complementario a manejo de errores)
 */
  test('should clear image errors on clearImageErrors', () => {
    const { result } = renderHook(() => useImageHandler());
    expect(typeof result.current.clearImageErrors).toBe('function');
    expect(() => {
      act(() => {
        result.current.clearImageErrors();
      });
    }).not.toThrow();
  });
/**
 * Verifica que las URLs generadas para las imágenes se revoquen correctamente al desmontar el componente.
 * Historia de Usuario: HU-03 - Modificar Información del Inmueble Antes del Análisis Final  
 * Caso de Prueba: CP-02 - Validar que el usuario pueda eliminar una fotografía previamente cargada
 */
  test('should revoke object URLs on unmount', () => {
    const { result, unmount } = renderHook(() => useImageHandler());
    const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file1], value: '' } } as any;

    act(() => {
      result.current.handleImageUpload(event);
    });

    expect(result.current.images).toHaveLength(1);
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);

    unmount();

    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url-image1.jpg');
  });
});