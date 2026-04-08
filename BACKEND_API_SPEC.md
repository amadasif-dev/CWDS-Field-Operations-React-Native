# CWDS Field App - Backend API Documentation

## Overview

This document provides comprehensive backend API specifications for the CWDS (Cleaning & Water Damage Services) Field Operations mobile application. The backend should follow RESTful principles and support the 8-step attendance wizard workflow.

---

## Base Configuration

```yaml
Base URL: https://api.cwdsfield.com/v1
Protocol: HTTPS
Content-Type: application/json
Authentication: Bearer Token (JWT)
Token Refresh: Automatic via /auth/refresh endpoint
```

---

## Authentication Endpoints

### 1. Login
```http
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "string",      // Required, valid email format
  "password": "string",   // Required, min 8 characters
  "deviceToken": "string" // Optional, for push notifications
}

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "role": "technician | supervisor | admin"
    },
    "token": "string",        // JWT access token, 24h expiry
    "refreshToken": "string"  // Refresh token, 30d expiry
  }
}

Response 401:
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 2. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "string"  // Required
}

Response 200:
{
  "success": true,
  "data": {
    "token": "string",
    "refreshToken": "string"
  }
}

Response 401:
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

### 3. Logout
```http
POST /auth/logout
Authorization: Bearer {token}

Request:
{
  "deviceToken": "string" // Optional, to clear push notifications
}

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Job Management Endpoints

### 4. List Jobs (Paginated)
```http
GET /jobs?page={page}&limit={limit}&status={status}&search={search}&sortBy={sortBy}&sortOrder={sortOrder}
Authorization: Bearer {token}

Query Parameters:
- page (number, optional): Page number, default 1
- limit (number, optional): Items per page, default 20, max 100
- status (string, optional): Filter by status - assigned | in_progress | completed | cancelled
- search (string, optional): Search in jobId, title, clientName, address
- sortBy (string, optional): Field to sort by - scheduledDate | priority | status | createdAt
- sortOrder (string, optional): asc | desc, default desc

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "JOB-20250326-001",
      "title": "Water Damage Restoration — Unit 4",
      "description": "Water damage restoration following burst pipe...",
      "status": "assigned | in_progress | completed | cancelled",
      "priority": "low | medium | high | urgent",
      "clientName": "John Smith",
      "clientPhone": "0412 345 678",
      "address": "42 Harbour View Drive, Unit 4, Surry Hills NSW 2010",
      "latitude": -33.8748,
      "longitude": 151.2131,
      "scheduledDate": "2025-03-30",
      "scheduledTime": "09:00",
      "estimatedDuration": 240, // minutes
      "assignedTo": "tech_123",
      "createdAt": "2025-03-28T08:00:00Z",
      "updatedAt": "2025-03-29T14:00:00Z",
      
      // Water Damage Specific Fields
      "waterDamageCause": "Burst pipe",
      "waterCategory": 2,  // 1 | 2 | 3
      "waterClass": 2,     // 1 | 2 | 3 | 4
      "buildingType": "Residential | Commercial | Strata",
      "affectedRooms": ["Kitchen", "Hallway", "Living Room"],
      "adminNotes": "Access via building manager...",
      
      // Relations
      "siteIntelligence": {
        "constructionYear": 1985,
        "asbestosRisk": true,
        "materials": ["Fibrous Cement", "Plasterboard"],
        "rooms": [
          { "id": "r1", "name": "Kitchen", "floor": "Ground", "status": "pending" }
        ],
        "hazards": ["Asbestos", "Slippery floors"]
      },
      "jsa": {
        "sopName": "Water Extraction — Category 2",
        "hazards": []
      },
      "scope": {
        "invasiveWorks": true,
        "description": "Remove affected carpet and underlay..."
      },
      "floorPlans": [
        {
          "id": "fp1",
          "uri": "https://storage.cwdsfield.com/floorplans/fp1.jpg",
          "label": "Unit 4 — Ground Floor",
          "unitId": "unit_4"
        }
      ],
      "referenceDocuments": [
        {
          "id": "doc1",
          "name": "Scope of Works — JOB-20250326-001.pdf",
          "uri": "https://storage.cwdsfield.com/docs/doc1.pdf",
          "type": "pdf"
        }
      ],
      "attendanceHistory": [
        {
          "id": "att_001",
          "date": "2025-03-28",
          "technicianName": "James Wilson",
          "arrivalTime": "09:15 AM",
          "departureTime": "01:45 PM",
          "status": "Submitted",
          "totalHours": 4.5
        }
      ],
      "attendanceStarted": false,
      "attendanceCompleted": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### 5. Get Job Detail
```http
GET /jobs/{jobId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { /* Same as job object from list, fully populated */ }
}

Response 404:
{
  "success": false,
  "message": "Job not found"
}
```

### 6. Update Job Status
```http
PATCH /jobs/{jobId}/status
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "status": "in_progress | completed | cancelled | on_hold",
  "reason": "string"  // Optional, required for cancellation
}

