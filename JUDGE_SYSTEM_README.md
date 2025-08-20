# Judge Submission Assignment System

## Overview

This system implements a comprehensive judge review workflow where multiple judges can review each project, with the final score being the average of all judge scores. Each judge is assigned to review all submissions for an event, and once a judge reviews a submission, it gets locked to prevent duplicate reviews.

## Key Features

### 1. Judge Assignment System
- **Event Assignment**: Judges are assigned to events via the `JudgeEventAssignment` table
- **Submission Assignment**: All submissions in an event are automatically assigned to all judges assigned to that event
- **Review Locking**: Once a judge reviews a submission, it cannot be reviewed again by the same judge

### 2. Review Status Tracking
- **Assigned**: Submission is assigned to judge but not yet reviewed
- **Reviewed**: Submission has been reviewed and scored by the judge

### 3. Score Calculation
- **Individual Scores**: Each judge provides a score (0-100) and detailed feedback
- **Average Calculation**: Final project score is the average of all judge scores
- **Criteria-based Scoring**: Judges can score based on multiple criteria with weighted scoring

## Database Schema

### New Table: `JudgeSubmissionAssignments`

```sql
CREATE TABLE JudgeSubmissionAssignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judgeId INT NOT NULL,
  submissionId VARCHAR(255) NOT NULL, -- MongoDB ObjectId as string
  eventId INT NOT NULL,
  assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewedAt DATETIME NULL,
  status ENUM('assigned', 'reviewed') DEFAULT 'assigned',
  score DECIMAL(5,2) NULL,
  feedback TEXT NULL,
  criteria TEXT NULL, -- JSON string for criteria-based scoring
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_judge_submission (judgeId, submissionId),
  INDEX idx_event_status (eventId, status),
  INDEX idx_judge_status (judgeId, status),
  FOREIGN KEY (judgeId) REFERENCES Judges(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE
);
```

## API Endpoints

### Organizer Endpoints

#### 1. Assign Submissions to Judges
```http
POST /api/judges/assign-submissions/:eventId
```
- **Description**: Assigns all submissions in an event to all judges assigned to that event
- **Authorization**: Organizer only
- **Response**: Number of assignments created

#### 2. Get Event Results
```http
GET /api/judges/results/:eventId
```
- **Description**: Gets all submissions with average scores from all judges
- **Authorization**: Organizer only
- **Response**: Submissions with average scores and individual judge reviews

### Judge Endpoints

#### 1. Get Assigned Submissions
```http
GET /api/judges/submissions/:eventId
```
- **Description**: Gets all submissions assigned to the current judge for a specific event
- **Authorization**: Judge only
- **Response**: Submissions with review status and existing scores

#### 2. Submit Review
```http
POST /api/judges/review
```
- **Description**: Submits a review for a submission (locks it from further review)
- **Authorization**: Judge only
- **Body**: `{ submissionId, score, feedback, criteria }`
- **Response**: Confirmation of review submission

## Frontend Components

### 1. AssignedSubmissions Component
- **Location**: `frontend/src/components/judge/AssignedSubmissions.jsx`
- **Features**:
  - Shows "Assigned" and "Reviewed" tags for each submission
  - Displays judge's score for reviewed submissions
  - Prevents review of already reviewed submissions
  - Search and filter functionality

### 2. ScoringForm Component
- **Location**: `frontend/src/components/judge/ScoringForm.jsx`
- **Features**:
  - Criteria-based scoring system
  - Detailed feedback input
  - Prevents modification of already reviewed submissions
  - Time tracking for reviews

### 3. JudgeManagement Component
- **Location**: `frontend/src/components/organizer/JudgeManagement.jsx`
- **Features**:
  - Button to assign submissions to judges
  - Judge assignment management

## Workflow

### 1. Event Setup (Organizer)
1. Create event
2. Assign judges to event
3. Wait for submissions
4. Click "Assign Submissions to Judges" button

### 2. Judge Review Process
1. Judge logs in and sees assigned submissions
2. Judge clicks "Start Review" on an assigned submission
3. Judge fills out scoring form with criteria and feedback
4. Judge submits review (submission becomes locked)
5. Judge can view but not modify completed reviews

### 3. Results Calculation (Organizer)
1. Organizer can view event results
2. Each submission shows average score from all judges
3. Individual judge scores and feedback are visible
4. Submissions are ranked by average score

## Implementation Details

### Backend Changes

1. **New Model**: `JudgeSubmissionAssignment` in `backend/models/sql/Judge.js`
2. **Updated Controller**: New methods in `backend/controllers/judgeController.js`
3. **New Routes**: Added routes in `backend/routes/judges.js`
4. **Database Migration**: Updated `backend/scripts/setupDatabase.js`

### Frontend Changes

1. **Updated Components**: Modified existing judge components to work with new system
2. **New API Calls**: Added methods in `frontend/src/services/judgeService.js`
3. **UI Updates**: Added status tags and review locking functionality

## Security Features

1. **Authorization**: All endpoints require proper role-based authorization
2. **Review Locking**: Prevents duplicate reviews by the same judge
3. **Data Validation**: Score validation (0-100 range)
4. **Audit Logging**: All review submissions are logged

## Testing

Run the test script to verify the system:
```bash
cd backend
node test-judge-system.js
```

## Setup Instructions

1. **Database Setup**:
   ```bash
   cd backend
   node scripts/setupDatabase.js
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage Example

### For Organizers:
1. Create an event
2. Add judges to the event
3. Wait for participants to submit projects
4. Click "Assign Submissions to Judges" to distribute submissions
5. Monitor review progress and view final results

### For Judges:
1. Log in to judge dashboard
2. Select an event to see assigned submissions
3. Click "Start Review" on an assigned submission
4. Fill out the scoring form with criteria and feedback
5. Submit review (submission becomes locked)
6. View completed reviews

## Benefits

1. **Fair Evaluation**: Multiple judges review each project
2. **Prevent Bias**: Average scoring reduces individual judge bias
3. **Quality Control**: Detailed feedback from multiple perspectives
4. **Efficiency**: Clear assignment and tracking system
5. **Transparency**: Organizers can see all judge scores and feedback
