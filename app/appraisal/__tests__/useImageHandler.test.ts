import { renderHook, act } from '@testing-library/react';
import { useImageHandler } from '../hooks/useImageHandler';

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

  test('should set error if more than MAX_IMAGES are uploaded and prevent adding new images', () => {
    const { result } = renderHook(() => useImageHandler());
    const MAX_IMAGES = 30; // Assuming MAX_IMAGES is 30 as per the hook
    const initialFiles = Array(MAX_IMAGES).fill(new File(['dummy'], 'image.jpg', { type: 'image/jpeg' }));
    const initialEvent = { target: { files: initialFiles, value: '' } } as any;

    act(() => {
      result.current.handleImageUpload(initialEvent);
    });

    expect(result.current.images).toHaveLength(MAX_IMAGES);
    expect(result.current.imageFiles).toHaveLength(MAX_IMAGES);
    expect(result.current.imageErrors).toBeNull();
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(MAX_IMAGES);

    // Attempt to upload one more file than allowed
    const extraFile = new File(['dummy'], 'extra-image.jpg', { type: 'image/jpeg' });
    const extraEvent = { target: { files: [extraFile], value: '' } } as any;

    act(() => {
      result.current.handleImageUpload(extraEvent);
    });

    expect(result.current.images).toHaveLength(MAX_IMAGES); // Should still be MAX_IMAGES
    expect(result.current.imageFiles).toHaveLength(MAX_IMAGES); // Should still be MAX_IMAGES
    expect(result.current.imageErrors).toBe(`Ya ha alcanzado el límite de ${MAX_IMAGES} imágenes.`);
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(MAX_IMAGES); // No new URLs should be created
  });

  test('should clear image errors on clearImageErrors', () => {
    const { result } = renderHook(() => useImageHandler());
    const MAX_IMAGES = 30;

    // First, upload MAX_IMAGES to reach the limit
    const initialFiles = Array(MAX_IMAGES).fill(new File(['dummy'], 'image.jpg', { type: 'image/jpeg' }));
    act(() => {
      result.current.handleImageUpload({ target: { files: initialFiles, value: '' } } as any);
    });
    expect(result.current.images).toHaveLength(MAX_IMAGES);
    expect(result.current.imageErrors).toBeNull();

    // Then, attempt to upload one more file to trigger the error
    const extraFile = new File(['dummy'], 'extra-image.jpg', { type: 'image/jpeg' });
    act(() => {
      result.current.handleImageUpload({ target: { files: [extraFile], value: '' } } as any);
    });

    // Expect an error to be set
    expect(result.current.imageErrors).not.toBeNull();
    expect(result.current.imageErrors).toBe(`Ya ha alcanzado el límite de ${MAX_IMAGES} imágenes.`);

    // Clear the errors
    act(() => {
      result.current.clearImageErrors();
    });

    // Expect errors to be null after clearing
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