Response 200:
{
  "success": true,
  "data": { /* Updated job object */ }
}
```

---

## Attendance Wizard Endpoints

### 7. Submit Attendance (CRITICAL - 8-Step Wizard Submission)

**Endpoint Purpose:** This is the primary endpoint for submitting a completed attendance record after the technician has progressed through all 8 steps of the wizard. The payload structure mirrors the exact data collected during each step.

**Business Rules:**
- All 8 steps must be completed before submission (validation enforced)
- Room Inspection (Step 4) requires at least one room with complete data
- Form 2 Signing (Step 6) is conditionally required based on job.scope.invasiveWorks
- Departure time must be after arrival time
- Duplicate submissions for the same job on the same date are rejected

```http
POST /jobs/{jobId}/attendance
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "jobId": "JOB-20250326-001",
  
  // ===================================================================
  // STEPS ARRAY - Contains all 8 wizard steps with complete data
  // Reason: Each step represents a mandatory checkpoint in the attendance
  // workflow. The array structure allows the backend to validate completion
  // and store historical step progression for audit trails.
  // ===================================================================
  "steps": [
    
    // -------------------------------------------------------------------
    // STEP 1: OH&S Declaration
    // Purpose: Legal compliance and safety verification before work begins
    // Reason: Water damage sites often have hazards (asbestos, mold, 
    // structural damage). This step ensures technician acknowledges risks
    // and has proper PPE. Required for insurance and WHS compliance.
    // -------------------------------------------------------------------
    {
      "stepNumber": 1,
      "title": "OH&S Declaration",
      "isCompleted": true,           // Reason: Backend validation gate - must be true
      "completedAt": "2025-03-30T09:05:00Z",  // Reason: Audit trail timestamp
      
      "data": {
        // Reason: Individual checkbox tracking allows partial completion 
        // detection and specific missing item identification
        "allChecked": true,            // Reason: Master flag - all 6 items must be checked
        "asbestosAcknowledged": true,  // Reason: Critical for jobs with siteIntelligence.asbestosRisk
        
        // Reason: Array captures exactly which items were acknowledged,
        // allowing for future checklist modifications without schema changes
        "checkedItems": [
          "I have read and understood the safety requirements",
          "I have the appropriate PPE",
          "Site hazards have been identified",
          "Emergency procedures are known",
          "First aid kit is accessible",
          "I am fit for work"
        ],
        "acknowledgedBy": "James Wilson",  // Reason: Non-repudiation of acknowledgment
        "location": {                        // Reason: GPS verification of on-site acknowledgment
          "latitude": -33.8748,
          "longitude": 151.2131,
          "accuracy": 4.5
        }
      }
    },
    
    // -------------------------------------------------------------------
    // STEP 2: JSA Review (Job Safety Analysis)
    // Purpose: Job-specific hazard identification and control measures
    // Reason: Each job has unique hazards based on water category, building
    // type, and affected materials. The JSA must be reviewed and signed
    // before work commences. The signature creates a legal record.
    // -------------------------------------------------------------------
    {
      "stepNumber": 2,
      "title": "JSA Review",
      "isCompleted": true,
      "completedAt": "2025-03-30T09:08:00Z",
      "durationMinutes": 3,          // Reason: Time tracking for labor costing
      
      "data": {
        // Reason: Captures which SOP was reviewed for compliance verification
        "sopName": "Water Extraction — Category 2",
        "sopVersion": "v2.1",        // Reason: Ensures correct procedure version was followed
        "sopId": "sop_we_cat2_001",  // Reason: Reference to official SOP document
        
        // Reason: Base64 signature image required for legal compliance
        // and dispute resolution. Separate URL for quick display.
        "technicianSignature": {
          "base64": "base64encoded_signature_string...",
          "url": "https://storage.cwdsfield.com/signatures/sig_001.png",
          "signedAt": "2025-03-30T09:08:00Z",
          "ipAddress": "203.123.45.67"  // Reason: Non-repudiation
        },
        
        // Reason: Explicit hazard acknowledgment required by safety regulations
        "hazardsReviewed": [
          {
            "hazardId": "haz_001",
            "name": "Slippery surfaces",
            "riskLevel": "High",       // Reason: Risk matrix compliance
            "controlMeasure": "Wear non-slip footwear, cordon off area",
            "residualRisk": "Low"      // Reason: Post-mitigation risk tracking
          },
          {
            "hazardId": "haz_002",
            "name": "Asbestos containing materials",
            "riskLevel": "High",
            "controlMeasure": "P3 mask, disposable suit, HEPA vacuum",
            "residualRisk": "Medium"
          }
        ],
        "additionalHazardsNotes": ""   // Reason: Free-form hazard documentation
      }
    },
    
    // -------------------------------------------------------------------
    // STEP 3: Arrival Check-in
    // Purpose: Time tracking and site condition verification
    // Reason: Arrival time is the start of billable hours. Site accessibility
    // and immediate hazards must be documented for safety and scheduling.
    // Client presence confirmation affects communication protocols.
    // -------------------------------------------------------------------
    {
      "stepNumber": 3,
      "title": "Arrival Check-in",
      "isCompleted": true,
      "completedAt": "2025-03-30T09:12:00Z",
      "durationMinutes": 4,
      
      "data": {
        // Reason: ISO 8601 timestamp required for precise labor calculation
        // Used to calculate total hours and overtime eligibility
        "arrivalTime": "2025-03-30T09:10:00Z",
        "scheduledTime": "09:00",    // Reason: Used to calculate on-time performance
        "onTime": true,              // Reason: Performance metric for technician
        "minutesLate": 10,           // Reason: Records variance for reporting
        
        // Reason: If site not accessible, job cannot proceed - affects SLA
        "siteAccessible": true,
        "accessMethod": "building_manager", // Reason: Documents entry authorization
        "accessNotes": "Collected fob from reception",
        
        // Reason: Immediate hazard discovery requires stop-work authority
        "immediateHazards": false,
        "hazardNotes": "",           // Reason: Documents any hazard mitigation needed
        
        // Reason: Client presence affects communication and sign-off protocols
        "clientPresent": true,
        "clientName": "John Smith",  // Reason: Who authorized work start
        "clientContact": "0412 345 678",
        "alternativeContact": "Building Manager: 0419 876 543",
        
        // Reason: Weather can affect drying times and equipment placement
        "weatherConditions": {
          "temperature": 22,         // Celsius
          "humidity": 65,            // Percentage - affects drying calculations
          "conditions": "clear",     // rain | cloudy | clear
          "windSpeed": 10            // km/h - for ventilation planning
        },
        
        // Reason: GPS verification ensures technician was on-site
        "location": {
          "latitude": -33.8748,
          "longitude": 151.2131,
          "accuracy": 4.5,           // meters
          "address": "42 Harbour View Drive, Surry Hills NSW 2010"
        }
      }
    },
    
    // -------------------------------------------------------------------
    // STEP 4: Room Inspection (Complex Nested Data)
    // Purpose: Document damage extent, equipment placement, and drying plan
    // Reason: This is the core technical data for the restoration job. Each
    // room must be inspected for damage classification, equipment needs, and
    // restoration feasibility. Photo documentation is required for insurance.
    // -------------------------------------------------------------------
    {
      "stepNumber": 4,
      "title": "Room Inspection",
      "isCompleted": true,
      "completedAt": "2025-03-30T10:30:00Z",
      "durationMinutes": 78,         // Reason: Tracks inspection thoroughness
      
      "data": {
        // Reason: Array supports multiple rooms per job. Each room has
        // independent inspection data for damage classification.
        "rooms": [
          {
            "id": "r1",
            "name": "Kitchen",
            "floor": "Ground",
            "status": "inspected",   // Reason: Tracks room completion status
            
            // Reason: Inspection timing tracks efficiency and billing
            "inspectionStart": "2025-03-30T09:15:00Z",
            "inspectionEnd": "2025-03-30T10:20:00Z",
            
            // ============================================================
            // 4a. Room Overview Photos + Dimensions
            // Reason: Photos required for insurance claims and damage 
            // assessment. Dimensions needed for equipment sizing calculations.
            // ============================================================
            "overviewPhotos": [
              {
                "id": "photo_001",
                "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
                "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
                "type": "overview",    // Reason: Categorizes photo purpose
                "angle": "entry",      // Reason: Documents viewing perspective
                "capturedAt": "2025-03-30T09:15:00Z",
                "notes": "Wide shot showing overall water damage extent",
                "metadata": {
                  "width": 4032,
                  "height": 3024,
                  "fileSize": 2456789,
                  "format": "JPEG",
                  "hasGps": true,
                  "camera": "iPhone14,2"
                }
              }
            ],
            
            // Reason: Precise dimensions required for:
            // - Dehumidifier capacity calculations (L/day needed)
            // - Air mover quantity determination
            // - Drying time estimates (volume of air to process)
            "dimensions": {
              "length": 5.2,           // meters
              "width": 3.8,
              "height": 2.4,
              "unit": "meters",
              "totalArea": 19.76,      // sq meters - for material replacement
              "totalVolume": 47.42     // cubic meters - for air volume calc
            },
            
            // ============================================================
            // 4b. Surface Inspection
            // Purpose: Document moisture levels and restorability for each surface
            // Reason: Each surface (ceiling, walls, flooring) is assessed 
            // independently. Moisture readings determine drying strategy.
            // Non-restorable surfaces require replacement quotes.
            // ============================================================
            "surfaces": {
              "ceiling": {
                "material": "Plasterboard",
                "condition": "damaged",
                "affected": true,        // Reason: Determines if drying needed
                "damagePercent": 35,     // Reason: Affects restoration cost
                "affectedAreaSqm": 6.91, // Reason: Material replacement calc
                
                // Reason: Moisture readings determine:
                // - Equipment type and quantity needed
                // - Estimated drying time
                // - Whether surface is restorable
                "peakMoisture": 85.5,    // Reading at wettest point (%)
                "dryStandard": 12.0,     // Target moisture level (%)
                "moistureDelta": 73.5,   // Amount to dry (% points)
                "restorable": false,     // Reason: Determines repair vs replace
                
                // Reason: Photo evidence required for:
                // - Insurance claim validation
                // - Non-restorable item justification
                "moisturePhoto": {
                  "id": "photo_003",
                  "url": "https://storage.cwdsfield.com/photos/photo_003.jpg",
                  "reading": 85.5,
                  "device": "Delmhorst BD-2100",  // Calibration tracking
                  "location": "Center of ceiling, 1m from entry"
                },
                
                // Reason: Non-restorable documentation required for
                // insurance replacement authorization
                "nonRestorable": {
                  "reason": "Structural sagging beyond 10mm tolerance",
                  "evidencePhoto": {
                    "id": "photo_004",
                    "url": "https://storage.cwdsfield.com/photos/photo_004.jpg"
                  },
                  "estimatedReplacementCost": 450.00,
                  "currency": "AUD"
                },
                "dryingPlan": "Remove and replace - not restorable"
              },
              
              "walls": {
                "material": "Plasterboard",
                "condition": "affected",
                "affected": true,
                "damagePercent": 20,
                "affectedAreaSqm": 8.5,
                "peakMoisture": 45.2,
                "dryStandard": 12.0,
                "restorable": true,
                "moisturePhoto": {
                  "id": "photo_005",
                  "url": "https://storage.cwdsfield.com/photos/photo_005.jpg",
                  "reading": 45.2,
                  "location": "North wall, 1m from floor"
                },
                // Reason: Drying plan affects equipment placement
                "dryingPlan": "3 air movers directed at walls, monitor daily"
              },
              
              "flooring": {
                "material": "Ceramic Tiles",
                "condition": "good",
                "affected": false,
                "damagePercent": 0,
                "peakMoisture": 15.0,
                "dryStandard": 12.0,
                "restorable": true,
                "notes": "Grout lines show slight darkening but tiles are sound"
              }
            },
            
            // ============================================================
            // 4c. Equipment Installation
            // Purpose: Track equipment placed in room for drying
            // Reason: Equipment tracking required for:
            // - Rental billing (daily equipment charges)
            // - Asset tracking (serial numbers)
            // - Maintenance scheduling (usage hours)
            // - Retrieval at job completion
            // ============================================================
            "equipment": [
              {
                "id": "eq_001",
                "type": "dehumidifier",    // Reason: Equipment category
                "category": "drying",       // Reason: Functional grouping
                "name": "Phoenix 200 MAX",  // Reason: Specific model for capacity
                "serialNumber": "PH-2024-001", // Reason: Asset tracking
                "quantity": 2,
                "capacity": "100L/day",     // Reason: Drying capacity calc
                "placement": "Center of room, 2m apart",
                "settings": {              // Reason: Records configuration
                  "targetHumidity": 40,    // Percentage
                  "fanSpeed": "high",
                  "temperature": "ambient"
                },
                "installationPhoto": {
                  "id": "photo_006",
                  "url": "https://storage.cwdsfield.com/photos/photo_006.jpg"
                }
              },
              {
                "id": "eq_002",
                "type": "airmover",
                "category": "drying",
                "name": "Dri-Eaz Ace",
                "serialNumber": "AE-2024-012",
                "quantity": 3,
                "placement": "Aimed at ceiling (2) and walls (1)",
                "notes": "Snake configuration for optimal airflow"
              }
            ],
            "totalEquipment": 5,
            "confirmationPhoto": {         // Reason: Proof of installation
              "id": "photo_007",
              "url": "https://storage.cwdsfield.com/photos/photo_007.jpg",
              "capturedAt": "2025-03-30T10:15:00Z"
            },
            
            // ============================================================
            // 4d. Moisture Map Markup
            // Purpose: Visual documentation of moisture distribution
            // Reason: Moisture maps help technicians and adjusters understand
            // the full extent of water damage. Drawing annotations on room
            // photos creates clear visual communication.
            // ============================================================
            "moistureMap": {
              "basePhoto": {
                "id": "photo_001",
                "url": "https://storage.cwdsfield.com/photos/photo_001.jpg"
              },
              "annotatedImage": {
                "id": "photo_008",
                "url": "https://storage.cwdsfield.com/photos/photo_008_marked.jpg"
              },
              // Reason: Vector paths allow scalable rendering
              "drawnPaths": [
                {
                  "type": "high_moisture",
                  "color": "#DC2626",
                  "points": [[120, 180], [280, 180], [280, 300], [120, 300]],
                  "label": "High moisture zone (>60%)"
                },
                {
                  "type": "moderate_moisture",
                  "color": "#F59E0B",
                  "points": [[80, 140], [320, 140], [320, 340], [80, 340]],
                  "label": "Moderate moisture (30-60%)"
                }
              ],
              // Reason: Specific reading points with coordinates
              "readings": [
                { "x": 180, "y": 220, "value": 85.5, "surface": "ceiling" },
                { "x": 200, "y": 200, "value": 45.2, "surface": "wall" }
              ],
              "createdAt": "2025-03-30T10:18:00Z"
            },
            
            // Reason: Room-specific notes for follow-up and handover
            "notes": "Ceiling shows significant water staining with active dripping noted during inspection. Floor tiles are unaffected. East wall has minor water tracking.",
            "followUpRequired": true,
            "followUpNotes": "Return tomorrow to check moisture progression and adjust equipment"
          }
        ],
        
        // Reason: Summary counts for quick reference and validation
        "totalRooms": 3,
        "totalAreaInspected": 45.5,      // sq meters
        "totalNonRestorableArea": 6.91,  // sq meters
        "estimatedRestorationCost": 2850.00
      }
    },
    
    // -------------------------------------------------------------------
    // STEP 5: Consumables Log
    // Purpose: Track materials used for job costing and inventory
    // Reason: Consumables must be tracked for:
    // - Job costing and profitability analysis
    // - Inventory replenishment
    // - Client billing (if consumables charged separately)
    // - Tax reporting (business expenses)
    // -------------------------------------------------------------------
    {
      "stepNumber": 5,
      "title": "Consumables",
      "isCompleted": true,
      "completedAt": "2025-03-30T10:35:00Z",
      "durationMinutes": 5,
      
      "data": {
        // Reason: Object structure allows easy addition of new consumable types
        "items": [
          {
            "id": "disposable_gloves",
            "name": "Disposable Gloves",
            "quantity": 10,
            "unit": "pair",
            "unitCost": 0.50,          // Reason: Job costing
            "totalCost": 5.00,
            "category": "ppe",         // Reason: PPE vs materials vs tools
            "stockSource": "van_3"     // Reason: Inventory tracking
          },
          {
            "id": "face_masks",
            "name": "P2 Face Masks",
            "quantity": 5,
            "unit": "piece",
            "unitCost": 2.50,
            "totalCost": 12.50,
            "category": "ppe"
          },
          {
            "id": "rubbish_bags",
            "name": "Heavy Duty Rubbish Bags",
            "quantity": 8,
            "unit": "bag",
            "unitCost": 1.20,
            "totalCost": 9.60,
            "category": "materials"
          },
          {
            "id": "cleaning_solution",
            "name": "Anti-Microbial Solution",
            "quantity": 2,
            "unit": "L",
            "unitCost": 15.00,
            "totalCost": 30.00,
            "category": "chemicals"
          },
          {
            "id": "disinfectant",
            "name": "Hospital Grade Disinfectant",
            "quantity": 1,
            "unit": "L",
            "unitCost": 25.00,
            "totalCost": 25.00,
            "category": "chemicals"
          },
          {
            "id": "mop_heads",
            "name": "Microfiber Mop Heads",
            "quantity": 3,
            "unit": "piece",
            "unitCost": 8.00,
            "totalCost": 24.00,
            "category": "tools"
          },
          {
            "id": "paper_towels",
            "name": "Industrial Paper Towels",
            "quantity": 6,
            "unit": "roll",
            "unitCost": 4.50,
            "totalCost": 27.00,
            "category": "materials"
          },
          {
            "id": "other",
            "name": "Specialized anti-microbial spray",
            "quantity": 1,
            "unit": "unit",
            "unitCost": 35.00,
            "totalCost": 35.00,
            "category": "chemicals",
            "customDescription": "Benzalkonium chloride solution for Category 2 water"
          }
        ],
        "totalItems": 35,
        "totalCost": 168.10,
        "currency": "AUD",
        "source": "Company stock van #3", // Reason: Stock accountability
        "photos": []  // Reason: Optional photo evidence of usage
      }
    },
    
    // -------------------------------------------------------------------
    // STEP 6: Form 2 Signing (Conditional)
    // Purpose: Legal authorization for invasive/asbestos works
    // Reason: Form 2 is legally required in Australia for:
    // - Asbestos removal work
    // - Invasive works (demolition, cutting into walls)
    // Both client and technician signatures required for validity.
    // -------------------------------------------------------------------
    {
      "stepNumber": 6,
      "title": "Form 2 Signing",
      "isCompleted": true,
      "completedAt": "2025-03-30T10:40:00Z",
      "durationMinutes": 5,
      
      "data": {
        // Reason: Determines if Form 2 is required for this job
        "required": true,
        "skipped": false,
        
        // Reason: Links to job scope to determine requirement
        "invasiveWorks": true,
        "asbestosWork": true,        // Reason: Triggers specific asbestos protocols
        "formType": "Form 2 - Asbestos Removal / Invasive Works",
        "formVersion": "v2024.1",    // Reason: Legal document version tracking
        
        "client": {
          "name": "John Smith",
          "contact": "0412 345 678",
          "isOwner": true,           // Reason: Only owners can authorize
          "authorization": "Property owner",
          
          // Reason: Client signature legally authorizes work
          "signature": {
            "base64": "base64encoded...",
            "url": "https://storage.cwdsfield.com/signatures/sig_client_001.png",
            "signedAt": "2025-03-30T10:40:00Z",
            "ipAddress": "203.123.45.67",
            "location": {
              "latitude": -33.8748,
              "longitude": 151.2131
            }
          }
        },
        
        // Reason: Technician witness signature validates understanding
        "technicianWitness": {
          "name": "James Wilson",
          "id": "tech_123",
          "signature": {
            "url": "https://storage.cwdsfield.com/signatures/sig_tech_001.png",
            "signedAt": "2025-03-30T10:40:00Z"
          }
        },
        
        // Reason: Specific acknowledgments required by WHS regulations
        "acknowledgments": [
          "Client acknowledges invasive works will be performed including wall cutting",
          "Client understands potential for dust and noise during works",
          "Client confirms building manager has granted access permission",
          "Client has been informed of asbestos risk and safety measures",
          "Client understands 2-hour drying time before re-entry to treated areas"
        ],
        
        // Reason: Auto-generated PDF for legal record
        "generatedDocument": {
          "id": "form2_20250330_001",
          "url": "https://storage.cwdsfield.com/documents/form2_001.pdf",
          "generatedAt": "2025-03-30T10:40:05Z",
          "pages": 3,
          "includes": ["signatures", "acknowledgments", "job_details"]
        }
      }
    },
    
    // -------------------------------------------------------------------
    // STEP 7: Departure Time Capture
    // Purpose: End time tracking and site condition documentation
    // Reason: Departure time marks end of billable hours. Site condition
    // documentation protects against damage claims. Equipment left on-site
    // must be tracked for retrieval and billing.
    // -------------------------------------------------------------------
    {
      "stepNumber": 7,
      "title": "Departure",
      "isCompleted": true,
      "completedAt": "2025-03-30T14:30:00Z",
      "durationMinutes": 320,        // Total on-site time (5h 20m)
      
      "data": {
        // Reason: Precise timestamps for labor calculation
        "arrivalTime": "2025-03-30T09:10:00Z",
        "departureTime": "2025-03-30T14:30:00Z",
        "totalHours": 5.33,           // Calculated: (departure - arrival) in hours
        "totalMinutes": 320,
        "breakDuration": 30,          // Reason: Non-billable break time
        "billableHours": 5.0,         // Reason: Actual hours charged to client
        "overtimeHours": 0,           // Reason: Overtime calculation (>8hrs/day)
        
        // Reason: Site condition documentation for liability protection
        "siteConditions": {
          "siteClean": true,          // Reason: Confirms professional completion
          "wasteRemoved": true,
          "equipmentLeftOnsite": true,  // Reason: Ongoing drying equipment
          "equipmentSecure": true,
          "doorsLocked": true,
          "alarmsSet": true,
          "utilitiesStatus": "on"     // on | off | partial (equipment needs power)
        },
        
        // Reason: Equipment left on-site must be tracked
        "equipmentLeft": [
          {
            "type": "dehumidifier",
            "quantity": 2,
            "location": "Kitchen center",
            "expectedRemoval": "2025-04-02",
            "rentalDailyRate": 45.00
          },
          {
            "type": "airmover",
            "quantity": 3,
            "location": "Kitchen walls",
            "expectedRemoval": "2025-04-01",
            "rentalDailyRate": 15.00
          }
        ],
        
        // Reason: Issues must be documented for follow-up
        "issuesOnDeparture": false,
        "issueNotes": "",
        "damageDuringWork": false,
        "damageNotes": "",
        
        // Reason: Follow-up scheduling for multi-day jobs
        "followUp": {
          "required": true,
          "nextVisitDate": "2025-03-31",
          "nextVisitTime": "09:00",
          "purpose": "Check moisture readings, reposition equipment as needed",
          "estimatedDuration": 120,   // minutes
          "technicianAssigned": "tech_123"
        },
        
        // Reason: Client communication confirmation
        "clientCommunication": {
          "clientBriefed": true,
          "briefingMethod": "verbal_and_written",  // verbal | written | both
          "safetyInstructionsProvided": true,
          "contactNumberConfirmed": "0412 345 678",
          "emergencyContactProvided": true,
          "nextVisitConfirmed": true
        }
      }
    },
    
    // -------------------------------------------------------------------
    // STEP 8: Review & Submit
    // Purpose: Final validation and submission
    // Reason: Technician confirms all data is complete before final
    // submission. Device and location metadata provide audit trail.
    // -------------------------------------------------------------------
    {
      "stepNumber": 8,
      "title": "Review & Submit",
      "isCompleted": true,
      "completedAt": "2025-03-30T14:35:00Z",
      "durationMinutes": 5,
      
      "data": {
        "submitted": true,
        "submissionMethod": "mobile_app",  // mobile_app | web_portal | api
        
        // Reason: Device info for troubleshooting and compatibility
        "device": {
          "type": "mobile",
          "platform": "ios",           // ios | android
          "osVersion": "16.0",
          "appVersion": "2.1.0",
          "model": "iPhone14,2",
          "deviceId": "device_abc123"  // Reason: Unique device tracking
        },
        
        // Reason: Network info for sync troubleshooting
        "network": {
          "type": "wifi",            // wifi | cellular | offline
          "ssid": "CWDS_Field",
          "ipAddress": "203.123.45.67",
          "signalStrength": -45       // dBm - for connection quality
        },
        
        // Reason: GPS location proves technician was on-site at submission
        "location": {
          "latitude": -33.8748,
          "longitude": 151.2131,
          "accuracy": 5.2,             // meters
          "address": "42 Harbour View Drive, Surry Hills NSW 2010"
        },
        
        "submissionTimestamp": "2025-03-30T14:35:00Z",
        
        // Reason: Sync status for offline-first architecture
        "dataSyncStatus": "full_sync",   // full_sync | partial_sync | pending
        "attachmentsUploaded": 12,
        "attachmentsFailed": 0,
        "attachmentsPending": 0,
        
        // Reason: Validation results before submission
        "validationResults": {
          "passed": true,
          "warnings": [],            // Non-blocking issues
          "errors": []               // Blocking issues (should be empty)
        }
      }
    }
  ],
  
  // ===================================================================
  // SUMMARY DATA - Quick access fields for reporting and display
  // Reason: While all data is in steps array, these summary fields
  // allow efficient querying and display without parsing nested JSON.
  // ===================================================================
  
  // Reason: Flat array for efficient photo gallery queries
  "photos": [
    "https://storage.cwdsfield.com/photos/photo_001.jpg",
    "https://storage.cwdsfield.com/photos/photo_002.jpg"
  ],
  "photosCount": 12,
  
  // Reason: Summary object for quick statistics display
  "summary": {
    "arrivalTime": "09:10 AM",
    "departureTime": "02:30 PM",
    "totalHours": 5.33,
    "billableHours": 5.0,
    "roomsInspected": 3,
    "totalAreaInspected": 45.5,
    "photosCaptured": 12,
    "equipmentInstalled": 8,
    "equipmentLeftOnsite": 5,
    "consumablesUsed": 35,
    "consumablesCost": 168.10,
    "surfacesInspected": 9,
    "nonRestorableSurfaces": 1,
    "hasForm2": true,
    "form2Signed": true,
    "estimatedRestorationCost": 2850.00
  },
  
  // Reason: Aggregated consumables for inventory reporting
  "consumables": {
    "disposable_gloves": 10,
    "face_masks": 5,
    "rubbish_bags": 8,
    "cleaning_solution": 2,
    "disinfectant": 1,
    "mop_heads": 3,
    "paper_towels": 6,
    "other": 1
  },
  
  // Reason: Primary signature reference for quick access
  "technicianSignature": "base64encoded_signature_string",
  
  // Reason: Free-form notes for context not captured in structured data
  "notes": "Job completed successfully. Client briefed on drying process. Follow-up scheduled for tomorrow. All equipment left running and secure.",
  
  // ===================================================================
  // METADATA - System and audit information
  // Reason: Tracks submission context for compliance and debugging
  // ===================================================================
  "submittedAt": "2025-03-30T14:35:00Z",
  "submittedBy": "tech_123",
  "technicianName": "James Wilson",
  "deviceInfo": {
    "platform": "ios",
    "version": "16.0",
    "appVersion": "2.1.0"
  },
  "sourceIp": "203.123.45.67",
  "schemaVersion": "2.1.0"           // Reason: API versioning for compatibility
}

