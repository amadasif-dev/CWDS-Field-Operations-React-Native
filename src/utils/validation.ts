export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};

export interface ValidationRule {
  validator: (value: string) => boolean;
  message: string;
}

export const validateField = (
  value: string,
  rules: ValidationRule[],
): string | null => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
};

export const validateAttendanceStep = (
  stepNumber: number,
  data: Record<string, unknown>,
): string[] => {
  const errors: string[] = [];

  switch (stepNumber) {
    case 1: // Job Confirmation
      if (!data.confirmed) {
        errors.push('You must confirm the job details');
      }
      if (!data.arrivalTime) {
        errors.push('Arrival time is required');
      }
      break;
    case 2: // Site Assessment
      if (!data.siteCondition) {
        errors.push('Site condition assessment is required');
      }
      if (!data.accessNotes) {
        errors.push('Access notes are required');
      }
      break;
    case 3: // Equipment Check
      if (!data.equipmentVerified) {
        errors.push('Equipment verification is required');
      }
      break;
    case 4: // Safety Checklist
      if (!data.safetyCompleted) {
        errors.push('Safety checklist must be completed');
      }
      break;
    case 5: // Work Documentation
      if (!data.workDescription) {
        errors.push('Work description is required');
      }
      break;
    case 6: // Photo Evidence
      if (!data.hasPhotos) {
        errors.push('At least one photo is required');
      }
      break;
    case 7: // Client Signature
      if (!data.hasSignature) {
        errors.push('Client signature is required');
      }
      break;
    case 8: // Summary
      break;
  }

  return errors;
};
