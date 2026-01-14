# Speaker Application System

## Overview

The speaker application system allows users to apply as speakers for upcoming events. The system includes:

- ✅ Speaker application form with comprehensive fields
- ✅ File uploads (CV, ID, profile photo, presentation slides)
- ✅ Admin approval/rejection workflow
- ✅ Email notifications to speakers
- ✅ Badge generation for approved speakers
- ✅ Database tracking of all speaker requests

## Database Setup

Run the SQL script to create the speaker_requests table:

```bash
psql -U postgres -d your_database < database/speaker_requests_table.sql
```

### Table: speaker_requests

Stores all speaker applications with the following fields:

**Personal Information:**
- `full_name` - Speaker's full name
- `email` - Speaker's email
- `phone` - Phone number with country code
- `country_code` - International dialing code

**Professional Background:**
- `specialty` - Area of expertise
- `years_of_experience` - Professional experience range
- `bio` - Professional biography

**Session Details:**
- `topic` - Session topic title
- `topic_description` - Detailed topic description
- `session_type` - Type of session (keynote, presentation, workshop, panel_discussion, other)
- `session_duration` - Duration in minutes (30, 45, 60, 90, 120)

**Files:**
- `cv_url` - Link to uploaded CV (required)
- `id_document_url` - Link to ID document (required)
- `profile_photo_url` - Link to profile photo (optional)
- `presentation_file_url` - Link to presentation slides (optional)

**Additional Information:**
- `special_requirements` - Equipment or setup needs
- `dietary_restrictions` - Dietary preferences
- `needs_accommodation` - Whether accommodation is needed
- `accommodation_details` - Details about accommodation needs

**Status & Approval:**
- `status` - pending, approved, rejected, confirmed
- `rejection_reason` - Reason if rejected
- `approved_by` - Admin user ID who approved
- `approved_at` - Approval timestamp

**Badge:**
- `badge_generated` - Whether badge was generated
- `badge_url` - Link to generated badge
- `badge_generated_at` - When badge was generated

## Frontend Implementation

### Adding "Join as Speaker" Button

The button is available on all event cards for upcoming events. Users can click it to open the speaker application modal.

### Speaker Application Modal

**Location:** `src/components/SpeakerApplicationModal.js`

**Features:**
- Pre-fills user information if logged in
- Country code selector with international phone input
- Multi-step form layout
- File upload with drag-and-drop support
- Form validation
- Success confirmation screen

**Usage in Components:**

```javascript
import SpeakerApplicationModal from '@/components/SpeakerApplicationModal';

// In your component
const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
const [selectedSpeakerEvent, setSelectedSpeakerEvent] = useState(null);

const handleJoinAsSpeaker = (event) => {
  setSelectedSpeakerEvent(event);
  setIsSpeakerModalOpen(true);
};

return (
  <>
    <button onClick={() => handleJoinAsSpeaker(event)}>
      Join as Speaker
    </button>

    <SpeakerApplicationModal
      event={selectedSpeakerEvent}
      isOpen={isSpeakerModalOpen}
      onClose={() => setIsSpeakerModalOpen(false)}
      user={user}
    />
  </>
);
```

## API Endpoints

### 1. Submit Speaker Application

**POST** `/api/events/speaker-request`

Submits a new speaker application with file uploads.

**Request:**
```javascript
const formData = new FormData();
formData.append('event_id', eventId);
formData.append('full_name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '33445566');
formData.append('country_code', '+973');
// ... other fields
formData.append('cv_file', cvFile);
formData.append('id_document_file', idFile);

const response = await fetch('/api/events/speaker-request', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "success": true,
  "message": "Speaker application submitted successfully",
  "speaker_request_id": "uuid"
}
```

**Errors:**
- 400: Missing required fields
- 409: User already applied for this event
- 500: Server error

### 2. Get Speaker Requests (Admin)

**GET** `/api/admin/speaker-requests`

Retrieves all speaker requests with filtering and pagination.

**Query Parameters:**
- `status` - Filter by status (pending, approved, rejected, confirmed, all)
- `event_id` - Filter by event ID
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "status": "pending",
      "created_at": "2024-01-14T10:00:00Z",
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3. Approve/Reject Speaker Request (Admin)