Response 201:
{
  "success": true,
  "data": {
    "id": "att_20250330_001",
    "jobId": "JOB-20250326-001",
    "status": "submitted",
    "technicianId": "tech_123",
    "technicianName": "James Wilson",
    "submittedAt": "2025-03-30T14:35:00Z",
    "arrivalTime": "09:10 AM",
    "departureTime": "02:30 PM",
    "totalHours": 5.33,
    "roomsInspected": 1,
    "photosCount": 6,
    "consumablesUsed": 35,
    "nextSteps": "Continue monitoring moisture levels tomorrow"
  }
}

Response 400:
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "step4.rooms": ["At least one room must be inspected"],
    "step6.clientSignature": ["Client signature required for invasive works"],
    "step7.departureTime": ["Departure time must be after arrival time"]
  }
}

Response 409:
{
  "success": false,
  "message": "Attendance already submitted for this date"
}
```

### 7.5. Get Attendance Wizard Complete Form (Retrieve Full Form Data)

**Endpoint Purpose:** Retrieve the complete attendance wizard form data for a specific job or attendance ID. This endpoint returns all 8 steps of the wizard with full details, enabling the UI to display, review, or edit a previously submitted or draft attendance record.

**Use Cases:**
- Display completed attendance details in the UI
- Resume/edit a draft attendance
- Admin/supervisor review of submitted attendance
- Generate reports with complete form data
- Audit and compliance verification

**Access Control:**
- Technicians: Can only access their own attendance records
- Supervisors/Admins: Can access all attendance records for their team/company

```http
GET /attendance/{attendanceId}/complete
# OR
GET /jobs/{jobId}/attendance/complete?date={date}
Authorization: Bearer {token}

Query Parameters (when using /jobs/{jobId}/attendance/complete):
- date (string, optional): ISO date string (YYYY-MM-DD) - retrieves attendance for specific date
  - If not provided, returns the most recent attendance for the job
- includeHistory (boolean, optional): If true, includes previous attendance records for the job
  - Default: false

Response 200:
{
  "success": true,
  "data": {
    // Core Identification
    "attendanceId": "att_20250330_001",
    "jobId": "JOB-20250326-001",
    "jobTitle": "Water Damage Restoration — Unit 4",
    
    // Form Status
    "status": "submitted | draft | approved | rejected | pending_review",
    "isDraft": false,
    "isComplete": true,
    "completedSteps": 8,
    "totalSteps": 8,
    "completionPercentage": 100,
    
    // Technician Info
    "technician": {
      "id": "tech_123",
      "name": "James Wilson",
      "email": "james@cwds.com.au",
      "phone": "0412 345 678",
      "role": "Senior Technician"
    },
    
    // Client/Job Context
    "jobContext": {
      "clientName": "John Smith",
      "clientPhone": "0412 345 678",
      "address": "42 Harbour View Drive, Unit 4, Surry Hills NSW 2010",
      "waterCategory": 2,
      "waterClass": 2,
      "buildingType": "Strata",
      "affectedRooms": ["Kitchen", "Hallway", "Living Room"],
      "insuranceClaimNumber": "CLM-2025-001234"
    },
    
    // ===================================================================
    // COMPLETE FORM DATA - All 8 Steps
    // This mirrors the exact structure used in POST /jobs/{jobId}/attendance
    // ===================================================================
    "formData": {
      
      // Step 1: OH&S Declaration
      "step1": {
        "stepNumber": 1,
        "title": "OH&S Declaration",
        "status": "completed",
        "completedAt": "2025-03-30T09:05:00Z",
        "isValid": true,
        "data": {
          "allChecked": true,
          "asbestosAcknowledged": true,
          "checkedItems": [
            "I have read and understood the safety requirements",
            "I have the appropriate PPE",
            "Site hazards have been identified",
            "Emergency procedures are known",
            "First aid kit is accessible",
            "I am fit for work"
          ],
          "acknowledgedBy": "James Wilson",
          "location": {
            "latitude": -33.8748,
            "longitude": 151.2131,
            "accuracy": 4.5
          }
        }
      },
      
      // Step 2: JSA Review
      "step2": {
        "stepNumber": 2,
        "title": "JSA Review",
        "status": "completed",
        "completedAt": "2025-03-30T09:08:00Z",
        "isValid": true,
        "data": {
          "sopName": "Water Extraction — Category 2",
          "sopVersion": "v2.1",
          "technicianSignature": {
            "url": "https://storage.cwdsfield.com/signatures/sig_001.png",
            "base64": "base64encoded...",
            "signedAt": "2025-03-30T09:08:00Z"
          },
          "hazardsReviewed": [
            {
              "hazardId": "haz_001",
              "name": "Slippery surfaces",
              "riskLevel": "High",
              "controlMeasure": "Wear non-slip footwear"
            }
          ]
        }
      },
      
      // Step 3: Arrival Check-in
      "step3": {
        "stepNumber": 3,
        "title": "Arrival Check-in",
        "status": "completed",
        "completedAt": "2025-03-30T09:12:00Z",
        "isValid": true,
        "data": {
          "arrivalTime": "2025-03-30T09:10:00Z",
          "scheduledTime": "09:00",
          "onTime": true,
          "minutesLate": 10,
          "siteAccessible": true,
          "immediateHazards": false,
          "clientPresent": true,
          "clientName": "John Smith",
          "weatherConditions": {
            "temperature": 22,
            "humidity": 65,
            "conditions": "clear"
          },
          "location": {
            "latitude": -33.8748,
            "longitude": 151.2131,
            "accuracy": 4.5
          }
        }
      },
      
      // Step 4: Room Inspection (Complete Data)
      "step4": {
        "stepNumber": 4,
        "title": "Room Inspection",
        "status": "completed",
        "completedAt": "2025-03-30T10:30:00Z",
        "isValid": true,
        "data": {
          "rooms": [
            {
              "id": "r1",
              "name": "Kitchen",
              "status": "inspected",
              "inspectionStart": "2025-03-30T09:15:00Z",
              "inspectionEnd": "2025-03-30T10:20:00Z",
              
              // Dimensions
              "dimensions": {
                "length": 5.2,
                "width": 3.8,
                "height": 2.4,
                "unit": "meters",
                "totalArea": 19.76,
                "totalVolume": 47.42
              },
              
              // Photos Array
              "overviewPhotos": [
                {
                  "id": "photo_001",
                  "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
                  "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
                  "type": "overview",
                  "capturedAt": "2025-03-30T09:15:00Z",
                  "metadata": {
                    "width": 4032,
                    "height": 3024,
                    "camera": "iPhone14,2"
                  }
                }
              ],
              
              // Surface Inspections
              "surfaces": {
                "ceiling": {
                  "material": "Plasterboard",
                  "affected": true,
                  "damagePercent": 35,
                  "peakMoisture": 85.5,
                  "dryStandard": 12.0,
                  "restorable": false,
                  "moisturePhoto": {
                    "id": "photo_003",
                    "url": "https://storage.cwdsfield.com/photos/photo_003.jpg"
                  },
                  "nonRestorable": {
                    "reason": "Structural sagging beyond 10mm tolerance",
                    "evidencePhoto": {
                      "id": "photo_004",
                      "url": "https://storage.cwdsfield.com/photos/photo_004.jpg"
                    }
                  }
                },
                "walls": {
                  "material": "Plasterboard",
                  "affected": true,
                  "damagePercent": 20,
                  "peakMoisture": 45.2,
                  "dryStandard": 12.0,
                  "restorable": true
                },
                "flooring": {
                  "material": "Ceramic Tiles",
                  "affected": false,
                  "peakMoisture": 15.0,
                  "restorable": true
                }
              },
              
              // Equipment
              "equipment": [
                {
                  "id": "eq_001",
                  "type": "dehumidifier",
                  "name": "Phoenix 200 MAX",
                  "serialNumber": "PH-2024-001",
                  "quantity": 2,
                  "capacity": "100L/day"
                }
              ],
              "confirmationPhoto": {
                "id": "photo_007",
                "url": "https://storage.cwdsfield.com/photos/photo_007.jpg"
              },
              
              // Moisture Map
              "moistureMap": {
                "basePhoto": {
                  "id": "photo_001",
                  "url": "https://storage.cwdsfield.com/photos/photo_001.jpg"
                },
                "annotatedImage": {
                  "id": "photo_008",
                  "url": "https://storage.cwdsfield.com/photos/photo_008_marked.jpg"
                },
                "drawnPaths": [
                  {
                    "type": "high_moisture",
                    "color": "#DC2626",
                    "points": [[120, 180], [280, 180], [280, 300], [120, 300]]
                  }
                ]
              },
              
              "notes": "Ceiling shows significant water staining"
            }
          ],
          "totalRooms": 1,
          "totalAreaInspected": 19.76
        }
      },
      
      // Step 5: Consumables
      "step5": {
        "stepNumber": 5,
        "title": "Consumables",
        "status": "completed",
        "completedAt": "2025-03-30T10:35:00Z",
        "isValid": true,
        "data": {
          "items": [
            {
              "id": "disposable_gloves",
              "name": "Disposable Gloves",
              "quantity": 10,
              "unit": "pair",
              "category": "ppe"
            },
            {
              "id": "face_masks",
              "name": "P2 Face Masks",
              "quantity": 5,
              "unit": "piece",
              "category": "ppe"
            }
          ],
          "totalItems": 15,
          "totalCost": 42.50
        }
      },
      
      // Step 6: Form 2 Signing
      "step6": {
        "stepNumber": 6,
        "title": "Form 2 Signing",
        "status": "completed",
        "completedAt": "2025-03-30T10:40:00Z",
        "isValid": true,
        "data": {
          "required": true,
          "skipped": false,
          "invasiveWorks": true,
          "client": {
            "name": "John Smith",
            "signature": {
              "url": "https://storage.cwdsfield.com/signatures/sig_client_001.png",
              "signedAt": "2025-03-30T10:40:00Z"
            }
          },
          "technicianWitness": {
            "name": "James Wilson",
            "signature": {
              "url": "https://storage.cwdsfield.com/signatures/sig_tech_001.png"
            }
          },
          "generatedDocument": {
            "id": "form2_20250330_001",
            "url": "https://storage.cwdsfield.com/documents/form2_001.pdf"
          }
        }
      },
      
      // Step 7: Departure
      "step7": {
        "stepNumber": 7,
        "title": "Departure",
        "status": "completed",
        "completedAt": "2025-03-30T14:30:00Z",
        "isValid": true,
        "data": {
          "arrivalTime": "2025-03-30T09:10:00Z",
          "departureTime": "2025-03-30T14:30:00Z",
          "totalHours": 5.33,
          "billableHours": 5.0,
          "siteClean": true,
          "equipmentLeftOnsite": true,
          "equipmentLeft": [
            {
              "type": "dehumidifier",
              "quantity": 2,
              "location": "Kitchen"
            }
          ],
          "followUp": {
            "required": true,
            "nextVisitDate": "2025-03-31",
            "nextVisitTime": "09:00"
          }
        }
      },
      
      // Step 8: Review & Submit
      "step8": {
        "stepNumber": 8,
        "title": "Review & Submit",
        "status": "completed",
        "completedAt": "2025-03-30T14:35:00Z",
        "isValid": true,
        "data": {
          "submitted": true,
          "device": {
            "platform": "ios",
            "osVersion": "16.0",
            "appVersion": "2.1.0",
            "model": "iPhone14,2"
          },
          "location": {
            "latitude": -33.8748,
            "longitude": 151.2131
          },
          "validationResults": {
            "passed": true,
            "errors": []
          }
        }
      }
    },
    
    // ===================================================================
    // SUMMARY STATISTICS
    // Quick reference data aggregated from formData
    // ===================================================================
    "summary": {
      "arrivalTime": "09:10 AM",
      "departureTime": "02:30 PM",
      "totalHours": 5.33,
      "billableHours": 5.0,
      "roomsInspected": 1,
      "totalAreaInspected": 19.76,
      "photosCount": 8,
      "equipmentInstalled": 2,
      "consumablesUsed": 15,
      "totalCost": 42.50,
      "hasForm2": true,
      "form2Signed": true
    },
    
    // ===================================================================
    // PHOTOS GALLERY
    // All photos from all steps, organized by category
    // ===================================================================
    "photosGallery": {
      "totalCount": 8,
      "categories": {
        "roomOverviews": [
          {
            "id": "photo_001",
            "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
            "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
            "room": "Kitchen",
            "type": "overview",
            "capturedAt": "2025-03-30T09:15:00Z"
          }
        ],
        "moistureReadings": [
          {
            "id": "photo_003",
            "url": "https://storage.cwdsfield.com/photos/photo_003.jpg",
            "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_003.jpg",
            "room": "Kitchen",
            "surface": "ceiling",
            "reading": 85.5
          }
        ],
        "equipment": [
          {
            "id": "photo_007",
            "url": "https://storage.cwdsfield.com/photos/photo_007.jpg",
            "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_007.jpg",
            "type": "equipment_confirmation"
          }
        ],
        "signatures": [
          {
            "id": "sig_001",
            "url": "https://storage.cwdsfield.com/signatures/sig_001.png",
            "type": "technician"
          }
        ]
      }
    },
    
    // ===================================================================
    // VALIDATION & REVIEW STATUS
    // For admin/supervisor review workflow
    // ===================================================================
    "validation": {
      "isValid": true,
      "errors": [],
      "warnings": [],
      "checkedAt": "2025-03-30T14:35:00Z"
    },
    
    "review": {
      "status": "pending_review",
      "submittedForReviewAt": "2025-03-30T14:35:00Z",
      "reviewedBy": null,
      "reviewedAt": null,
      "rating": null,
      "notes": null
    },
    
    // ===================================================================
    // METADATA
    // ===================================================================
    "metadata": {
      "createdAt": "2025-03-30T09:05:00Z",
      "submittedAt": "2025-03-30T14:35:00Z",
      "updatedAt": "2025-03-30T14:35:00Z",
      "submittedBy": "tech_123",
      "schemaVersion": "2.1.0",
      "sourceIp": "203.123.45.67"
    },
    
    // ===================================================================
    // UI CONFIGURATION
    // Hints for the frontend on how to display this form
    // ===================================================================
    "uiConfig": {
      "editable": false,
      "viewMode": "review",  // review | edit | readonly
      "canResume": false,
      "showActions": ["export", "print", "clone"],
      "activeStep": null,     // null when complete
      "completedSteps": [1, 2, 3, 4, 5, 6, 7, 8],
      "pendingSteps": [],
      "validationErrors": []
    }
  }
}

