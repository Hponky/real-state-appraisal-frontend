import { renderHook, act } from '@testing-library/react';
import { useFormErrorManagement } from '../hooks/useFormErrorManagement';

describe('useFormErrorManagement', () => {
  it('should initialize with an empty errors object', () => {
    const { result } = renderHook(() => useFormErrorManagement());
    expect(result.current.errors).toEqual({});
  });

  it('should set errors correctly', () => {
    const { result } = renderHook(() => useFormErrorManagement());

    act(() => {
      result.current.setErrors({ field1: 'Error 1', field2: 'Error 2' });
    });

    expect(result.current.errors).toEqual({ field1: 'Error 1', field2: 'Error 2' });
  });

  it('should clear errors correctly', () => {
    const { result } = renderHook(() => useFormErrorManagement());

    act(() => {
      result.current.setErrors({ field1: 'Error 1' });
    });

    act(() => {
      result.current.setErrors({}); // Clear errors by setting an empty object
    });

    expect(result.current.errors).toEqual({});
  });

  it('should combine new errors with existing ones', () => {
    const { result } = renderHook(() => useFormErrorManagement());

    act(() => {
      result.current.setErrors({ field1: 'Error 1' });
    });

    act(() => {
      result.current.setErrors((prevErrors: Record<string, string>) => ({ ...prevErrors, field2: 'Error 2' }));
    });

    expect(result.current.errors).toEqual({ field1: 'Error 1', field2: 'Error 2' });
  });
});

