# Certificate System Implementation

## Overview

This document describes the implementation of a comprehensive certificate system for the Haxplode hackathon platform. The system automatically generates participation certificates when hackathons end and provides a user-friendly interface for viewing and downloading certificates.

## Features

### 🎖️ Automatic Certificate Generation
- **Participation Certificates**: Automatically generated when hackathons are marked as completed
- **Real-time Generation**: Certificates are created using the actual event data and participant information
- **PDF Format**: Professional-looking certificates generated using PDFKit
- **Unique IDs**: Each certificate has a unique certificate number for verification

### 📱 User Interface
- **Certificate Dashboard**: Clean, modern interface showing all user certificates
- **Statistics**: Visual representation of certificate types and counts
- **Preview Mode**: View certificate details before downloading
- **Download Functionality**: One-click PDF download with proper file naming

### 🔧 Backend Infrastructure
- **Database Models**: Proper SQL schema for storing certificate data
- **API Endpoints**: RESTful endpoints for certificate operations
- **Scheduled Tasks**: Automatic certificate generation using cron jobs
- **File Management**: Secure storage and serving of generated PDFs

## Technical Implementation

### Database Schema

#### Certificate Table
```sql
CREATE TABLE Certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  eventId INT NOT NULL,
  teamId INT,
  type ENUM('participation', 'winner', 'runner-up', 'special', 'honorable-mention'),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  projectName VARCHAR(200),
  score DECIMAL(5,2),
  rank INT,
  issuedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  certificateNumber VARCHAR(50) UNIQUE NOT NULL,
  pdfUrl VARCHAR(500),
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Get User Certificates
```
GET /api/certificates/user/:userId
Authorization: Bearer <token>
Response: { certificates: [...] }
```

#### Download Certificate
```
GET /api/certificates/download/:certificateId
Authorization: Bearer <token>
Response: PDF file download
```

#### Generate Event Certificates (Organizer Only)
```
POST /api/certificates/generate/:eventId
Authorization: Bearer <token> (Organizer role required)
Response: { message: string, certificates: [...] }
```

### Certificate Generation Process

1. **Event Completion Check**: System monitors for events marked as "Completed"
2. **Participant Verification**: Confirms all registered participants
3. **PDF Generation**: Creates professional certificate using PDFKit
4. **File Storage**: Saves PDF to secure uploads directory
5. **Database Record**: Stores certificate metadata and file reference
6. **User Notification**: Participants can view and download their certificates

### PDF Certificate Design

The generated certificates include:
- **Header**: "CERTIFICATE OF PARTICIPATION" in large, bold text
- **Participant Name**: Prominently displayed
- **Event Details**: Name, theme, location, dates
- **Team Information**: Team name (if applicable)
- **Project Details**: Project name (if available)
- **Certificate Number**: Unique identifier for verification
- **Professional Styling**: Gradients, borders, and proper typography

## Setup Instructions

### Backend Dependencies

Install required packages:
```bash
cd backend
npm install node-cron pdfkit
```

### Database Migration

The Certificate model will be automatically created when the application starts. Ensure your database connection is properly configured.

### Environment Variables

No additional environment variables are required. The system uses existing database and file storage configurations.

### File Permissions

Ensure the `uploads/certificates` directory is writable by the application:
```bash
mkdir -p backend/uploads/certificates
chmod 755 backend/uploads/certificates
```

## Usage

### For Participants

1. **View Certificates**: Navigate to the Certificates tab in your dashboard
2. **Preview**: Click the "Preview" button to see certificate details
3. **Download**: Click "Download" to get the PDF certificate

### For Organizers

1. **Mark Event Complete**: Change event status to "Completed" in the event management interface
2. **Generate Certificates**: Certificates are automatically generated within an hour
3. **Manual Generation**: Use the API endpoint to manually trigger certificate generation

### For Developers

#### Testing Certificate Generation
```bash
cd backend
node scripts/testCertificates.js <eventId>
```

#### Manual Certificate Generation
```javascript
const { generateEventCertificates } = require('./controllers/certificateController');
const certificates = await generateEventCertificates(eventId);
```

## Configuration

### Scheduler Timing

Certificates are checked and generated every hour. To modify this:
```javascript
// In backend/utils/certificateScheduler.js
cron.schedule('0 * * * *', async () => {
  // Change '0 * * * *' to your desired cron expression
});
```

### PDF Styling

To customize certificate appearance, modify the `generateCertificatePDF` function in `certificateController.js`:
- Colors and gradients
- Fonts and sizes
- Layout and spacing
- Background designs

### File Storage

PDFs are stored in `backend/uploads/certificates/`. To change the storage location:
1. Update the path in `certificateController.js`
2. Ensure the new directory is writable
3. Update the static file serving in `server.js`

## Security Considerations

- **Authentication Required**: All certificate endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own certificates
- **Organizer Verification**: Certificate generation restricted to event organizers
- **File Validation**: PDF files are generated server-side, preventing malicious uploads
- **Rate Limiting**: API endpoints are protected by existing rate limiting

## Monitoring and Maintenance

### Logs

The system logs all certificate operations:
- Generation attempts and results
- Download requests
- Error conditions and resolutions

### Performance

- **PDF Generation**: Optimized for speed with minimal memory usage
- **Database Queries**: Efficient queries with proper indexing
- **File Storage**: Organized file structure for easy management

### Cleanup

Consider implementing a cleanup strategy for old certificates:
- Archive certificates older than X years
- Compress PDF files for long-term storage
- Database cleanup for deleted events

## Troubleshooting

### Common Issues

1. **Certificates Not Generating**
   - Check event status is "Completed"
   - Verify database connections
   - Check file permissions for uploads directory

2. **PDF Download Fails**
   - Verify PDF file exists in uploads directory
   - Check file permissions
   - Ensure proper MIME type headers

3. **Scheduler Not Running**
   - Verify cron dependency is installed
   - Check server logs for scheduler errors
   - Ensure server has proper timezone configuration

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
NODE_ENV=development
```

## Future Enhancements

### Planned Features
- **Winner Certificates**: Special certificates for competition winners
- **Digital Signatures**: Cryptographic verification of certificates
- **Certificate Templates**: Multiple design options for organizers
- **Bulk Operations**: Mass certificate generation and distribution
- **Analytics**: Certificate download and usage statistics

### Integration Opportunities
- **Email Notifications**: Automatic certificate delivery via email
- **Social Sharing**: Easy sharing of certificates on social media
- **Verification API**: Public endpoint for certificate verification
- **Mobile App**: Native mobile certificate viewing

## Support

For technical support or questions about the certificate system:
1. Check the application logs for error details
2. Verify database and file system permissions
3. Test with the provided test script
4. Review this documentation for configuration details

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Haxplode Development Team