Response 404 (Attendance not found):
{
  "success": false,
  "message": "Attendance record not found",
  "code": "NOT_FOUND",
  "suggestions": [
    "Check the attendance ID is correct",
    "Verify you have permission to view this record",
    "Use GET /jobs/{jobId}/attendance/history to list available records"
  ]
}

Response 403 (Forbidden - not owner or admin):
{
  "success": false,
  "message": "You do not have permission to view this attendance record",
  "code": "FORBIDDEN"
}

Response 200 (Draft form - incomplete):
{
  "success": true,
  "data": {
    "attendanceId": "att_20250330_002",
    "jobId": "JOB-20250326-002",
    "status": "draft",
    "isDraft": true,
    "isComplete": false,
    "completedSteps": 3,
    "completionPercentage": 37.5,
    
    // Draft only has partial data
    "formData": {
      "step1": { /* complete */ },
      "step2": { /* complete */ },
      "step3": { /* complete */ },
      "step4": { /* partial - in progress */ },
      "step5": null,
      "step6": null,
      "step7": null,
      "step8": null
    },
    
    "uiConfig": {
      "editable": true,
      "viewMode": "edit",
      "canResume": true,
      "activeStep": 4,
      "completedSteps": [1, 2, 3],
      "pendingSteps": [4, 5, 6, 7, 8]
    }
  }
}
```

### 8. Save Draft (Local sync to backend)
```http
PUT /jobs/{jobId}/attendance/draft
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  // Same structure as submit, but all fields optional
  // This allows partial saves during the wizard
  "currentStep": 4,
  "stepData": { /* Partial step data */ },
  "photos": [ /* Photo URLs */ ],
  "rooms": [ /* Partial room data */ ],
  "consumables": { /* Partial consumables */ },
  "signature": "base64encoded",
  "savedAt": "2025-03-30T10:30:00Z"
}

Response 200:
{
  "success": true,
  "data": {
    "draftId": "draft_20250330_001",
    "jobId": "JOB-20250326-001",
    "lastSaved": "2025-03-30T10:30:00Z",
    "expiresAt": "2025-04-06T10:30:00Z"  // 7 day expiry
  }
}
```

### 9. Load Draft
```http
GET /jobs/{jobId}/attendance/draft
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { /* Same as draft save structure */ }
}

Response 404:
{
  "success": false,
  "message": "No draft found for this job"
}
```

---

## Photo Upload Endpoints

### 10. Upload Photo (Multipart)
```http
POST /jobs/{jobId}/photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request (FormData):
- photo: File (JPEG, PNG, max 10MB)
- metadata: JSON string
  {
    "roomId": "r1",
    "type": "overview | moisture_reading | equipment | non_restorable | moisture_map | other",
    "surface": "ceiling | walls | flooring",  // Optional, for moisture photos
    "notes": "string",
    "capturedAt": "2025-03-30T09:15:00Z"
  }

Response 201:
{
  "success": true,
  "data": {
    "id": "photo_001",
    "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
    "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
    "metadata": { /* Same as request */ },
    "uploadedAt": "2025-03-30T09:15:30Z"
  }
}
```

### 11. Upload Multiple Photos
```http
POST /jobs/{jobId}/photos/batch
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request (FormData):
- photos[]: Multiple files
- metadata: JSON array of metadata objects (matching each photo)

