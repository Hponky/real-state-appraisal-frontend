import { renderHook, act } from '@testing-library/react';
import { useImageHandler } from '../useImageHandler';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn((file: File) => `mock-url-${file.name}`);
global.URL.revokeObjectURL = jest.fn();

describe('useImageHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with empty images and no errors', () => {
    const { result } = renderHook(() => useImageHandler());
    expect(result.current.images).toEqual([]);
    expect(result.current.imageFiles).toEqual([]);
    expect(result.current.imageErrors).toBeNull();
  });

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

  test('should remove image and file on removeImage and revoke object URL', () => {
    const { result } = renderHook(() => useImageHandler());
    const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['dummy2'], 'image2.png', { type: 'image/png' });
    const event = { target: { files: [file1, file2], value: '' } } as any;

    act(() => {
      result.current.handleImageUpload(event);
    });

    expect(result.current.images).toHaveLength(2);
    expect(result.current.imageFiles).toHaveLength(2);

    act(() => {
      result.current.removeImage(0); // Remove the first image
    });

    expect(result.current.images).toEqual(['mock-url-image2.png']);
    expect(result.current.imageFiles).toEqual([file2]);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url-image1.jpg');
    expect(result.current.imageErrors).toBeNull(); // Errors should be cleared on removal
  });

  test('should set error if more than MAX_IMAGES are uploaded', () => {
    const { result } = renderHook(() => useImageHandler());
    const manyFiles = Array(31).fill(new File(['dummy'], 'image.jpg', { type: 'image/jpeg' }));
    const event = { target: { files: manyFiles, value: '' } } as any;

    act(() => {
      result.current.handleImageUpload(event);
    });

    expect(result.current.images).toEqual([]); // No images should be added
    expect(result.current.imageFiles).toEqual([]);
    expect(result.current.imageErrors).toBe("Ya ha alcanzado el límite de 30 imágenes.");
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  test('should clear image errors on clearImageErrors', () => {
    const { result } = renderHook(() => useImageHandler());
    const manyFiles = Array(31).fill(new File(['dummy'], 'image.jpg', { type: 'image/jpeg' }));
    const event = { target: { files: manyFiles, value: '' } } as any;

    act(() => {
      result.current.handleImageUpload(event); // This will set an error
    });

    expect(result.current.imageErrors).not.toBeNull();

    act(() => {
      result.current.clearImageErrors();
    });

    expect(result.current.imageErrors).toBeNull();
  });

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