/**
 * Dummy API Response Data for Attendance Wizard Form
 * Matches BACKEND_API_SPEC.md — Endpoint 7.5: GET /attendance/{attendanceId}/complete
 *
 * PURPOSE: This mock data simulates the backend response for the complete attendance
 * wizard form. When the real API is ready, replace the mock delay in attendanceService.ts
 * with actual apiClient.get() calls — no structural changes needed.
 */

import type { AttendanceFormResponse, AttendanceFormStep } from '../attendanceService';

// ---------------------------------------------------------------------------
// Step 1: OH&S Declaration — dummy data
// ---------------------------------------------------------------------------
const step1: AttendanceFormStep = {
  stepNumber: 1,
  title: 'OH&S Declaration',
  status: 'completed',
  completedAt: '2025-03-30T09:05:00Z',
  isValid: true,
  data: {
    allChecked: true,
    asbestosAcknowledged: true,
    checkedItems: [
      'I have read and understood the safety requirements',
      'I have the appropriate PPE',
      'Site hazards have been identified',
      'Emergency procedures are known',
      'First aid kit is accessible',
      'I am fit for work',
    ],
    acknowledgedBy: 'James Wilson',
    location: {
      latitude: -33.8748,
      longitude: 151.2131,
      accuracy: 4.5,
    },
  },
};