Response 201:
{
  "success": true,
  "data": [
    { /* Photo object */ },
    { /* Photo object */ }
  ],
  "failed": []  // Array of failed uploads with reasons
}
```

---

## Attendance History Endpoints

### 12. Get Attendance History for Job
```http
GET /jobs/{jobId}/attendance/history
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "att_001",
      "date": "2025-03-28",
      "technicianId": "tech_123",
      "technicianName": "James Wilson",
      "arrivalTime": "09:15 AM",
      "departureTime": "01:45 PM",
      "totalHours": 4.5,
      "status": "Submitted | Draft | Rejected",
      "roomsInspected": 3,
      "photosCount": 12,
      "summary": {
        "rooms": ["Kitchen", "Hallway", "Living Room"],
        "equipmentInstalled": 5,
        "consumablesUsed": 25
      }
    }
  ]
}
```

### 13. Get Attendance Detail
```http
GET /attendance/{attendanceId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": "att_20250330_001",
    "jobId": "JOB-20250326-001",
    "jobTitle": "Water Damage Restoration — Unit 4",
    "jobAddress": "42 Harbour View Drive, Unit 4, Surry Hills NSW 2010",
    "clientName": "John Smith",
    "clientPhone": "0412 345 678",
    
    "technician": {
      "id": "tech_123",
      "name": "James Wilson",
      "email": "james@cwds.com.au",
      "phone": "0412 345 678",
      "avatar": "https://storage.cwdsfield.com/avatars/tech_123.jpg"
    },
    
    "status": "Submitted | Approved | Rejected | Draft",
    "reviewStatus": {
      "isReviewed": true,
      "reviewedAt": "2025-03-30T16:00:00Z",
      "reviewedBy": "supervisor_001",
      "reviewerName": "Sarah Johnson",
      "notes": "Excellent documentation and thorough moisture readings",
      "rating": 5
    },
    
    // Complete Step Data (8-Step Wizard)
    "steps": [
      {
        "stepNumber": 1,
        "title": "OH&S Declaration",
        "isCompleted": true,
        "completedAt": "2025-03-30T09:05:00Z",
        "data": {
          "allChecked": true,
          "asbestosAcknowledged": true,
          "checkedItems": [
            "I have read and understood the safety requirements",
            "I have the appropriate PPE",
            "Site hazards have been identified",
            "Emergency procedures are known",
            "First aid kit is accessible",
            "I am fit for work"
          ]
        }
      },
      {
        "stepNumber": 2,
        "title": "JSA Review",
        "isCompleted": true,
        "completedAt": "2025-03-30T09:08:00Z",
        "data": {
          "technicianSignature": "https://storage.cwdsfield.com/signatures/sig_001.png",
          "signatureBase64": "base64encoded_string",
          "jsaSnapshot": "Water Extraction — Category 2",
          "hazardsReviewed": [
            { "name": "Slippery surfaces", "risk": "High", "control": "Wear non-slip footwear" },
            { "name": "Electrical hazards", "risk": "Medium", "control": "Inspect before use" }
          ]
        }
      },
      {
        "stepNumber": 3,
        "title": "Arrival Check-in",
        "isCompleted": true,
        "completedAt": "2025-03-30T09:12:00Z",
        "data": {
          "confirmed": true,
          "arrivalTime": "2025-03-30T09:10:00Z",
          "siteAccessible": true,
          "immediateHazards": false,
          "hazardNotes": "",
          "clientPresent": true,
          "clientName": "John Smith"
        }
      },
      {
        "stepNumber": 4,
        "title": "Room Inspection",
        "isCompleted": true,
        "completedAt": "2025-03-30T10:30:00Z",
        "data": {
          "rooms": [
            {
              "id": "r1",
              "name": "Kitchen",
              "status": "complete",
              "dimensions": {
                "length": 5.2,
                "width": 3.8,
                "height": 2.4,
                "unit": "meters",
                "totalVolume": 47.42
              },
              "overviewPhotos": [
                {
                  "id": "photo_001",
                  "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
                  "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
                  "type": "overview",
                  "capturedAt": "2025-03-30T09:15:00Z",
                  "metadata": {
                    "roomId": "r1",
                    "angle": "entry_view",
                    "notes": "Wide shot showing water damage extent"
                  }
                },
                {
                  "id": "photo_002",
                  "url": "https://storage.cwdsfield.com/photos/photo_002.jpg",
                  "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_002.jpg",
                  "type": "overview",
                  "capturedAt": "2025-03-30T09:16:00Z",
                  "metadata": {
                    "roomId": "r1",
                    "angle": "corner_view",
                    "notes": "Showing ceiling damage"
                  }
                }
              ],
              "surfaces": {
                "ceiling": {
                  "material": "Plasterboard",
                  "affected": true,
                  "damagePercent": 35,
                  "peakMoisture": 85.5,
                  "dryStandard": 12.0,
                  "restorable": false,
                  "moisturePhoto": {
                    "id": "photo_003",
                    "url": "https://storage.cwdsfield.com/photos/photo_003.jpg",
                    "reading": 85.5,
                    "location": "Center of ceiling"
                  },
                  "nonRestorableReason": "Structural sagging beyond 10mm",
                  "nonRestorableEvidence": {
                    "id": "photo_004",
                    "url": "https://storage.cwdsfield.com/photos/photo_004.jpg"
                  }
                },
                "walls": {
                  "material": "Plasterboard",
                  "affected": true,
                  "damagePercent": 20,
                  "peakMoisture": 45.2,
                  "dryStandard": 12.0,
                  "restorable": true,
                  "moisturePhoto": {
                    "id": "photo_005",
                    "url": "https://storage.cwdsfield.com/photos/photo_005.jpg",
                    "reading": 45.2,
                    "location": "North wall, 1m from floor"
                  }
                },
                "flooring": {
                  "material": "Ceramic Tiles",
                  "affected": false,
                  "damagePercent": 0,
                  "peakMoisture": 15.0,
                  "dryStandard": 12.0,
                  "restorable": true
                }
              },
              "equipment": [
                {
                  "id": "eq_dehumidifier_01",
                  "type": "dehumidifier",
                  "name": "Industrial Dehumidifier",
                  "quantity": 2,
                  "serialNumbers": ["DH-2024-001", "DH-2024-008"],
                  "placement": "Center of room, 2m apart"
                },
                {
                  "id": "eq_airmover_01",
                  "type": "airmover",
                  "name": "Air Mover",
                  "quantity": 3,
                  "serialNumbers": ["AM-2024-012", "AM-2024-015", "AM-2024-022"],
                  "placement": "Aimed at ceiling and walls"
                }
              ],
              "confirmationPhoto": {
                "id": "photo_006",
                "url": "https://storage.cwdsfield.com/photos/photo_006.jpg",
                "type": "equipment_confirmation",
                "capturedAt": "2025-03-30T10:15:00Z"
              },
              "moistureMap": {
                "basePhoto": {
                  "id": "photo_001",
                  "url": "https://storage.cwdsfield.com/photos/photo_001.jpg"
                },
                "drawnPaths": [
                  {
                    "type": "affected_area",
                    "points": [[100, 150], [200, 150], [200, 250], [100, 250]],
                    "color": "#FF0000",
                    "label": "High moisture zone (>60%)"
                  },
                  {
                    "type": "moderate_area",
                    "points": [[50, 100], [300, 100], [300, 300], [50, 300]],
                    "color": "#FFA500",
                    "label": "Moderate moisture (30-60%)"
                  }
                ],
                "savedImage": {
                  "id": "photo_007",
                  "url": "https://storage.cwdsfield.com/photos/photo_007_marked.jpg"
                },
                "annotations": [
                  { "x": 150, "y": 200, "label": "Reading: 85.5%" },
                  { "x": 175, "y": 175, "label": "Reading: 45.2%" }
                ]
              },
              "notes": "Ceiling shows significant water staining. Floor tiles are unaffected.",
              "completedAt": "2025-03-30T10:20:00Z"
            },
            {
              "id": "r2",
              "name": "Hallway",
              "status": "complete",
              // Similar detailed structure...
              "overviewPhotos": [],
              "surfaces": {},
              "equipment": [],
              "moistureMap": null
            },
            {
              "id": "r3",
              "name": "Living Room",
              "status": "complete",
              // Similar detailed structure...
            }
          ],
          "totalRoomsInspected": 3,
          "totalNonRestorableItems": 1,
          "totalEquipmentInstalled": 8
        }
      },
      {
        "stepNumber": 5,
        "title": "Consumables",
        "isCompleted": true,
        "completedAt": "2025-03-30T10:35:00Z",
        "data": {
          "consumables": {
            "disposable_gloves": { "quantity": 10, "unit": "pair" },
            "face_masks": { "quantity": 5, "unit": "piece" },
            "rubbish_bags": { "quantity": 8, "unit": "bag" },
            "cleaning_solution": { "quantity": 2, "unit": "L" },
            "disinfectant": { "quantity": 1, "unit": "L" },
            "mop_heads": { "quantity": 3, "unit": "piece" },
            "paper_towels": { "quantity": 6, "unit": "roll" },
            "other": { "quantity": 1, "unit": "unit", "description": "Specialized anti-microbial spray" }
          },
          "totalItems": 35,
          "notes": "All consumables from company stock"
        }
      },
      {
        "stepNumber": 6,
        "title": "Form 2 Signing",
        "isCompleted": true,
        "completedAt": "2025-03-30T10:40:00Z",
        "data": {
          "skipped": false,
          "invasiveWorks": true,
          "clientName": "John Smith",
          "clientSignature": "https://storage.cwdsfield.com/signatures/sig_client_001.png",
          "clientSignatureBase64": "base64encoded_string",
          "technicianWitnessSignature": "https://storage.cwdsfield.com/signatures/sig_tech_001.png",
          "form2DocumentId": "form2_20250330_001",
          "form2DocumentUrl": "https://storage.cwdsfield.com/documents/form2_001.pdf",
          "acknowledgments": [
            "Client acknowledges invasive works will be performed",
            "Client understands potential for dust and noise",
            "Client confirms access permissions"
          ]
        }
      },
      {
        "stepNumber": 7,
        "title": "Departure",
        "isCompleted": true,
        "completedAt": "2025-03-30T14:30:00Z",
        "data": {
          "confirmed": true,
          "departureTime": "2025-03-30T14:30:00Z",
          "arrivalTime": "2025-03-30T09:10:00Z",
          "totalHours": 5.33,
          "totalMinutes": 320,
          "issuesOnDeparture": false,
          "issueNotes": "",
          "siteClean": true,
          "equipmentLeftOnsite": true,
          "equipmentNotes": "4 dehumidifiers and 6 air movers left running",
          "nextVisitScheduled": "2025-03-31T09:00:00Z",
          "followUpRequired": true
        }
      },
      {
        "stepNumber": 8,
        "title": "Review & Submit",
        "isCompleted": true,
        "completedAt": "2025-03-30T14:35:00Z",
        "data": {
          "submitted": true,
          "submissionMethod": "mobile_app",
          "deviceInfo": {
            "platform": "ios",
            "version": "16.0",
            "appVersion": "2.1.0",
            "deviceModel": "iPhone14,2"
          },
          "ipAddress": "203.123.45.67",
          "submissionLocation": {
            "latitude": -33.8748,
            "longitude": 151.2131,
            "accuracy": 5.2
          }
        }
      }
    ],
    
    // Summary Data
    "summary": {
      "arrivalTime": "09:10 AM",
      "departureTime": "02:30 PM",
      "totalHours": 5.33,
      "roomsInspected": 3,
      "photosCaptured": 12,
      "equipmentInstalled": 8,
      "consumablesUsed": 35,
      "surfacesInspected": 9,
      "nonRestorableSurfaces": 1,
      "hasForm2": true
    },
    
    // All Photos Collection
    "allPhotos": [
      {
        "id": "photo_001",
        "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
        "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
        "type": "room_overview",
        "roomName": "Kitchen",
        "capturedAt": "2025-03-30T09:15:00Z",
        "metadata": {
          "camera": "iPhone14,2",
          "resolution": "4032x3024",
          "fileSize": 2456789
        }
      }
      // ... all other photos
    ],
    
    // Job Context
    "jobContext": {
      "jobType": "Water Damage Restoration",
      "waterCategory": 2,
      "waterClass": 2,
      "buildingType": "Strata",
      "insuranceClaimNumber": "CLM-2025-001234",
      "adjusterName": "Jane Anderson",
      "adjusterPhone": "0419 876 543"
    },
    
    // Metadata
    "createdAt": "2025-03-30T09:05:00Z",
    "submittedAt": "2025-03-30T14:35:00Z",
    "updatedAt": "2025-03-30T14:35:00Z",
    "createdBy": "tech_123",
    "updatedBy": "tech_123",
    "version": 1
  }
}

Response 404:
{
  "success": false,
  "message": "Attendance record not found",
  "code": "NOT_FOUND"
}

Response 403:
{
  "success": false,
  "message": "You do not have permission to view this attendance record",
  "code": "FORBIDDEN"
}
```

### 14. Get All Attendance Records for Technician (My Attendance History)
```http
GET /technicians/me/attendance?page={page}&limit={limit}&status={status}&sortBy={sortBy}&sortOrder={sortOrder}
Authorization: Bearer {token}

Query Parameters:
- page (number, optional): Page number, default 1
- limit (number, optional): Items per page, default 20, max 100
- status (string, optional): Filter by status - submitted | draft | rejected | approved
- sortBy (string, optional): Field to sort by - submittedAt | totalHours | createdAt
- sortOrder (string, optional): asc | desc, default desc

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "att_20250330_001",
      "jobId": "JOB-20250326-001",
      "jobTitle": "Water Damage Restoration — Unit 4",
      "jobAddress": "42 Harbour View Drive, Surry Hills NSW 2010",
      "clientName": "John Smith",
      "date": "2025-03-30",
      "status": "Submitted | Approved | Rejected | Draft",
      "arrivalTime": "09:10 AM",
      "departureTime": "02:30 PM",
      "totalHours": 5.33,
      "roomsInspected": 3,
      "photosCount": 12,
      "consumablesUsed": 35,
      "submittedAt": "2025-03-30T14:35:00Z",
      "reviewedAt": "2025-03-30T16:00:00Z",  // If reviewed by supervisor
      "reviewerName": "Sarah Johnson",      // Supervisor who reviewed
      "rejectionReason": null,              // If rejected
      "nextSteps": "Continue monitoring moisture levels tomorrow"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "summary": {
    "totalSubmitted": 156,
    "totalDrafts": 3,
    "totalHoursThisMonth": 145.5,
    "averageHoursPerAttendance": 4.2
  }
}

Response 401:
{
  "success": false,
  "message": "Authentication required"
}
```

### 15. Get Technician Progress Dashboard (Time Period Analytics)
```http
GET /technicians/me/dashboard?period={period}&startDate={startDate}&endDate={endDate}
Authorization: Bearer {token}

Query Parameters:
- period (string, required): Time period filter
  - "week" - Current week (Monday-Sunday)
  - "month" - Current month
  - "6months" - Last 6 months
  - "12months" - Last 12 months
  - "custom" - Custom date range (requires startDate and endDate)
- startDate (string, optional): ISO date string, required when period=custom
- endDate (string, optional): ISO date string, required when period=custom

Response 200:
{
  "success": true,
  "data": {
    "period": {
      "type": "month",
      "label": "March 2025",
      "startDate": "2025-03-01",
      "endDate": "2025-03-31"
    },
    
    // Summary Statistics
    "summary": {
      "totalJobs": 24,
      "completedJobs": 18,
      "inProgressJobs": 6,
      "totalAttendanceSubmitted": 45,
      "totalHoursWorked": 187.5,
      "averageHoursPerDay": 6.05,
      "totalRoomsInspected": 127,
      "totalPhotosCaptured": 342,
      "totalConsumablesUsed": 856
    },
    
    // Attendance Trend Chart Data
    "attendanceTrend": [
      {
        "date": "2025-03-01",
        "label": "Mar 1",
        "attendanceCount": 2,
        "hoursWorked": 8.5,
        "jobsCompleted": 1
      },
      {
        "date": "2025-03-02",
        "label": "Mar 2",
        "attendanceCount": 1,
        "hoursWorked": 4.0,
        "jobsCompleted": 0
      }
      // ... more data points
    ],
    
    // Job Type Breakdown
    "jobTypes": {
      "waterDamage": {
        "count": 18,
        "percentage": 75.0,
        "hours": 145.5,
        "label": "Water Damage"
      },
      "moldRemediation": {
        "count": 4,
        "percentage": 16.7,
        "hours": 32.0,
        "label": "Mold Remediation"
      },
      "fireRestoration": {
        "count": 2,
        "percentage": 8.3,
        "hours": 10.0,
        "label": "Fire Restoration"
      }
    },
    
    // Water Category Distribution
    "waterCategories": {
      "cat1": { "count": 8, "label": "Category 1 (Clean Water)" },
      "cat2": { "count": 12, "label": "Category 2 (Grey Water)" },
      "cat3": { "count": 4, "label": "Category 3 (Black Water)" }
    },
    
    // Top Consumables Used
    "topConsumables": [
      { "id": "disposable_gloves", "name": "Disposable Gloves", "quantity": 120, "unit": "pair" },
      { "id": "face_masks", "name": "Face Masks", "quantity": 85, "unit": "piece" },
      { "id": "rubbish_bags", "name": "Rubbish Bags", "quantity": 64, "unit": "bag" }
    ],
    
    // Performance Metrics
    "performance": {
      "onTimeArrivalRate": 96.5,  // Percentage
      "averageResponseTime": 12,   // Minutes from job assignment to first attendance
      "completionRate": 75.0,        // Jobs completed vs assigned
      "qualityScore": 4.7,          // Out of 5, based on supervisor ratings
      "clientSatisfaction": 4.8    // Out of 5, based on client feedback
    },
    
    // Recent Activity (Last 5 attendances)
    "recentActivity": [
      {
        "id": "att_20250330_001",
        "jobId": "JOB-20250326-001",
        "jobTitle": "Water Damage Restoration — Unit 4",
        "date": "2025-03-30",
        "hours": 5.33,
        "status": "Submitted",
        "thumbnailPhoto": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg"
      }
    ],
    
    // Comparison with Previous Period
    "comparison": {
      "vsPreviousPeriod": {
        "attendanceChange": +15.4,   // Percentage change
        "hoursChange": +12.8,
        "jobsChange": +8.3,
        "trend": "up | down | flat"
      }
    }
  }
}

Response 400:
{
  "success": false,
  "message": "Invalid period specified",
  "validPeriods": ["week", "month", "6months", "12months", "custom"]
}

