import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";

export type ParsedAppraisal = {
  id: string;
  createdAt: string;
} & AppraisalResult;

export const parseAppraisalData = (data: any[]): ParsedAppraisal[] => {
  return data.map(item => {
    try {
      const formDataRaw = item.formData || {};
      const resultDataRaw = item.resultData || {};

      const infoBasica = formDataRaw.informacion_basica || formDataRaw;
      const finalFormData = {
        ...formDataRaw,
        ...infoBasica,
      };
      
      const finalResultData = resultDataRaw.result_data || resultDataRaw;

      const appraisalResult: AppraisalResult = {
        id: item.id,
        request_id: finalFormData.requestId || item.id,
        user_id: item.userId,
        created_at: item.createdAt,
        form_data: finalFormData,
        result_data: finalResultData,
        status: item.status,
      };

      return {
        createdAt: item.createdAt,
        ...appraisalResult,
      };
    } catch (e) {
      console.error("Error parsing data for item:", item.id, e);
      return null;
    }
  }).filter((item): item is ParsedAppraisal => item !== null);
};