// ---------------------------------------------------------------------------
// Step 2: JSA Review — dummy data
// ---------------------------------------------------------------------------
const step2: AttendanceFormStep = {
  stepNumber: 2,
  title: 'JSA Review',
  status: 'completed',
  completedAt: '2025-03-30T09:08:00Z',
  isValid: true,
  data: {
    sopName: 'Water Extraction — Category 2',
    sopVersion: 'v2.1',
    technicianSignature: {
      url: 'https://storage.cwdsfield.com/signatures/sig_001.png',
      base64: 'dummy_base64_signature_jsa',
      signedAt: '2025-03-30T09:08:00Z',
    },
    hazardsReviewed: [
      {
        hazardId: 'haz_001',
        name: 'Slippery surfaces',
        riskLevel: 'High',
        controlMeasure: 'Wear non-slip footwear, cordon off area',
        residualRisk: 'Low',
      },
      {
        hazardId: 'haz_002',
        name: 'Asbestos containing materials',
        riskLevel: 'High',
        controlMeasure: 'P3 mask, disposable suit, HEPA vacuum',
        residualRisk: 'Medium',
      },
      {
        hazardId: 'haz_003',
        name: 'Electrical hazards',
        riskLevel: 'Medium',
        controlMeasure: 'RCD protected power, isolate wet circuits',
        residualRisk: 'Low',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Step 3: Arrival Check-in — dummy data
// ---------------------------------------------------------------------------
const step3: AttendanceFormStep = {
  stepNumber: 3,
  title: 'Arrival Check-in',
  status: 'completed',
  completedAt: '2025-03-30T09:12:00Z',
  isValid: true,
  data: {
    arrivalTime: '2025-03-30T09:10:00Z',
    scheduledTime: '09:00',
    onTime: true,
    minutesLate: 10,
    siteAccessible: true,
    immediateHazards: false,
    hazardNotes: '',
    clientPresent: true,
    clientName: 'John Smith',
    clientContact: '0412 345 678',
    weatherConditions: {
      temperature: 22,
      humidity: 65,
      conditions: 'clear',
    },
    location: {
      latitude: -33.8748,
      longitude: 151.2131,
      accuracy: 4.5,
    },
  },
};

// ---------------------------------------------------------------------------
// Step 4: Room Inspection — dummy data (most complex step)
// ---------------------------------------------------------------------------
const step4: AttendanceFormStep = {
  stepNumber: 4,
  title: 'Room Inspection',
  status: 'completed',
  completedAt: '2025-03-30T10:30:00Z',
  isValid: true,
  data: {
    rooms: [
      {
        id: 'r1',
        name: 'Kitchen',
        floor: 'Ground',
        status: 'inspected',
        inspectionStart: '2025-03-30T09:15:00Z',
        inspectionEnd: '2025-03-30T10:00:00Z',
        dimensions: {
          length: 5.2,
          width: 3.8,
          height: 2.4,
          unit: 'meters',
          totalArea: 19.76,
          totalVolume: 47.42,
        },
        overviewPhotos: [
          {
            id: 'photo_001',
            url: 'https://storage.cwdsfield.com/photos/photo_001.jpg',
            thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_001.jpg',
            type: 'overview',
            capturedAt: '2025-03-30T09:15:00Z',
            metadata: { width: 4032, height: 3024, camera: 'iPhone14,2' },
          },
          {
            id: 'photo_002',
            url: 'https://storage.cwdsfield.com/photos/photo_002.jpg',
            thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_002.jpg',
            type: 'overview',
            capturedAt: '2025-03-30T09:16:00Z',
            metadata: { width: 4032, height: 3024, camera: 'iPhone14,2' },
          },
        ],
        surfaces: {
          ceiling: {
            material: 'Plasterboard',
            affected: true,
            damagePercent: 35,
            peakMoisture: 85.5,
            dryStandard: 12.0,
            restorable: false,
            moisturePhoto: {
              id: 'photo_003',
              url: 'https://storage.cwdsfield.com/photos/photo_003.jpg',
            },
            nonRestorable: {
              reason: 'Structural sagging beyond 10mm tolerance',
              evidencePhoto: {
                id: 'photo_004',
                url: 'https://storage.cwdsfield.com/photos/photo_004.jpg',
              },
            },
          },
          walls: {
            material: 'Plasterboard',
            affected: true,
            damagePercent: 20,
            peakMoisture: 45.2,
            dryStandard: 12.0,
            restorable: true,
            moisturePhoto: {
              id: 'photo_005',
              url: 'https://storage.cwdsfield.com/photos/photo_005.jpg',
            },
          },
          flooring: {
            material: 'Ceramic Tiles',
            affected: false,
            peakMoisture: 15.0,
            dryStandard: 12.0,
            restorable: true,
          },
        },
        equipment: [
          {
            id: 'eq_001',
            type: 'dehumidifier',
            name: 'Phoenix 200 MAX',
            serialNumber: 'PH-2024-001',
            quantity: 2,
            capacity: '100L/day',
          },
          {
            id: 'eq_002',
            type: 'airmover',
            name: 'Dri-Eaz Ace',
            serialNumber: 'AE-2024-012',
            quantity: 3,
          },
        ],
        confirmationPhoto: {
          id: 'photo_007',
          url: 'https://storage.cwdsfield.com/photos/photo_007.jpg',
        },
        moistureMap: {
          basePhoto: {
            id: 'photo_001',
            url: 'https://storage.cwdsfield.com/photos/photo_001.jpg',
          },
          annotatedImage: {
            id: 'photo_008',
            url: 'https://storage.cwdsfield.com/photos/photo_008_marked.jpg',
          },
          drawnPaths: [
            {
              type: 'high_moisture',
              color: '#DC2626',
              points: [[120, 180], [280, 180], [280, 300], [120, 300]],
            },
          ],
        },
        notes: 'Ceiling shows significant water staining with active dripping.',
      },
      {
        id: 'r2',
        name: 'Hallway',
        floor: 'Ground',
        status: 'inspected',
        inspectionStart: '2025-03-30T10:00:00Z',
        inspectionEnd: '2025-03-30T10:15:00Z',
        dimensions: {
          length: 4.0,
          width: 1.5,
          height: 2.4,
          unit: 'meters',
          totalArea: 6.0,
          totalVolume: 14.4,
        },
        overviewPhotos: [
          {
            id: 'photo_009',
            url: 'https://storage.cwdsfield.com/photos/photo_009.jpg',
            thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_009.jpg',
            type: 'overview',
            capturedAt: '2025-03-30T10:00:00Z',
            metadata: { width: 4032, height: 3024, camera: 'iPhone14,2' },
          },
        ],
        surfaces: {
          ceiling: {
            material: 'Plasterboard',
            affected: false,
            peakMoisture: 10.0,
            dryStandard: 12.0,
            restorable: true,
          },
          walls: {
            material: 'Plasterboard',
            affected: true,
            damagePercent: 10,
            peakMoisture: 30.5,
            dryStandard: 12.0,
            restorable: true,
            moisturePhoto: {
              id: 'photo_010',
              url: 'https://storage.cwdsfield.com/photos/photo_010.jpg',
            },
          },
          flooring: {
            material: 'Carpet',
            affected: true,
            damagePercent: 60,
            peakMoisture: 72.0,
            dryStandard: 12.0,
            restorable: false,
            nonRestorable: {
              reason: 'Category 2 water — carpet must be replaced per IICRC S500',
              evidencePhoto: {
                id: 'photo_011',
                url: 'https://storage.cwdsfield.com/photos/photo_011.jpg',
              },
            },
          },
        },
        equipment: [
          {
            id: 'eq_003',
            type: 'airmover',
            name: 'Dri-Eaz Ace',
            serialNumber: 'AE-2024-015',
            quantity: 2,
          },
        ],
        confirmationPhoto: {
          id: 'photo_012',
          url: 'https://storage.cwdsfield.com/photos/photo_012.jpg',
        },
        notes: 'Carpet heavily saturated, removal recommended.',
      },
      {
        id: 'r3',
        name: 'Living Room',
        floor: 'Ground',
        status: 'inspected',
        inspectionStart: '2025-03-30T10:15:00Z',
        inspectionEnd: '2025-03-30T10:30:00Z',
        dimensions: {
          length: 6.5,
          width: 4.2,
          height: 2.4,
          unit: 'meters',
          totalArea: 27.3,
          totalVolume: 65.52,
        },
        overviewPhotos: [
          {
            id: 'photo_013',
            url: 'https://storage.cwdsfield.com/photos/photo_013.jpg',
            thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_013.jpg',
            type: 'overview',
            capturedAt: '2025-03-30T10:15:00Z',
            metadata: { width: 4032, height: 3024, camera: 'iPhone14,2' },
          },
        ],
        surfaces: {
          ceiling: {
            material: 'Plasterboard',
            affected: false,
            peakMoisture: 8.0,
            dryStandard: 12.0,
            restorable: true,
          },
          walls: {
            material: 'Plasterboard',
            affected: true,
            damagePercent: 5,
            peakMoisture: 22.0,
            dryStandard: 12.0,
            restorable: true,
          },
          flooring: {
            material: 'Timber',
            affected: true,
            damagePercent: 15,
            peakMoisture: 28.0,
            dryStandard: 12.0,
            restorable: true,
          },
        },
        equipment: [
          {
            id: 'eq_004',
            type: 'dehumidifier',
            name: 'Phoenix 200 MAX',
            serialNumber: 'PH-2024-003',
            quantity: 1,
          },
        ],
        confirmationPhoto: {
          id: 'photo_014',
          url: 'https://storage.cwdsfield.com/photos/photo_014.jpg',
        },
        notes: 'Minor water tracking along shared wall with hallway.',
      },
    ],
    totalRooms: 3,
    totalAreaInspected: 53.06,
    totalNonRestorableArea: 12.91,
  },
};

// ---------------------------------------------------------------------------
// Step 5: Consumables — dummy data
// ---------------------------------------------------------------------------
const step5: AttendanceFormStep = {
  stepNumber: 5,
  title: 'Consumables',
  status: 'completed',
  completedAt: '2025-03-30T10:35:00Z',
  isValid: true,
  data: {
    items: [
      { id: 'disposable_gloves', name: 'Disposable Gloves', quantity: 10, unit: 'pair', category: 'ppe' },
      { id: 'face_masks', name: 'P2 Face Masks', quantity: 5, unit: 'piece', category: 'ppe' },
      { id: 'rubbish_bags', name: 'Heavy Duty Rubbish Bags', quantity: 8, unit: 'bag', category: 'materials' },
      { id: 'cleaning_solution', name: 'Anti-Microbial Solution', quantity: 2, unit: 'L', category: 'chemicals' },
      { id: 'disinfectant', name: 'Hospital Grade Disinfectant', quantity: 1, unit: 'L', category: 'chemicals' },
      { id: 'mop_heads', name: 'Microfiber Mop Heads', quantity: 3, unit: 'piece', category: 'tools' },
      { id: 'paper_towels', name: 'Industrial Paper Towels', quantity: 6, unit: 'roll', category: 'materials' },
      { id: 'shoe_covers', name: 'Shoe Covers', quantity: 4, unit: 'pair', category: 'ppe' },
      { id: 'plastic_sheeting', name: 'Plastic Sheeting', quantity: 3, unit: 'm²', category: 'materials' },
      { id: 'other', name: 'Specialized anti-microbial spray', quantity: 1, unit: 'unit', category: 'chemicals', customDescription: 'Benzalkonium chloride solution' },
    ],
    totalItems: 43,
    totalCost: 198.60,
    currency: 'AUD',
  },
};

// ---------------------------------------------------------------------------
// Step 6: Form 2 Signing — dummy data
// ---------------------------------------------------------------------------
const step6: AttendanceFormStep = {
  stepNumber: 6,
  title: 'Form 2 Signing',
  status: 'completed',
  completedAt: '2025-03-30T10:40:00Z',
  isValid: true,
  data: {
    required: true,
    skipped: false,
    invasiveWorks: true,
    client: {
      name: 'John Smith',
      signature: {
        url: 'https://storage.cwdsfield.com/signatures/sig_client_001.png',
        base64: 'dummy_base64_signature_client',
        signedAt: '2025-03-30T10:40:00Z',
      },
    },
    technicianWitness: {
      name: 'James Wilson',
      id: 'tech_123',
      signature: {
        url: 'https://storage.cwdsfield.com/signatures/sig_tech_001.png',
        base64: 'dummy_base64_signature_tech_witness',
        signedAt: '2025-03-30T10:40:00Z',
      },
    },
    acknowledgments: [
      'Client acknowledges invasive works will be performed including wall cutting',
      'Client understands potential for dust and noise during works',
      'Client confirms building manager has granted access permission',
      'Client has been informed of asbestos risk and safety measures',
    ],
    generatedDocument: {
      id: 'form2_20250330_001',
      url: 'https://storage.cwdsfield.com/documents/form2_001.pdf',
      generatedAt: '2025-03-30T10:40:05Z',
      pages: 3,
    },
  },
};

// ---------------------------------------------------------------------------
// Step 7: Departure — dummy data
// ---------------------------------------------------------------------------
const step7: AttendanceFormStep = {
  stepNumber: 7,
  title: 'Departure',
  status: 'completed',
  completedAt: '2025-03-30T14:30:00Z',
  isValid: true,
  data: {
    arrivalTime: '2025-03-30T09:10:00Z',
    departureTime: '2025-03-30T14:30:00Z',
    totalHours: 5.33,
    billableHours: 5.0,
    siteClean: true,
    equipmentLeftOnsite: true,
    equipmentLeft: [
      { type: 'dehumidifier', quantity: 2, location: 'Kitchen center' },
      { type: 'airmover', quantity: 3, location: 'Kitchen walls' },
      { type: 'airmover', quantity: 2, location: 'Hallway' },
      { type: 'dehumidifier', quantity: 1, location: 'Living Room' },
    ],
    issuesOnDeparture: false,
    issueNotes: '',
    followUp: {
      required: true,
      nextVisitDate: '2025-03-31',
      nextVisitTime: '09:00',
      purpose: 'Check moisture readings, reposition equipment as needed',
      estimatedDuration: 120,
    },
    clientCommunication: {
      clientBriefed: true,
      briefingMethod: 'verbal_and_written',
      contactNumberConfirmed: '0412 345 678',
      emergencyContactProvided: true,
    },
  },
};

// ---------------------------------------------------------------------------
// Step 8: Review & Submit — dummy data
// ---------------------------------------------------------------------------
const step8: AttendanceFormStep = {
  stepNumber: 8,
  title: 'Review & Submit',
  status: 'completed',
  completedAt: '2025-03-30T14:35:00Z',
  isValid: true,
  data: {
    submitted: true,
    device: {
      platform: 'ios',
      osVersion: '16.0',
      appVersion: '2.1.0',
      model: 'iPhone14,2',
    },
    location: {
      latitude: -33.8748,
      longitude: 151.2131,
    },
    validationResults: {
      passed: true,
      errors: [],
    },
  },
};

// ---------------------------------------------------------------------------
// Complete Form Response — matches GET /attendance/{id}/complete
// ---------------------------------------------------------------------------
export const DUMMY_ATTENDANCE_FORM_COMPLETE: AttendanceFormResponse = {
  attendanceId: 'att_20250330_001',
  jobId: 'JOB-20250326-001',
  jobTitle: 'Water Damage Restoration — Unit 4',
  status: 'submitted',
  isDraft: false,
  isComplete: true,
  completedSteps: 8,
  totalSteps: 8,
  completionPercentage: 100,

  technician: {
    id: 'tech_123',
    name: 'James Wilson',
    email: 'james@cwds.com.au',
    phone: '0412 345 678',
    role: 'Senior Technician',
  },

  jobContext: {
    clientName: 'John Smith',
    clientPhone: '0412 345 678',
    address: '42 Harbour View Drive, Unit 4, Surry Hills NSW 2010',
    waterCategory: 2,
    waterClass: 2,
    buildingType: 'Strata',
    affectedRooms: ['Kitchen', 'Hallway', 'Living Room'],
    insuranceClaimNumber: 'CLM-2025-001234',
  },

  formData: {
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
  },

  summary: {
    arrivalTime: '09:10 AM',
    departureTime: '02:30 PM',
    totalHours: 5.33,
    billableHours: 5.0,
    roomsInspected: 3,
    totalAreaInspected: 53.06,
    photosCount: 14,
    equipmentInstalled: 8,
    consumablesUsed: 43,
    totalCost: 198.60,
    hasForm2: true,
    form2Signed: true,
  },

  photosGallery: {
    totalCount: 14,
    categories: {
      roomOverviews: [
        { id: 'photo_001', url: 'https://storage.cwdsfield.com/photos/photo_001.jpg', thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_001.jpg', room: 'Kitchen', type: 'overview', capturedAt: '2025-03-30T09:15:00Z' },
        { id: 'photo_009', url: 'https://storage.cwdsfield.com/photos/photo_009.jpg', thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_009.jpg', room: 'Hallway', type: 'overview', capturedAt: '2025-03-30T10:00:00Z' },
        { id: 'photo_013', url: 'https://storage.cwdsfield.com/photos/photo_013.jpg', thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_013.jpg', room: 'Living Room', type: 'overview', capturedAt: '2025-03-30T10:15:00Z' },
      ],
      moistureReadings: [
        { id: 'photo_003', url: 'https://storage.cwdsfield.com/photos/photo_003.jpg', thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_003.jpg', room: 'Kitchen', surface: 'ceiling', reading: 85.5 },
        { id: 'photo_005', url: 'https://storage.cwdsfield.com/photos/photo_005.jpg', thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_005.jpg', room: 'Kitchen', surface: 'walls', reading: 45.2 },
      ],
      equipment: [
        { id: 'photo_007', url: 'https://storage.cwdsfield.com/photos/photo_007.jpg', thumbnailUrl: 'https://storage.cwdsfield.com/photos/thumb_photo_007.jpg', type: 'equipment_confirmation' },
      ],
      signatures: [
        { id: 'sig_001', url: 'https://storage.cwdsfield.com/signatures/sig_001.png', type: 'technician' },
        { id: 'sig_client_001', url: 'https://storage.cwdsfield.com/signatures/sig_client_001.png', type: 'client' },
      ],
    },
  },

  validation: {
    isValid: true,
    errors: [],
    warnings: [],
    checkedAt: '2025-03-30T14:35:00Z',
  },

  review: {
    status: 'pending_review',
    submittedForReviewAt: '2025-03-30T14:35:00Z',
    reviewedBy: null,
    reviewedAt: null,
    rating: null,
    notes: null,
  },

  metadata: {
    createdAt: '2025-03-30T09:05:00Z',
    submittedAt: '2025-03-30T14:35:00Z',
    updatedAt: '2025-03-30T14:35:00Z',
    submittedBy: 'tech_123',
    schemaVersion: '2.1.0',
  },

  uiConfig: {
    editable: false,
    viewMode: 'review',
    canResume: false,
    showActions: ['export', 'print', 'clone'],
    activeStep: null,
    completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    pendingSteps: [],
    validationErrors: [],
  },
};

// ---------------------------------------------------------------------------
// Draft Form Response — for testing resume/edit flow
// ---------------------------------------------------------------------------
export const DUMMY_ATTENDANCE_FORM_DRAFT: AttendanceFormResponse = {
  attendanceId: 'att_20250330_002',
  jobId: 'JOB-20250326-002',
  jobTitle: 'Mold Remediation — Unit 12',
  status: 'draft',
  isDraft: true,
  isComplete: false,
  completedSteps: 3,
  totalSteps: 8,
  completionPercentage: 37.5,

  technician: {
    id: 'tech_123',
    name: 'James Wilson',
    email: 'james@cwds.com.au',
    phone: '0412 345 678',
    role: 'Senior Technician',
  },

  jobContext: {
    clientName: 'Sarah Davis',
    clientPhone: '0419 876 543',
    address: '15 Ocean Parade, Unit 12, Bondi NSW 2026',
    waterCategory: 3,
    waterClass: 3,
    buildingType: 'Strata',
    affectedRooms: ['Bathroom', 'Bedroom'],
  },

  formData: {
    step1: { ...step1, completedAt: '2025-03-30T08:00:00Z' },
    step2: { ...step2, completedAt: '2025-03-30T08:05:00Z' },
    step3: {
      ...step3,
      completedAt: '2025-03-30T08:10:00Z',
      data: {
        ...step3.data,
        arrivalTime: '2025-03-30T08:05:00Z',
        clientPresent: false,
        clientName: 'Sarah Davis',
      },
    },
    step4: { stepNumber: 4, title: 'Room Inspection', status: 'pending', completedAt: null, isValid: false, data: {} },
    step5: { stepNumber: 5, title: 'Consumables', status: 'pending', completedAt: null, isValid: false, data: {} },
    step6: { stepNumber: 6, title: 'Form 2 Signing', status: 'pending', completedAt: null, isValid: false, data: {} },
    step7: { stepNumber: 7, title: 'Departure', status: 'pending', completedAt: null, isValid: false, data: {} },
    step8: { stepNumber: 8, title: 'Review & Submit', status: 'pending', completedAt: null, isValid: false, data: {} },
  },

  summary: {
    arrivalTime: '08:05 AM',
    departureTime: '--',
    totalHours: 0,
    billableHours: 0,
    roomsInspected: 0,
    totalAreaInspected: 0,
    photosCount: 0,
    equipmentInstalled: 0,
    consumablesUsed: 0,
    totalCost: 0,
    hasForm2: false,
    form2Signed: false,
  },

  photosGallery: {
    totalCount: 0,
    categories: {
      roomOverviews: [],
      moistureReadings: [],
      equipment: [],
      signatures: [],
    },
  },

  validation: {
    isValid: false,
    errors: ['Room inspection not completed', 'Consumables not logged', 'Departure not recorded'],
    warnings: [],
    checkedAt: '2025-03-30T08:10:00Z',
  },

  review: {
    status: 'pending_review',
    submittedForReviewAt: null,
    reviewedBy: null,
    reviewedAt: null,
    rating: null,
    notes: null,
  },

  metadata: {
    createdAt: '2025-03-30T08:00:00Z',
    submittedAt: null,
    updatedAt: '2025-03-30T08:10:00Z',
    submittedBy: 'tech_123',
    schemaVersion: '2.1.0',
  },

  uiConfig: {
    editable: true,
    viewMode: 'edit',
    canResume: true,
    showActions: ['save_draft'],
    activeStep: 4,
    completedSteps: [1, 2, 3],
    pendingSteps: [4, 5, 6, 7, 8],
    validationErrors: [],
  },
};