Response 400 (Custom period missing dates):
{
  "success": false,
  "message": "startDate and endDate are required when period=custom"
}
```

### 16. Get Dashboard Comparison (Previous Periods)
```http
GET /technicians/me/dashboard/comparison?periods={periods}
Authorization: Bearer {token}

Query Parameters:
- periods (string, required): Comma-separated list of periods to compare
  - Example: "week,month,6months" or "month,last_month"

Response 200:
{
  "success": true,
  "data": {
    "comparison": [
      {
        "period": "This Week",
        "attendanceCount": 8,
        "hoursWorked": 42.5,
        "jobsCompleted": 5
      },
      {
        "period": "Last Week",
        "attendanceCount": 10,
        "hoursWorked": 48.0,
        "jobsCompleted": 6
      },
      {
        "period": "This Month",
        "attendanceCount": 35,
        "hoursWorked": 165.0,
        "jobsCompleted": 22
      }
    ]
  }
}
```

---

## Technician Profile Endpoints

### 14. Get Profile
```http
GET /technicians/me
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": "tech_123",
    "name": "James Wilson",
    "email": "james@cwds.com.au",
    "phone": "0412 345 678",
    "role": "technician",
    "avatar": "https://storage.cwdsfield.com/avatars/tech_123.jpg",
    "certifications": ["Water Damage Restoration", "Mold Remediation"],
    "signature": "base64encoded",  // Stored signature for Form 2
    "stats": {
      "jobsCompleted": 156,
      "attendanceSubmitted": 289,
      "averageRating": 4.8
    }
  }
}
```

### 15. Update Signature
```http
PUT /technicians/me/signature
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "signature": "base64encoded_signature",
  "capturedAt": "2025-03-30T10:00:00Z"
}

Response 200:
{
  "success": true,
  "data": {
    "signatureUpdated": true,
    "updatedAt": "2025-03-30T10:00:01Z"
  }
}
```

---

## Reference Data Endpoints

### 16. Get Water Damage Causes
```http
GET /reference/water-damage-causes
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    { "id": "burst_pipe", "name": "Burst pipe" },
    { "id": "leaking_roof", "name": "Leaking roof" },
    { "id": "overflow_bath", "name": "Overflowing bath/shower" },
    { "id": "overflow_toilet", "name": "Overflowing toilet" },
    { "id": "overflow_washing", "name": "Overflowing washing machine" },
    { "id": "overflow_dishwasher", "name": "Overflowing dishwasher" },
    { "id": "hot_water_failure", "name": "Hot water system failure" },
    { "id": "storm_damage", "name": "Storm damage" },
    { "id": "flash_flooding", "name": "Flash flooding" },
    { "id": "rising_damp", "name": "Rising damp" },
    { "id": "condensation", "name": "Condensation" },
    { "id": "fire_sprinkler", "name": "Fire suppression (sprinklers)" },
    { "id": "sewage_backup", "name": "Sewage backup" },
    { "id": "ac_leak", "name": "Air conditioning leak" },
    { "id": "fridge_leak", "name": "Refrigerator leak" },
    { "id": "aquarium", "name": "Aquarium/fish tank" },
    { "id": "subfloor_moisture", "name": "Subfloor moisture" },
    { "id": "unknown", "name": "Unknown origin" },
    { "id": "other", "name": "Other" }
  ]
}
```

### 17. Get Consumables List
```http
GET /reference/consumables
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    { "id": "disposable_gloves", "name": "Disposable Gloves", "unit": "pair" },
    { "id": "face_masks", "name": "Face Masks", "unit": "piece" },
    { "id": "safety_goggles", "name": "Safety Goggles", "unit": "piece" },
    { "id": "rubbish_bags", "name": "Rubbish Bags", "unit": "bag" },
    { "id": "cleaning_solution", "name": "Cleaning Solution", "unit": "L" },
    { "id": "disinfectant", "name": "Disinfectant", "unit": "L" },
    { "id": "deodorizer", "name": "Deodorizer", "unit": "L" },
    { "id": "mop_heads", "name": "Mop Heads", "unit": "piece" },
    { "id": "paper_towels", "name": "Paper Towels", "unit": "roll" },
    { "id": "microfiber_cloths", "name": "Microfiber Cloths", "unit": "piece" },
    { "id": "plastic_sheeting", "name": "Plastic Sheeting", "unit": "m²" },
    { "id": "tape", "name": "Tape (Masking/Duct)", "unit": "roll" },
    { "id": "zip_ties", "name": "Zip Ties", "unit": "piece" },
    { "id": "extension_cords", "name": "Extension Cords", "unit": "piece" },
    { "id": "power_boards", "name": "Power Boards", "unit": "piece" },
    { "id": "air_fresheners", "name": "Air Fresheners", "unit": "piece" },
    { "id": "hand_sanitizer", "name": "Hand Sanitizer", "unit": "bottle" },
    { "id": "wipes", "name": "Wipes", "unit": "pack" },
    { "id": "shoe_covers", "name": "Shoe Covers", "unit": "pair" },
    { "id": "coveralls", "name": "Coveralls", "unit": "piece" },
    { "id": "caution_tape", "name": "Caution Tape", "unit": "roll" },
    { "id": "other", "name": "Other", "unit": "unit" }
  ]
}
```

---

## Admin Dashboard Endpoints

### 17. Get Single Attendance Detail (Admin View)
```http
GET /admin/attendance/{attendanceId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    // Core Attendance Info
    "id": "att_20250330_001",
    "status": "Submitted | Approved | Rejected | Draft | Pending Review",
    
    // Complete Technician Info
    "technician": {
      "id": "tech_123",
      "employeeId": "EMP-2024-089",
      "name": "James Wilson",
      "email": "james@cwds.com.au",
      "phone": "0412 345 678",
      "avatar": "https://storage.cwdsfield.com/avatars/tech_123.jpg",
      "role": "Senior Technician",
      "department": "Water Damage Team",
      "hireDate": "2022-03-15",
      "certifications": [
        { "name": "Water Damage Restoration", "expires": "2026-05-20" },
        { "name": "Mold Remediation", "expires": "2025-11-10" }
      ],
      "stats": {
        "totalJobs": 234,
        "attendanceSubmitted": 567,
        "averageRating": 4.7,
        "onTimeRate": 95.5
      }
    },
    
    // Complete Job Info
    "job": {
      "id": "JOB-20250326-001",
      "title": "Water Damage Restoration — Unit 4",
      "description": "Water damage restoration following burst pipe in kitchen",
      "client": {
        "id": "client_456",
        "name": "John Smith",
        "phone": "0412 345 678",
        "email": "john.smith@email.com",
        "address": "42 Harbour View Drive, Unit 4, Surry Hills NSW 2010",
        "insurance": {
          "provider": "ABC Insurance",
          "claimNumber": "CLM-2025-001234",
          "adjusterName": "Jane Anderson",
          "adjusterPhone": "0419 876 543",
          "policyNumber": "POL-2024-789456"
        }
      },
      "status": "in_progress",
      "priority": "high",
      "scheduledDate": "2025-03-30",
      "scheduledTime": "09:00",
      "estimatedDuration": 240,
      
      // Water Damage Specific
      "waterDamage": {
        "cause": "Burst pipe",
        "category": 2,
        "categoryLabel": "Category 2 (Grey Water)",
        "class": 2,
        "classLabel": "Class 2 (Significant)",
        "buildingType": "Strata",
        "affectedRooms": ["Kitchen", "Hallway", "Living Room", "Bathroom"],
        "estimatedLoss": 15000.00,
        "currency": "AUD"
      },
      
      // Job Metadata
      "createdAt": "2025-03-26T08:00:00Z",
      "assignedAt": "2025-03-26T10:30:00Z",
      "siteIntelligence": {
        "asbestosRisk": true,
        "constructionYear": 1985,
        "materials": ["Fibrous Cement", "Plasterboard"],
        "hazards": ["Asbestos present", "Slippery surfaces"]
      },
      "scope": {
        "invasiveWorks": true,
        "description": "Remove affected carpet and underlay. Cut plasterboard 300mm above waterline.",
        "specialInstructions": "Access via building manager — collect fob from reception"
      }
    },
    
    // Complete Step-by-Step Data
    "steps": [
      {
        "stepNumber": 1,
        "title": "OH&S Declaration",
        "status": "completed",
        "completedAt": "2025-03-30T09:05:00Z",
        "duration": 5,  // minutes spent
        "data": {
          "allChecked": true,
          "asbestosAcknowledged": true,
          "checkedItems": [
            "I have read and understood the safety requirements",
            "I have the appropriate PPE",
            "Site hazards have been identified",
            "Emergency procedures are known",
            "First aid kit is accessible",
            "I am fit for work"
          ],
          "acknowledgedBy": "James Wilson"
        }
      },
      {
        "stepNumber": 2,
        "title": "JSA Review",
        "status": "completed",
        "completedAt": "2025-03-30T09:08:00Z",
        "duration": 3,
        "data": {
          "sopName": "Water Extraction — Category 2",
          "technicianSignature": {
            "url": "https://storage.cwdsfield.com/signatures/sig_001.png",
            "base64": "base64encoded_string...",
            "signedAt": "2025-03-30T09:08:00Z"
          },
          "hazardsIdentified": [
            { "name": "Slippery surfaces", "riskLevel": "High", "control": "Non-slip footwear" },
            { "name": "Asbestos", "riskLevel": "High", "control": "P3 mask, disposable suit" },
            { "name": "Electrical", "riskLevel": "Medium", "control": "RCD protected power" }
          ]
        }
      },
      {
        "stepNumber": 3,
        "title": "Arrival Check-in",
        "status": "completed",
        "completedAt": "2025-03-30T09:12:00Z",
        "duration": 4,
        "data": {
          "arrivalTime": "2025-03-30T09:10:00Z",
          "scheduledTime": "09:00",
          "onTime": true,
          "minutesLate": 0,
          "siteAccessible": true,
          "immediateHazards": false,
          "hazardNotes": "",
          "clientPresent": true,
          "clientName": "John Smith",
          "weatherConditions": "Clear, 22°C",
          "location": {
            "latitude": -33.8748,
            "longitude": 151.2131,
            "accuracy": 4.5
          }
        }
      },
      {
        "stepNumber": 4,
        "title": "Room Inspection",
        "status": "completed",
        "completedAt": "2025-03-30T10:30:00Z",
        "duration": 78,
        "data": {
          "rooms": [
            {
              "id": "r1",
              "name": "Kitchen",
              "floor": "Ground",
              "status": "inspected",
              "inspectionStart": "2025-03-30T09:15:00Z",
              "inspectionEnd": "2025-03-30T10:20:00Z",
              
              // Room Dimensions
              "dimensions": {
                "length": 5.2,
                "width": 3.8,
                "height": 2.4,
                "unit": "meters",
                "totalArea": 19.76,
                "totalVolume": 47.42
              },
              
              // Overview Photos
              "overviewPhotos": [
                {
                  "id": "photo_001",
                  "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
                  "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
                  "type": "overview",
                  "angle": "entry",
                  "capturedAt": "2025-03-30T09:15:00Z",
                  "notes": "Entry view showing overall damage",
                  "metadata": {
                    "camera": "iPhone14,2",
                    "resolution": "4032x3024",
                    "fileSize": 2456789,
                    "hasGps": true
                  }
                }
              ],
              
              // Surface Inspection
              "surfaces": {
                "ceiling": {
                  "material": "Plasterboard",
                  "condition": "damaged",
                  "affected": true,
                  "damagePercent": 35,
                  "affectedAreaSqm": 6.91,
                  "peakMoisture": 85.5,
                  "dryStandard": 12.0,
                  "moistureDelta": 73.5,
                  "restorable": false,
                  "moisturePhoto": {
                    "id": "photo_003",
                    "url": "https://storage.cwdsfield.com/photos/photo_003.jpg",
                    "reading": 85.5,
                    "location": "Center of ceiling",
                    "device": "Delmhorst BD-2100"
                  },
                  "nonRestorable": {
                    "reason": "Structural sagging beyond 10mm tolerance",
                    "evidencePhoto": {
                      "id": "photo_004",
                      "url": "https://storage.cwdsfield.com/photos/photo_004.jpg"
                    },
                    "estimatedReplacementCost": 450.00
                  }
                },
                "walls": {
                  "material": "Plasterboard",
                  "condition": "affected",
                  "affected": true,
                  "damagePercent": 20,
                  "affectedAreaSqm": 8.5,
                  "peakMoisture": 45.2,
                  "dryStandard": 12.0,
                  "restorable": true,
                  "moisturePhoto": {
                    "id": "photo_005",
                    "url": "https://storage.cwdsfield.com/photos/photo_005.jpg",
                    "reading": 45.2,
                    "location": "North wall, 1m from floor"
                  },
                  "dryingPlan": "Air movers directed at walls, monitor daily"
                },
                "flooring": {
                  "material": "Ceramic Tiles",
                  "condition": "good",
                  "affected": false,
                  "peakMoisture": 15.0,
                  "dryStandard": 12.0,
                  "restorable": true,
                  "notes": "Grout lines show slight darkening but tiles are sound"
                }
              },
              
              // Equipment Installed
              "equipment": [
                {
                  "id": "eq_001",
                  "type": "dehumidifier",
                  "category": "drying",
                  "name": "Phoenix 200 MAX",
                  "serialNumber": "PH-2024-001",
                  "quantity": 2,
                  "capacity": "100L/day",
                  "placement": "Center of room, 2m apart",
                  "settings": {
                    "targetHumidity": 40,
                    "fanSpeed": "high"
                  },
                  "installationPhoto": {
                    "id": "photo_006",
                    "url": "https://storage.cwdsfield.com/photos/photo_006.jpg"
                  }
                },
                {
                  "id": "eq_002",
                  "type": "airmover",
                  "category": "drying",
                  "name": "Dri-Eaz Ace",
                  "serialNumber": "AE-2024-012",
                  "quantity": 3,
                  "placement": "Aimed at ceiling and walls",
                  "notes": "Snake configuration for optimal airflow"
                }
              ],
              "totalEquipment": 5,
              "confirmationPhoto": {
                "id": "photo_007",
                "url": "https://storage.cwdsfield.com/photos/photo_007.jpg",
                "capturedAt": "2025-03-30T10:15:00Z"
              },
              
              // Moisture Map
              "moistureMap": {
                "basePhoto": {
                  "id": "photo_001",
                  "url": "https://storage.cwdsfield.com/photos/photo_001.jpg"
                },
                "annotatedImage": {
                  "id": "photo_008",
                  "url": "https://storage.cwdsfield.com/photos/photo_008_marked.jpg"
                },
                "drawnPaths": [
                  {
                    "type": "high_moisture",
                    "color": "#DC2626",
                    "points": [[120, 180], [280, 180], [280, 300], [120, 300]],
                    "label": "High moisture (>60%)"
                  },
                  {
                    "type": "moderate_moisture",
                    "color": "#F59E0B",
                    "points": [[80, 140], [320, 140], [320, 340], [80, 340]],
                    "label": "Moderate (30-60%)"
                  }
                ],
                "readings": [
                  { "x": 180, "y": 220, "value": 85.5, "surface": "ceiling" },
                  { "x": 200, "y": 200, "value": 45.2, "surface": "wall" }
                ],
                "createdAt": "2025-03-30T10:18:00Z"
              },
              
              // Room Notes
              "notes": "Ceiling shows significant water staining with active dripping noted during inspection. Floor tiles are unaffected. East wall has minor water tracking.",
              "followUpRequired": true,
              "followUpNotes": "Return tomorrow to check moisture progression"
            }
          ],
          "totalRooms": 3,
          "totalAreaInspected": 45.5,
          "totalNonRestorableArea": 6.91,
          "estimatedRestorationCost": 2850.00
        }
      },
      {
        "stepNumber": 5,
        "title": "Consumables",
        "status": "completed",
        "completedAt": "2025-03-30T10:35:00Z",
        "duration": 5,
        "data": {
          "items": [
            { "id": "disposable_gloves", "name": "Disposable Gloves", "quantity": 10, "unit": "pair", "unitCost": 0.50, "totalCost": 5.00 },
            { "id": "face_masks", "name": "P2 Face Masks", "quantity": 5, "unit": "piece", "unitCost": 2.50, "totalCost": 12.50 },
            { "id": "rubbish_bags", "name": "Heavy Duty Rubbish Bags", "quantity": 8, "unit": "bag", "unitCost": 1.20, "totalCost": 9.60 },
            { "id": "cleaning_solution", "name": "Anti-Microbial Solution", "quantity": 2, "unit": "L", "unitCost": 15.00, "totalCost": 30.00 },
            { "id": "disinfectant", "name": "Hospital Grade Disinfectant", "quantity": 1, "unit": "L", "unitCost": 25.00, "totalCost": 25.00 },
            { "id": "mop_heads", "name": "Microfiber Mop Heads", "quantity": 3, "unit": "piece", "unitCost": 8.00, "totalCost": 24.00 },
            { "id": "paper_towels", "name": "Industrial Paper Towels", "quantity": 6, "unit": "roll", "unitCost": 4.50, "totalCost": 27.00 },
            { "id": "other", "name": "Specialized anti-microbial spray", "quantity": 1, "unit": "unit", "unitCost": 35.00, "totalCost": 35.00 }
          ],
          "totalItems": 35,
          "totalCost": 168.10,
          "source": "Company stock van #3",
          "photos": []
        }
      },
      {
        "stepNumber": 6,
        "title": "Form 2 Signing",
        "status": "completed",
        "completedAt": "2025-03-30T10:40:00Z",
        "duration": 5,
        "data": {
          "required": true,
          "invasiveWorks": true,
          "formType": "Form 2 - Asbestos Removal / Invasive Works",
          "client": {
            "name": "John Smith",
            "signature": {
              "url": "https://storage.cwdsfield.com/signatures/sig_client_001.png",
              "base64": "base64encoded...",
              "signedAt": "2025-03-30T10:40:00Z",
              "ipAddress": "203.123.45.67"
            }
          },
          "technicianWitness": {
            "name": "James Wilson",
            "id": "tech_123",
            "signature": {
              "url": "https://storage.cwdsfield.com/signatures/sig_tech_001.png",
              "signedAt": "2025-03-30T10:40:00Z"
            }
          },
          "acknowledgments": [
            "Client acknowledges invasive works will be performed",
            "Client understands potential for dust and noise",
            "Client confirms building manager has granted access",
            "Client has been informed of asbestos risk"
          ],
          "generatedDocument": {
            "id": "form2_20250330_001",
            "url": "https://storage.cwdsfield.com/documents/form2_001.pdf",
            "generatedAt": "2025-03-30T10:40:05Z",
            "pages": 3
          }
        }
      },
      {
        "stepNumber": 7,
        "title": "Departure",
        "status": "completed",
        "completedAt": "2025-03-30T14:30:00Z",
        "duration": 240,
        "data": {
          "arrivalTime": "2025-03-30T09:10:00Z",
          "departureTime": "2025-03-30T14:30:00Z",
          "totalHours": 5.33,
          "totalMinutes": 320,
          "breakDuration": 30,  // minutes
          "billableHours": 5.0,
          
          "siteConditions": {
            "siteClean": true,
            "equipmentLeftOnsite": true,
            "equipmentSecure": true,
            "doorsLocked": true,
            "alarmsSet": true
          },
          
          "equipmentLeft": [
            { "type": "dehumidifier", "quantity": 2, "location": "Kitchen center" },
            { "type": "airmover", "quantity": 3, "location": "Kitchen walls" },
            { "type": "airmover", "quantity": 2, "location": "Hallway" },
            { "type": "dehumidifier", "quantity": 1, "location": "Living Room" }
          ],
          
          "issuesOnDeparture": false,
          "issueNotes": "",
          
          "followUp": {
            "required": true,
            "nextVisitDate": "2025-03-31",
            "nextVisitTime": "09:00",
            "purpose": "Check moisture readings, move equipment as needed",
            "estimatedDuration": 120
          },
          
          "clientCommunication": {
            "clientBriefed": true,
            "briefingMethod": "verbal_and_written",
            "contactNumberConfirmed": "0412 345 678",
            "emergencyContactProvided": true
          }
        }
      },
      {
        "stepNumber": 8,
        "title": "Review & Submit",
        "status": "completed",
        "completedAt": "2025-03-30T14:35:00Z",
        "duration": 5,
        "data": {
          "submissionMethod": "mobile_app",
          "device": {
            "type": "mobile",
            "platform": "ios",
            "osVersion": "16.0",
            "appVersion": "2.1.0",
            "model": "iPhone14,2",
            "deviceId": "device_abc123"
          },
          "network": {
            "type": "wifi",
            "ssid": "CWDS_Field",
            "ipAddress": "203.123.45.67"
          },
          "location": {
            "latitude": -33.8748,
            "longitude": 151.2131,
            "accuracy": 5.2,
            "address": "42 Harbour View Drive, Surry Hills NSW 2010"
          },
          "submissionTimestamp": "2025-03-30T14:35:00Z",
          "dataSyncStatus": "full_sync",
          "attachmentsUploaded": 12,
          "attachmentsFailed": 0
        }
      }
    ],
    
    // All Photos Gallery
    "photos": {
      "total": 12,
      "categories": {
        "roomOverviews": 3,
        "moistureReadings": 3,
        "equipment": 2,
        "signatures": 2,
        "other": 2
      },
      "gallery": [
        {
          "id": "photo_001",
          "url": "https://storage.cwdsfield.com/photos/photo_001.jpg",
          "thumbnailUrl": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg",
          "category": "room_overview",
          "room": "Kitchen",
          "description": "Entry view",
          "capturedAt": "2025-03-30T09:15:00Z",
          "uploadedAt": "2025-03-30T09:15:30Z",
          "metadata": {
            "width": 4032,
            "height": 3024,
            "fileSize": 2456789,
            "format": "JPEG"
          }
        }
        // ... more photos
      ]
    },
    
    // Review & Approval Section (Admin only)
    "review": {
      "status": "pending_review",
      "eligibleForReview": true,
      "submittedForReviewAt": "2025-03-30T14:35:00Z",
      
      "currentReview": null,
      
      "reviewHistory": [
        {
          "reviewId": "rev_001",
          "action": "submitted",
          "by": "system",
          "timestamp": "2025-03-30T14:35:00Z",
          "notes": "Automatically submitted by technician"
        }
      ],
      
      "qualityChecks": {
        "photosRequired": 12,
        "photosProvided": 12,
        "photosPass": true,
        
        "signaturesRequired": 2,
        "signaturesProvided": 2,
        "signaturesPass": true,
        
        "moistureReadingsRequired": 3,
        "moistureReadingsProvided": 3,
        "moisturePass": true,
        
        "equipmentPhotoRequired": true,
        "equipmentPhotoProvided": true,
        "equipmentPass": true,
        
        "form2Required": true,
        "form2Provided": true,
        "form2Pass": true,
        
        "overallPass": true,
        "issues": []
      },
      
      "recommendedAction": "approve",
      "autoApproved": false
    },
    
    // Financial Summary
    "financials": {
      "laborCost": {
        "hours": 5.33,
        "rate": 45.00,
        "subtotal": 239.85,
        "overtime": 0,
        "total": 239.85
      },
      "consumablesCost": 168.10,
      "equipmentRental": {
        "dailyRate": 125.00,
        "days": 1,
        "total": 125.00
      },
      "totalCost": 532.95,
      "currency": "AUD"
    },
    
    // Timeline
    "timeline": [
      { "event": "Job assigned", "timestamp": "2025-03-26T10:30:00Z", "by": "system" },
      { "event": "Attendance started", "timestamp": "2025-03-30T09:05:00Z", "by": "James Wilson" },
      { "event": "OH&S completed", "timestamp": "2025-03-30T09:05:00Z", "by": "James Wilson" },
      { "event": "JSA signed", "timestamp": "2025-03-30T09:08:00Z", "by": "James Wilson" },
      { "event": "Arrival checked in", "timestamp": "2025-03-30T09:12:00Z", "by": "James Wilson" },
      { "event": "Room inspection completed", "timestamp": "2025-03-30T10:30:00Z", "by": "James Wilson" },
      { "event": "Consumables logged", "timestamp": "2025-03-30T10:35:00Z", "by": "James Wilson" },
      { "event": "Form 2 signed", "timestamp": "2025-03-30T10:40:00Z", "by": "John Smith & James Wilson" },
      { "event": "Departure recorded", "timestamp": "2025-03-30T14:30:00Z", "by": "James Wilson" },
      { "event": "Attendance submitted", "timestamp": "2025-03-30T14:35:00Z", "by": "James Wilson" }
    ],
    
    // Admin Actions Available
    "actions": {
      "canReview": true,
      "canApprove": true,
      "canReject": true,
      "canRequestCorrection": true,
      "canEdit": false,
      "canExport": true,
      "canPrint": true,
      "canDelete": false,
      "canReassign": false
    },
    
    // Metadata
    "createdAt": "2025-03-30T09:05:00Z",
    "submittedAt": "2025-03-30T14:35:00Z",
    "updatedAt": "2025-03-30T14:35:00Z",
    "version": 1,
    "schemaVersion": "2.1.0"
  }
}

