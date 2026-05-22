import { apiService } from '@/lib/api/api.service';
import { CONVERSION_ENDPOINTS } from '@/constants/conversion.constants';
import {
  IConversionRule,
  IConversionRuleForm,
  IConversionExecutionRequest,
  IConversionExecutionResponse,
  IConversionRecord,
  IConversionsPaginatedResponse,
  IConversionRecordsPaginatedResponse,
  IConversionQueryParams,
} from '@/models/conversion.model';

export const conversionService = {
  /**
   * Create a new conversion rule
   */
  async createConversion(data: IConversionRuleForm): Promise<IConversionRule> {
    const response = await apiService.post(CONVERSION_ENDPOINTS.CREATE, data);
    return response as IConversionRule;
  },

  /**
   * Get all conversion rules with pagination
   */
  async getAllConversions(
    params: IConversionQueryParams = {}
  ): Promise<IConversionsPaginatedResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${CONVERSION_ENDPOINTS.GET_ALL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.get(url);
    return response as IConversionsPaginatedResponse;
  },

  /**
   * Get active conversion rules
   */
  async getActiveConversions(
    params: IConversionQueryParams = {}
  ): Promise<IConversionsPaginatedResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${CONVERSION_ENDPOINTS.GET_ACTIVE}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.get(url);
    return response as IConversionsPaginatedResponse;
  },

  /**
   * Get conversions by raw product ID
   */
  async getConversionsByRawProduct(
    raw_product_id: string,
    params: IConversionQueryParams = {}
  ): Promise<IConversionsPaginatedResponse> {
    const queryParams = new URLSearchParams({
      raw_product_id,
    });
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${CONVERSION_ENDPOINTS.GET_BY_RAW}?${queryParams.toString()}`;
    const response = await apiService.get(url);
    return response as IConversionsPaginatedResponse;
  },

  /**
   * Get conversions by finished product ID
   */
  async getConversionsByFinishedProduct(
    finished_product_id: string,
    params: IConversionQueryParams = {}
  ): Promise<IConversionsPaginatedResponse> {
    const queryParams = new URLSearchParams({
      finished_product_id,
    });
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${CONVERSION_ENDPOINTS.GET_BY_FINISHED}?${queryParams.toString()}`;
    const response = await apiService.get(url);
    return response as IConversionsPaginatedResponse;
  },

  /**
   * Get a specific conversion rule by ID
   */
  async getConversion(id: string): Promise<IConversionRule> {
    const response = await apiService.get(CONVERSION_ENDPOINTS.GET_ONE(id));
    return response as IConversionRule;
  },

  /**
   * Update a conversion rule
   */
  async updateConversion(
    id: string,
    data: Partial<IConversionRuleForm>
  ): Promise<IConversionRule> {
    const response = await apiService.put(CONVERSION_ENDPOINTS.UPDATE(id), data);
    return response as IConversionRule;
  },

  /**
   * Delete a conversion rule
   */
  async deleteConversion(id: string): Promise<{ message: string }> {
    const response = await apiService.delete(CONVERSION_ENDPOINTS.DELETE(id));
    return response as { message: string };
  },

  /**
   * Execute a conversion and update stock
   */
  async executeConversion(
    data: IConversionExecutionRequest
  ): Promise<IConversionExecutionResponse> {
    const response = await apiService.post(CONVERSION_ENDPOINTS.EXECUTE, data);
    return response as IConversionExecutionResponse;
  },

  /**
   * Get all conversion records with pagination
   */
  async getConversionRecords(
    params: IConversionQueryParams = {}
  ): Promise<IConversionRecordsPaginatedResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${CONVERSION_ENDPOINTS.GET_RECORDS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.get(url);
    return response as IConversionRecordsPaginatedResponse;
  },

  /**
   * Get a specific conversion record by ID
   */
  async getConversionRecord(recordId: string): Promise<IConversionRecord> {
    const response = await apiService.get(CONVERSION_ENDPOINTS.GET_RECORD(recordId));
    return response as IConversionRecord;
  },

  /**
   * Get conversion records by rule ID
   */
  async getConversionRecordsByRule(
    conversion_id: string,
    params: IConversionQueryParams = {}
  ): Promise<IConversionRecordsPaginatedResponse> {
    const queryParams = new URLSearchParams({
      conversion_id,
    });
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${CONVERSION_ENDPOINTS.GET_RECORDS_BY_RULE}?${queryParams.toString()}`;
    const response = await apiService.get(url);
    return response as IConversionRecordsPaginatedResponse;
  },

  /**
   * Get conversion records by date range
   */
  async getConversionRecordsByDateRange(
    from_date: string,
    to_date: string,
    params: IConversionQueryParams = {}
  ): Promise<IConversionRecordsPaginatedResponse> {
    const queryParams = new URLSearchParams({
      from_date,
      to_date,
    });
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${CONVERSION_ENDPOINTS.GET_RECORDS_BY_DATE_RANGE}?${queryParams.toString()}`;
    const response = await apiService.get(url);
    return response as IConversionRecordsPaginatedResponse;
  },
};
