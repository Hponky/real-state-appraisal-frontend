import fetchMock from 'jest-fetch-mock';
import { appraisalApiService } from '../appraisalApiService';

fetchMock.enableMocks();

describe('appraisalApiService', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('submitAppraisal should send form data and return successfully on 200', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Appraisal submitted successfully' }), { status: 200 });

    const mockFormData = new FormData();
    mockFormData.append('field1', 'value1');
    mockFormData.append('field2', 'value2');

    await expect(appraisalApiService.submitAppraisal(mockFormData)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/appraisal', // Assuming this is the correct endpoint
      {
        method: 'POST',
        body: mockFormData,
      }
    );
  });

  test('submitAppraisal should throw an error on non-200 response', async () => {
    const errorResponse = { message: 'Submission failed' };
    fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 400 });

    const mockFormData = new FormData();
    mockFormData.append('field1', 'value1');

    await expect(appraisalApiService.submitAppraisal(mockFormData)).rejects.toThrow(
      `Error submitting appraisal: ${JSON.stringify(errorResponse)}`
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/appraisal', // Assuming this is the correct endpoint
      {
        method: 'POST',
        body: mockFormData,
      }
    );
  });

  test('submitAppraisal should throw an error on network failure', async () => {
    const networkError = new Error('Network request failed');
    fetchMock.mockRejectOnce(networkError);

    const mockFormData = new FormData();
    mockFormData.append('field1', 'value1');

    await expect(appraisalApiService.submitAppraisal(mockFormData)).rejects.toThrow(
      `Error submitting appraisal: ${networkError.message}`
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/appraisal', // Assuming this is the correct endpoint
      {
        method: 'POST',
        body: mockFormData,
      }
    );
  });
});