Response 404:
{
  "success": false,
  "message": "Attendance record not found",
  "code": "NOT_FOUND"
}

Response 403:
{
  "success": false,
  "message": "You do not have permission to view this attendance record",
  "code": "FORBIDDEN"
}
```

### 18. Get All Company Attendance Records (Admin List View)
```http
GET /admin/attendance?page={page}&limit={limit}&startDate={startDate}&endDate={endDate}&technicianId={technicianId}&jobId={jobId}&status={status}&search={search}
Authorization: Bearer {token}

Query Parameters:
- page (number, optional): Page number, default 1
- limit (number, optional): Items per page, default 20, max 100
- startDate (string, optional): ISO date string (YYYY-MM-DD) - filter from this date
- endDate (string, optional): ISO date string (YYYY-MM-DD) - filter to this date
- technicianId (string, optional): Filter by specific technician ID
- jobId (string, optional): Filter by specific job ID
- status (string, optional): Filter by status - submitted | draft | approved | rejected | pending_review
- search (string, optional): Search in job title, client name, address, technician name
- sortBy (string, optional): Field to sort by - submittedAt | arrivalTime | totalHours | technicianName
- sortOrder (string, optional): asc | desc, default desc
- exportFormat (string, optional): If provided, triggers download - csv | xlsx | pdf

