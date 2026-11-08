# CitizenEase API Contract

**Base URL**: `/api/v1`

All responses are JSON.

## Uniform Error Response
```json
{
  "error": {
    "code": "validation_error | not_found | conflict | schema_error | rate_limited | provider_unavailable | internal",
    "message": "Human readable explanation",
    "retryable": false
  }
}
```

## Standard HTTP Status Codes
- `200 OK` / `201 Created`
- `400 Bad Request` (`validation_error`)
- `404 Not Found` (`not_found`)
- `409 Conflict` (`conflict` - e.g., questionnaire incomplete)
- `422 Unprocessable Entity` (`schema_error`)
- `429 Too Many Requests` (`rate_limited`)
- `502 Bad Gateway` (`provider_unavailable` - returns fallback payload)
- `500 Internal Server Error` (`internal`)

---

## Endpoints

### 1. Health Check
- **`GET /health`**
- **Response**: `{"ok": true}`

### 2. Services Catalog
- **`GET /services?q={query}&lang={en|ur}`**
  - Response:
    ```json
    [
      {
        "id": "uuid",
        "slug": "domicile_prc",
        "title": "Domicile & PRC (Karachi)",
        "description": "Prepare required documents for permanent residence and citizenship verification in Sindh.",
        "icon": "file-badge"
      }
    ]
    ```

- **`GET /services/{slug}`**
  - Response:
    ```json
    {
      "service": {
        "id": "uuid",
        "slug": "domicile_prc",
        "title_en": "Domicile & PRC (Karachi)",
        "title_ur": "ڈومیسائل اور پی آر سی (کراچی)",
        "description_en": "...",
        "description_ur": "...",
        "keywords": ["domicile", "prc", "residence"]
      },
      "application_types": [
        {"id": "uuid", "slug": "domicile_and_prc", "title_en": "Both Domicile and PRC", "title_ur": "ڈومیسائل اور پی آر سی دونوں"},
        {"id": "uuid", "slug": "domicile_only", "title_en": "Domicile Only", "title_ur": "صرف ڈومیسائل"},
        {"id": "uuid", "slug": "prc_only", "title_en": "PRC Only", "title_ur": "صرف پی آر سی"}
      ],
      "source_summary": {
        "verified_count": 2,
        "unverified_count": 8,
        "last_verified_on": "2026-11-08"
      }
    }
    ```

### 3. AI Service Discovery
- **`POST /discover`**
  - Body:
    ```json
    {
      "text": "I need proof I belong to Karachi for university admission",
      "language": "en"
    }
    ```
  - Response:
    ```json
    {
      "service_slug": "domicile_prc",
      "confidence": 0.94,
      "clarifying_question": "Are you applying for university admission or a government job?"
    }
    ```

### 4. Questionnaire Flow
- **`POST /questionnaire/start`**
  - Body:
    ```json
    {
      "service_slug": "domicile_prc",
      "language": "en"
    }
    ```
  - Response:
    ```json
    {
      "session_id": "00000000-0000-0000-0000-000000000000",
      "question": {
        "key": "applicant_age",
        "text_en": "Is the applicant 18 years of age or older?",
        "text_ur": "کیا درخواست دہندہ کی عمر 18 سال یا اس سے زیادہ ہے؟",
        "input_type": "boolean",
        "order_index": 1,
        "required": true,
        "options": []
      },
      "progress": {
        "current_step": 1,
        "total_estimated": 6
      }
    }
    ```