**PATCH** `/api/admin/speaker-requests?id={speakerId}`

Approves or rejects a speaker request.

**Request:**
```json
{
  "action": "approve",  // or "reject"
  "rejection_reason": "Optional reason if rejecting"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Speaker request approved successfully",
  "data": {
    // Updated speaker request
  }
}
```

### 4. Delete Speaker Request (Admin)

**DELETE** `/api/admin/speaker-requests?id={speakerId}`

Deletes a speaker request.

**Response:**
```json
{
  "success": true,
  "message": "Speaker request deleted successfully"
}
```

## File Storage

Speaker files are uploaded to Supabase Storage in the `speaker-documents` bucket with the following structure:

```
speaker-documents/
├── {event_id}/
│   ├── {email}/
│   │   ├── cv_{timestamp}_{filename}
│   │   ├── id_{timestamp}_{filename}
│   │   ├── profile_{timestamp}_{filename}
│   │   └── presentation_{timestamp}_{filename}
```

## Admin Dashboard Features

### Pending Speaker Requests

The admin dashboard shows:
- List of pending speaker applications
- Quick view of applicant details
- File download links
- Approval/rejection actions
- Email notifications

### Speaker Approval Workflow

1. **Review Application**
   - View speaker's CV
   - Review credentials
   - Check session topic

2. **Approve or Reject**
   - Click "Approve" or "Reject" button
   - If rejecting, provide reason
   - System sends email notification

3. **Generate Badge** (for approved speakers)
   - Click "Generate Badge" button
   - Badge includes speaker name, title, event name
   - Download or email to speaker

## Email Notifications

### Speaker Approval Email

Sent when admin approves a speaker application.

**Template:**
```
Subject: Your Speaker Application Approved - [Event Name]

Dear [Speaker Name],

Congratulations! Your speaker application for [Event Name] has been approved.

Session Details:
- Topic: [Session Topic]
- Type: [Session Type]
- Duration: [Duration] minutes
- Date: [Event Date]
- Venue: [Venue Name]

Your speaker badge is attached. Please bring it to the event.

If you have any questions, please contact us at [Contact Email].

Best regards,
Bahrain Dental Society
```

### Speaker Rejection Email

Sent when admin rejects a speaker application.

**Template:**
```
Subject: Speaker Application Status - [Event Name]

Dear [Speaker Name],

Thank you for your interest in speaking at [Event Name].

Unfortunately, your speaker application has not been approved at this time.

Reason: [Rejection Reason]

You may reapply for future events. For more information, please contact us at [Contact Email].

Best regards,
Bahrain Dental Society
```

## Badge Generation

Approved speakers receive a printed badge that includes:
- Speaker name
- Session title
- Event name and date
- QR code (optional)

**Admin can:**
- View speaker badge
- Download badge as PDF
- Print badge directly
- Email badge to speaker

## Implementation Checklist

- [x] Database table created (speaker_requests_table.sql)
- [x] Speaker Application Modal component created
- [x] API route for form submission created
- [x] Admin API routes for approval/rejection created
- [x] "Join as Speaker" button added to event cards
- [ ] Admin dashboard page for managing speaker requests
- [ ] Email notification templates and sending
- [ ] Badge generation and PDF export
- [ ] Badge printing interface in admin dashboard
- [ ] Speaker confirmation workflow
- [ ] Event day QR code scanning for speakers

## Future Enhancements

- Speaker cancellation self-service
- Schedule conflict detection
- Speaker availability calendar
- Automated confirmation reminders
- Session feedback from attendees
- Speaker ratings and reviews
- Integration with event ticketing for speaker inventory
- Automatic badge generation with custom templates

## Troubleshooting

### File Upload Issues
- Ensure Supabase storage bucket `speaker-documents` exists
- Check file size limits (max 10MB)
- Verify CORS settings for file uploads

### Email Not Sending
- Configure email service in `.env.local`
- Check email templates are correctly formatted
- Verify SMTP credentials

### Database Errors
- Run migration script to create table
- Check foreign key constraints
- Verify unique constraints on event_id + email