Response 200 (JSON format):
{
  "success": true,
  "data": [
    {
      "id": "att_20250330_001",
      "jobId": "JOB-20250326-001",
      "jobTitle": "Water Damage Restoration — Unit 4",
      "jobAddress": "42 Harbour View Drive, Surry Hills NSW 2010",
      "clientName": "John Smith",
      "clientPhone": "0412 345 678",
      
      "technician": {
        "id": "tech_123",
        "name": "James Wilson",
        "email": "james@cwds.com.au",
        "avatar": "https://storage.cwdsfield.com/avatars/tech_123.jpg"
      },
      
      "date": "2025-03-30",
      "status": "Submitted | Approved | Rejected | Draft | Pending Review",
      "reviewStatus": {
        "isReviewed": true,
        "reviewedAt": "2025-03-30T16:00:00Z",
        "reviewedBy": "supervisor_001",
        "reviewerName": "Sarah Johnson",
        "notes": "Excellent documentation",
        "rating": 5  // 1-5 scale
      },
      
      // Time Tracking
      "arrivalTime": "09:10 AM",
      "departureTime": "02:30 PM",
      "totalHours": 5.33,
      "onTimeArrival": true,  // Calculated based on scheduled time
      
      // Work Summary
      "roomsInspected": 3,
      "photosCount": 12,
      "equipmentInstalled": 8,
      "consumablesUsed": 35,
      
      // Job Details
      "waterCategory": 2,
      "waterClass": 2,
      "buildingType": "Strata",
      "affectedRooms": ["Kitchen", "Hallway", "Living Room"],
      
      // Completion Status
      "stepsCompleted": 7,  // Out of 8
      "incompleteSteps": ["Form 2 Signing"],  // If any
      "hasIssues": false,
      "issueFlags": [],
      
      // Timestamps
      "submittedAt": "2025-03-30T14:35:00Z",
      "createdAt": "2025-03-30T09:05:00Z",
      "updatedAt": "2025-03-30T14:35:00Z",
      
      // Quick Actions
      "actions": {
        "canReview": true,
        "canEdit": false,
        "canExport": true,
        "canDelete": false,
        "viewUrl": "/attendance/att_20250330_001"
      },
      
      // Thumbnail for quick preview
      "thumbnailPhoto": "https://storage.cwdsfield.com/photos/thumb_photo_001.jpg"
    }
  ],
  
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "totalPages": 23
  },
  
  "summary": {
    "totalRecords": 450,
    "recordsInPeriod": 127,
    "pendingReview": 15,
    "approved": 380,
    "rejected": 12,
    "drafts": 43,
    
    "totalHoursLogged": 1845.5,
    "averageHoursPerAttendance": 4.1,
    
    "techniciansActive": 12,
    "jobsCompleted": 98,
    
    "consumablesTotal": {
      "disposable_gloves": 1250,
      "face_masks": 890,
      "rubbish_bags": 456
    }
  },
  
  "filters": {
    "availableStatuses": ["submitted", "approved", "rejected", "draft", "pending_review"],
    "availableTechnicians": [
      { "id": "tech_123", "name": "James Wilson", "count": 45 },
      { "id": "tech_124", "name": "Michael Chen", "count": 38 }
    ],
    "dateRange": {
      "min": "2025-01-01",
      "max": "2025-03-30"
    }
  }
}

Response 200 (CSV/Excel export - Content-Disposition: attachment):
- Binary file download with columns:
  - Attendance ID, Job ID, Job Title, Client Name, Technician Name, Date, 
  - Arrival Time, Departure Time, Total Hours, Rooms Inspected, Photos Count,
  - Status, Reviewed By, Review Notes, Water Category, Building Type

Response 403 (Forbidden - not admin/supervisor):
{
  "success": false,
  "message": "Access denied. Admin or supervisor role required.",
  "code": "FORBIDDEN"
}

Response 400 (Invalid date range):
{
  "success": false,
  "message": "Invalid date range. startDate must be before or equal to endDate.",
  "code": "VALIDATION_ERROR"
}
```

### 18. Get Admin Dashboard Overview
```http
GET /admin/dashboard/overview?period={period}
Authorization: Bearer {token}

Query Parameters:
- period (string, optional): Time period for summary - week | month | quarter | year, default "month"

Response 200:
{
  "success": true,
  "data": {
    "period": {
      "type": "month",
      "label": "March 2025",
      "startDate": "2025-03-01",
      "endDate": "2025-03-31"
    },
    
    "attendanceOverview": {
      "totalSubmitted": 156,
      "pendingReview": 18,
      "approved": 132,
      "rejected": 6,
      "drafts": 24,
      "avgReviewTime": 4.5  // Hours from submission to review
    },
    
    "workforceMetrics": {
      "totalTechnicians": 15,
      "activeToday": 8,
      "onLeave": 2,
      "averageHoursPerTech": 145.5,
      "topPerformer": {
        "id": "tech_123",
        "name": "James Wilson",
        "hours": 187.5,
        "attendanceCount": 42
      }
    },
    
    "jobMetrics": {
      "totalJobs": 89,
      "completed": 67,
      "inProgress": 18,
      "pending": 4,
      "completionRate": 75.3
    },
    
    "qualityMetrics": {
      "averageRating": 4.6,
      "photoCompliance": 98.5,  // % of attendances with required photos
      "form2Compliance": 100.0, // % of invasive works with Form 2
      "onTimeRate": 94.2       // % arrivals on scheduled time
    },
    
    "recentActivity": [
      {
        "type": "attendance_submitted",
        "timestamp": "2025-03-30T14:35:00Z",
        "technicianName": "James Wilson",
        "jobTitle": "Water Damage Restoration — Unit 4",
        "details": "5.3 hours, 3 rooms inspected"
      },
      {
        "type": "attendance_approved",
        "timestamp": "2025-03-30T16:00:00Z",
        "reviewerName": "Sarah Johnson",
        "technicianName": "Michael Chen",
        "details": "Rated 5/5"
      }
    ],
    
    "alerts": [
      {
        "type": "overdue_review",
        "severity": "medium",
        "message": "12 attendance records pending review for >24 hours",
        "count": 12,
        "actionUrl": "/admin/attendance?status=pending_review&overdue=true"
      },
      {
        "type": "missing_photos",
        "severity": "low",
        "message": "3 recent attendances missing required photos",
        "count": 3,
        "actionUrl": "/admin/attendance?issue=missing_photos"
      }
    ]
  }
}
```

### 19. Bulk Review Attendance
```http
POST /admin/attendance/bulk-review
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "attendanceIds": ["att_001", "att_002", "att_003"],
  "action": "approve | reject | request_correction",
  "reviewNotes": "All documentation complete and satisfactory",
  "rating": 5  // Optional, 1-5 scale
}

Response 200:
{
  "success": true,
  "data": {
    "processed": 3,
    "approved": 3,
    "rejected": 0,
    "failed": 0,
    "results": [
      {
        "attendanceId": "att_001",
        "status": "approved",
        "success": true
      }
    ]
  }
}
```

### 20. Get Attendance Analytics (Charts Data)
```http
GET /admin/analytics/attendance?metric={metric}&period={period}&groupBy={groupBy}
Authorization: Bearer {token}

Query Parameters:
- metric (string, required): Metric to analyze
  - "hours" - Total hours worked
  - "attendance_count" - Number of attendances
  - "jobs_completed" - Jobs completed
  - "consumables" - Consumables usage
  - "photos" - Photos captured
- period (string, required): week | month | quarter | year | custom
- groupBy (string, optional): How to group data
  - "day" - Daily breakdown
  - "week" - Weekly breakdown
  - "technician" - By technician
  - "job_type" - By job type (water damage, mold, etc.)
  - "water_category" - By water category
- startDate (string, optional): Required if period=custom
- endDate (string, optional): Required if period=custom

Response 200:
{
  "success": true,
  "data": {
    "metric": "hours",
    "period": "month",
    "groupBy": "technician",
    "labels": ["James Wilson", "Michael Chen", "Sarah Lee"],
    "datasets": [
      {
        "label": "Hours Worked",
        "data": [187.5, 156.0, 142.5],
        "colors": ["#1A5FB4", "#0EA5E9", "#2E74CC"]
      }
    ],
    "summary": {
      "total": 486.0,
      "average": 162.0,
      "max": 187.5,
      "min": 142.5
    }
  }
}
```

---

## Data Models Reference

### Job Status Flow
```
assigned → in_progress → completed
    ↓         ↓
cancelled  on_hold
```

### Attendance Status Flow
```
draft → submitted → approved
          ↓
        rejected → draft (correction)
```

### Water Categories
| Category | Description | Source |
|----------|-------------|--------|
| 1 | Clean Water | Broken supply line, rain |
| 2 | Grey Water | Washing machine, dishwasher |
| 3 | Black Water | Sewage, flooding, seawater |

### Water Classes
| Class | Description | Drying Time |
|-------|-------------|-------------|
| 1 | Minimal, <5% affected | 1-2 days |
| 2 | Significant, 5-40% affected | 2-4 days |
| 3 | Extensive, >40% affected | 4-7 days |
| 4 | Specialty, low permeability | 5+ days |

---

## Frontend Integration Examples

### Using the API Client

```typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.cwdsfield.com/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle token refresh & retries
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Token expired — attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          await AsyncStorage.setItem('auth_token', data.token);
          await AsyncStorage.setItem('refresh_token', data.refreshToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
          }
          return apiClient(originalRequest);
        }
      } catch {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

### Service Layer Implementation

```typescript
// src/api/jobService.ts
import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  JobListParams,
  AttendanceSubmitPayload,
} from '../types/api';
import type { Job, AttendanceReport } from '../types/models';

export const jobService = {
  getJobs: async (params?: JobListParams): Promise<PaginatedResponse<Job>> => {
    const { data } = await apiClient.get<PaginatedResponse<Job>>('/jobs', {
      params,
    });
    return data;
  },

  getJobById: async (jobId: string): Promise<ApiResponse<Job>> => {
    const { data } = await apiClient.get<ApiResponse<Job>>(`/jobs/${jobId}`);
    return data;
  },

  updateJobStatus: async (
    jobId: string,
    status: string,
  ): Promise<ApiResponse<Job>> => {
    const { data } = await apiClient.patch<ApiResponse<Job>>(
      `/jobs/${jobId}/status`,
      { status },
    );
    return data;
  },

  submitAttendance: async (
    payload: AttendanceSubmitPayload,
  ): Promise<ApiResponse<AttendanceReport>> => {
    const { data } = await apiClient.post<ApiResponse<AttendanceReport>>(
      `/jobs/${payload.jobId}/attendance`,
      payload,
    );
    return data;
  },

  saveDraft: async (
    jobId: string,
    draft: Partial<AttendanceReport>,
  ): Promise<ApiResponse<AttendanceReport>> => {
    const { data } = await apiClient.put<ApiResponse<AttendanceReport>>(
      `/jobs/${jobId}/attendance/draft`,
      draft,
    );
    return data;
  },

  uploadPhoto: async (
    jobId: string,
    formData: FormData,
  ): Promise<ApiResponse<{ url: string }>> => {
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      `/jobs/${jobId}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
```

### Redux Thunk for Attendance Submission

```typescript
// src/store/slices/attendanceSlice.ts
export const submitAttendance = createAsyncThunk(
  'attendance/submit',
  async (jobId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { attendance: AttendanceState };
      const { stepData, photos, rooms, consumables, signature } = state.attendance;
      
      const response = await jobService.submitAttendance({
        jobId,
        steps: Object.values(stepData),
        photos: photos.map((p: Photo) => p.uri),
        rooms,
        consumables,
        signature: signature?.base64,
        notes: stepData[5]?.notes as string | undefined,
        submittedAt: new Date().toISOString(),
      });
      
      // Clear local draft after successful submission
      await AsyncStorage.removeItem(`attendance_draft_${jobId}`);
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit';
      return rejectWithValue(message);
    }
  },
);
```

---

## Security Requirements

1. **Authentication**: All endpoints except `/auth/login` require Bearer token
2. **Authorization**: Technicians can only access their assigned jobs
3. **Rate Limiting**: 
   - Login: 5 attempts per 15 minutes
   - API: 1000 requests per hour per user
4. **File Upload Security**:
   - Max file size: 10MB
   - Allowed types: JPEG, PNG
   - Virus scanning on upload
   - Metadata stripping
5. **Data Validation**:
   - Strict schema validation for attendance payload
   - Sanitize all text inputs
   - Validate photo metadata

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": {
    "fieldName": ["Error description"]
  },
  "timestamp": "2025-03-30T14:35:00Z",
  "requestId": "req_abc123"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing token |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| DUPLICATE | 409 | Resource already exists |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Implementation Notes for Backend Developers

1. **Attendance Payload Storage**: Store the complete `steps` array as JSONB in PostgreSQL for flexibility. Each step should be indexed for querying.

2. **Photo Handling**: Store photos in object storage (S3/MinIO) with the URL stored in the database. Generate thumbnails on upload.

3. **Draft Expiry**: Implement a cron job to clean up drafts older than 7 days.

4. **Offline Sync**: The frontend uses AsyncStorage for offline persistence. The backend should handle duplicate submissions gracefully (idempotency via client-generated UUID).

5. **Notifications**: Send push notifications to supervisors when attendance is submitted. Include job ID and technician name.

6. **Audit Trail**: Log all attendance modifications with timestamp and user ID for compliance.

7. **Moisture Data**: Store moisture readings as a time series if daily monitoring is implemented. Current schema supports single readings per surface.

8. **Signature Storage**: Store signatures as base64-encoded PNG images in object storage, reference by URL in database.

9. **Form 2 PDF Generation**: On attendance submission, generate a PDF of the Form 2 document with embedded signatures. Store for legal compliance.

10. **Search Indexing**: Index job addresses, client names, and job IDs for fast search response (<200ms).

---

## Database Schema Suggestion (PostgreSQL)

```sql
-- Jobs table
CREATE TABLE jobs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    priority VARCHAR(10) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20),
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    estimated_duration INTEGER,
    assigned_to VARCHAR(50) REFERENCES technicians(id),
    water_damage_cause VARCHAR(50),
    water_category INTEGER CHECK (water_category IN (1,2,3)),
    water_class INTEGER CHECK (water_class IN (1,2,3,4)),
    building_type VARCHAR(20),
    affectedRooms TEXT[],
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) REFERENCES jobs(id),
    technician_id VARCHAR(50) REFERENCES technicians(id),
    status VARCHAR(20) NOT NULL,
    steps JSONB NOT NULL,
    photos JSONB,
    rooms JSONB,
    consumables JSONB,
    signature_url VARCHAR(500),
    notes TEXT,
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP,
    total_hours DECIMAL(4,2),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) REFERENCES jobs(id),
    attendance_id VARCHAR(50) REFERENCES attendance(id),
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    metadata JSONB,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drafts table (optional - can use local storage only)
CREATE TABLE attendance_drafts (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) REFERENCES jobs(id),
    technician_id VARCHAR(50) REFERENCES technicians(id),
    data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

*Document Version: 1.0*
*Last Updated: March 30, 2025*
*For: CWDS Field Operations Mobile App Backend Development*