- **`POST /questionnaire/answer`**
  - Body:
    ```json
    {
      "session_id": "00000000-0000-0000-0000-000000000000",
      "question_key": "applicant_age",
      "answer": true
    }
    ```
  - Response:
    ```json
    {
      "next_question": {
        "key": "district",
        "text_en": "Which Karachi district does your address belong to?",
        "text_ur": "آپ کا پتہ کراچی کے کس ضلع سے تعلق رکھتا ہے؟",
        "input_type": "district",
        "order_index": 2,
        "required": true,
        "options": [
          {"value": "karachi_south", "label_en": "Karachi South", "label_ur": "کراچی جنوبی"},
          {"value": "karachi_east", "label_en": "Karachi East", "label_ur": "کراچی شرقی"},
          {"value": "karachi_central", "label_en": "Karachi Central", "label_ur": "کراچی وسطی"},
          {"value": "karachi_west", "label_en": "Karachi West", "label_ur": "کراچی غربی"},
          {"value": "malir", "label_en": "Malir", "label_ur": "ملیر"},
          {"value": "korangi", "label_en": "Korangi", "label_ur": "کورنگی"},
          {"value": "keamari", "label_en": "Keamari", "label_ur": "کیماڑی"}
        ]
      },
      "done": false,
      "progress": {
        "current_step": 2,
        "total_estimated": 6
      },
      "visible_keys": ["applicant_age", "district"]
    }
    ```

### 5. Checklist & Readiness
- **`POST /checklist/generate`**
  - Body: `{"session_id": "00000000-0000-0000-0000-000000000000"}`
  - Response:
    ```json
    {
      "checklist_id": "c1111111-1111-1111-1111-111111111111",
      "items": [
        {
          "item_id": "item-1",
          "code": "CNIC_COPY",
          "title": "Copy of applicant CNIC / Smart Card",
          "why_needed": "Required by DC office to establish identity under Pakistan Citizenship Rules.",
          "applicability": "mandatory",
          "verification_status": "verified",
          "user_status": "missing",
          "source": {
            "title": "Sindh High Court Judgment on Domicile Rules",
            "url": "https://caselaw.shc.gov.pk",
            "last_verified_on": "2026-11-08"
          }
        }
      ],
      "readiness": {
        "score": 0,
        "ready": 0,
        "total": 4,
        "missing": ["Copy of applicant CNIC / Smart Card"],
        "conditional": [],
        "unverified": [],
        "explanation": "0 of 4 verified required items ready.",
        "is_guarantee": false
      },
      "disclaimers": [
        "Guidance only. This is preparation, not government approval."
      ]
    }
    ```

- **`GET /checklist/{id}`**
  - Returns checklist and readiness summary.

- **`PATCH /checklist/{id}/items`**
  - Body:
    ```json
    {
      "updates": [
        {"item_id": "item-1", "user_status": "have"}
      ]
    }
    ```
  - Response:
    ```json
    {
      "items": [...],
      "readiness": {
        "score": 25,
        "ready": 1,
        "total": 4,
        "missing": [...],
        "conditional": [],
        "unverified": [],
        "explanation": "1 of 4 verified required items ready.",
        "is_guarantee": false
      }
    }
    ```

### 6. AI Assistant
- **`POST /assistant/chat`**
  - Body:
    ```json
    {
      "session_id": "00000000-0000-0000-0000-000000000000",
      "checklist_id": "c1111111-1111-1111-1111-111111111111",
      "message": "Why do I need the PRC form specifically?",
      "language": "en"
    }
    ```
  - Response:
    ```json
    {
      "answer": "A PRC (Permanent Residence Certificate) in Sindh is issued under the Sindh Permanent Residence Certificate Rules 1971 and is strictly required for Sindh educational admissions and provincial job quotas.",
      "citations": [
        {
          "source_id": "s-shc-1971",
          "title": "Sindh High Court Case Law (caselaw.shc.gov.pk)",
          "url": "https://caselaw.shc.gov.pk",
          "last_verified_on": "2026-11-08"
        }
      ],
      "needs_confirmation": false,
      "suggested_actions": ["Review PRC Checklist Items"]
    }
    ```

### 7. Offices, Fees & Sources
- **`GET /offices?service={service_slug}&district={district_key}`**
- **`GET /fees/{service_slug}`**
- **`GET /sources/{service_slug}`**
