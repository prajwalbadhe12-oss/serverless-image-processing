# 🐍 Serverless Image Processing — Backend

### Flask REST API + AWS Lambda + Amazon S3 + Pillow

> Backend and cloud-processing documentation for the Serverless Image Processing & Intelligent Resizing Platform.

---

# 📌 Backend Overview

The backend consists of two main processing layers:

```text
🐍 Flask REST API
        │
        ├── Generate S3 Upload URL
        │
        └── Generate Processed Image URL
```

and:

```text
🪣 Amazon S3
       │
       │ ObjectCreated
       ▼
⚡ AWS Lambda
       │
       ▼
🖼️ Pillow
       │
       ├── Thumbnail
       ├── Medium
       └── Large
       │
       ▼
🪣 Amazon S3
```

The Flask backend handles API operations while AWS Lambda performs asynchronous image processing.

---

# 🎯 Backend Responsibilities

The backend is responsible for:

- 🔌 REST API endpoints
- 🔐 S3 presigned upload URLs
- 🔐 S3 presigned download URLs
- ☁️ S3 integration
- ⚡ Event-driven Lambda processing
- 🖼️ Image validation
- 🖼️ Image resizing
- 📦 Processed object storage
- 🔑 IAM permissions
- 📊 CloudWatch logging
- ⚠️ Error handling

---

# 🏗️ Backend Architecture

```text
                         ⚛️ React
                            │
                            │ REST API
                            ▼
                  ┌─────────────────────┐
                  │ 🐍 Flask API        │
                  │                     │
                  │ /health             │
                  │ /api/upload-url     │
                  │ /api/processed-url  │
                  └──────────┬──────────┘
                             │
                       Boto3 / HTTPS
                             │
                             ▼
                  ┌─────────────────────┐
                  │ 🪣 Amazon S3        │
                  │                     │
                  │ uploads/            │
                  │ processed/          │
                  └──────────┬──────────┘
                             │
                       ObjectCreated
                             │
                             ▼
                  ┌─────────────────────┐
                  │ ⚡ AWS Lambda       │
                  │ Python + Pillow     │
                  └──────────┬──────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
             Thumbnail     Medium        Large
                │            │            │
                └────────────┼────────────┘
                             ▼
                  🪣 S3 processed/
```

---

# 🌐 Flask REST API

The Flask application runs locally on:

```text
http://127.0.0.1:5001
```

---

# ❤️ Health Endpoint

```http
GET /health
```

### Response

```json
{
  "status": "healthy",
  "service": "serverless-image-processing-api"
}
```

This endpoint is used to verify that the Flask backend is running.

---

# 📤 Upload URL Endpoint

```http
POST /api/upload-url
```

The endpoint generates a temporary S3 presigned upload URL.

### Request

```json
{
  "filename": "sample.jpg",
  "contentType": "image/jpeg"
}
```

### Supported Content Types

```text
image/jpeg
image/png
```

### Response

```json
{
  "uploadUrl": "PRESIGNED_S3_URL",
  "key": "uploads/generated-file.jpg",
  "filename": "sample.jpg",
  "expiresIn": 300
}
```

---

# 🔐 Presigned Upload Workflow

```text
React
  │
  │ POST /api/upload-url
  ▼
Flask
  │
  │ Boto3
  ▼
Amazon S3
  │
  │ Presigned PUT URL
  ▼
React
  │
  │ Direct PUT
  ▼
S3 uploads/
```

The Flask server does not receive the image data itself.

---

# 📥 Processed Image URL Endpoint

```http
POST /api/processed-url
```

The endpoint verifies that a processed object exists before generating a temporary download URL.

### Request

```json
{
  "key": "processed/medium/generated-file.jpg"
}
```

### Response

```json
{
  "downloadUrl": "PRESIGNED_S3_URL",
  "key": "processed/medium/generated-file.jpg",
  "expiresIn": 300
}
```

---

# ⏳ Processing Availability

Before generating a download URL, the backend verifies the S3 object using:

```text
head_object()
```

If the object is not available:

```http
404
```

Response:

```json
{
  "error": "Processed image is not ready yet."
}
```

This prevents invalid or broken download URLs.

---

# 🪣 Amazon S3

Configured bucket:

```text
serverless-image-processing-2026
```

Region:

```text
ap-south-1
```

---

# 📁 S3 Structure

```text
serverless-image-processing-2026/
│
├── uploads/
│
└── processed/
    ├── thumbnail/
    ├── medium/
    └── large/
```

---

# 🔄 S3 Event Trigger

The S3 bucket is configured to trigger Lambda for:

```text
ObjectCreated
```

events under:

```text
uploads/
```

### Event Flow

```text
File Upload
    ↓
S3 ObjectCreated
    ↓
Lambda Trigger
    ↓
Image Processing
```

---

# 🛡️ Recursive Trigger Prevention

The Lambda function reads:

```text
uploads/
```

and writes:

```text
processed/
```

Because the processed files are not written back into `uploads/`, they do not trigger the same Lambda workflow again.

```text
uploads/
   ↓
Lambda
   ↓
processed/

No recursive trigger
```

---

# ⚡ AWS Lambda

The Lambda function is the asynchronous image-processing engine.

### Runtime

```text
Python 3.14
```

### Processing Library

```text
Pillow
```

---

# 🔄 Lambda Workflow

```text
S3 ObjectCreated
        ↓
Lambda Handler
        ↓
Read S3 Object
        ↓
Validate Image
        ↓
Open with Pillow
        ↓
Resize Image
        ↓
Generate 3 Variants
        ↓
Upload to S3
        ↓
CloudWatch Logs
```

---

# 🖼️ Image Processing

The processing module generates:

| Variant | Maximum Size |
|---|---:|
| Thumbnail | 200 × 200 |
| Medium | 800 × 800 |
| Large | 1600 × 1600 |

Aspect ratio is preserved.

---

# 🖼️ Image Validation

The image processor validates:

### Empty Files

```text
Empty file
   ↓
Validation Error
```

### Corrupted Images

```text
Corrupted image
   ↓
Validation Error
```

### Supported Formats

```text
JPEG
PNG
```

Unsupported formats are rejected.

---

# 📐 Image Resizing

The processor uses Pillow's thumbnail functionality.

Example:

```text
Original
1920 × 867

       ↓

Thumbnail
200 × 90

       ↓

Medium
800 × 361

       ↓

Large
1600 × 723
```

The original aspect ratio is preserved.

---

# 📦 Processed Output

For an uploaded object:

```text
uploads/image.png
```

Lambda generates:

```text
processed/thumbnail/image.png
processed/medium/image.png
processed/large/image.png
```

---

# 🧩 Lambda Components

The Lambda implementation contains:

```text
lambda/
│
├── __init__.py
├── image_processor.py
├── lambda_function.py
└── requirements.txt
```

---

# 🖼️ `image_processor.py`

Responsible for:

- Image validation
- Format validation
- Image resizing
- Output generation
- Dimension calculation
- Output size calculation

Main processing flow:

```text
validate_image()
       ↓
resize_image()
       ↓
process_image()
```

---

# ⚡ `lambda_function.py`

Responsible for:

- Receiving S3 events
- Reading S3 objects
- Validating file size
- Calling image processor
- Uploading processed variants
- Logging results
- Handling errors

---

# 🔐 IAM Configuration

The Lambda execution role provides access required for processing.

### S3 Read

```text
s3:GetObject
```

Resource:

```text
arn:aws:s3:::serverless-image-processing-2026/uploads/*
```

### S3 Write

```text
s3:PutObject
```

Resource:

```text
arn:aws:s3:::serverless-image-processing-2026/processed/*
```

### CloudWatch

The role also uses:

```text
AWSLambdaBasicExecutionRole
```

for Lambda logging.

---

# 🔒 IAM Least Privilege

The Lambda role does not receive unrestricted S3 permissions.

The permissions are scoped to:

```text
uploads/*
processed/*
```

This follows the least-privilege principle.

---

# 📊 CloudWatch Logging

Lambda writes execution information to CloudWatch.

Logs include:

```text
Lambda execution
S3 object key
Image format
Original dimensions
Generated dimensions
Output sizes
Processing result
Errors
Runtime diagnostics
```

---

# ⚠️ Error Handling

The backend and Lambda layers handle common errors.

## Invalid Image

```text
Invalid Image
      ↓
Lambda Error
      ↓
CloudWatch
```

## Unsupported Format

```text
Unsupported Format
      ↓
Validation Error
```

## Large File

The configured maximum processing size is:

```text
10 MB
```

## S3 Error

AWS SDK errors are captured and logged.

## Lambda Processing Error

Unexpected processing errors are logged to CloudWatch.

---

# 🔐 Security

### S3

- Private bucket
- Block Public Access
- ACLs disabled
- Server-side encryption

### Presigned URLs

Temporary URLs are used for:

```text
Upload
Download
```

### IAM

Lambda permissions are limited to required S3 resources.

### Environment Variables

Configuration is stored outside source code using:

```text
backend/.env
```

Example:

```env
S3_BUCKET=serverless-image-processing-2026
AWS_REGION=ap-south-1
FLASK_ENV=production
```

---

# 🌐 CORS

S3 CORS allows the React development application to upload directly to S3.

Configured origin:

```text
http://localhost:5173
```

Allowed methods include:

```text
PUT
GET
HEAD
```

The Flask API also restricts allowed frontend origins.

---

# 💻 Backend Local Setup

## 1️⃣ Navigate to Backend

```powershell
cd backend
```

---

## 2️⃣ Create Virtual Environment

```powershell
python -m venv .venv
```

---

## 3️⃣ Activate

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## 4️⃣ Install Dependencies

```powershell
pip install flask boto3 flask-cors python-dotenv
```

---

## 5️⃣ Configure `.env`

Create:

```text
backend/.env
```

Add:

```env
S3_BUCKET=serverless-image-processing-2026
AWS_REGION=ap-south-1
FLASK_ENV=production
```

---

## 6️⃣ Start Flask

```powershell
python app.py
```

Backend:

```text
http://127.0.0.1:5001
```

---

# ☁️ AWS Configuration

## Region

```text
ap-south-1
```

## S3 Bucket

```text
serverless-image-processing-2026
```

## Lambda

```text
Python 3.14
```

## S3 Trigger

```text
ObjectCreated
Prefix: uploads/
```

---

# 🧪 Backend Testing

The backend workflow can be tested using:

### Health

```http
GET /health
```

### Upload URL

```http
POST /api/upload-url
```

### Processed URL

```http
POST /api/processed-url
```

---

# 🧪 Lambda Testing

Verified processing workflow:

```text
Upload PNG
      ↓
S3
      ↓
ObjectCreated
      ↓
Lambda
      ↓
Pillow
      ↓
Thumbnail
Medium
Large
```

Example verified output:

```text
Original:
1920 × 867 PNG

Thumbnail:
200 × 90

Medium:
800 × 361

Large:
1600 × 723
```

---

# 🧪 Complete Backend Test

```text
React
  ↓
POST /api/upload-url
  ↓
Flask
  ↓
Presigned URL
  ↓
S3 Upload
  ↓
ObjectCreated
  ↓
Lambda
  ↓
Validate
  ↓
Pillow
  ↓
Generate Variants
  ↓
S3 processed/
  ↓
POST /api/processed-url
  ↓
Presigned GET URL
```

---

# 📁 Backend Project Structure

```text
backend/
│
├── app.py
├── .env
└── README.md
```

Lambda source:

```text
lambda/
│
├── __init__.py
├── image_processor.py
├── lambda_function.py
└── requirements.txt
```

---

# 📸 Backend / AWS Screenshots

Screenshots are maintained separately from this documentation.

Recommended locations:

```text
screenshots/aws/
```

and:

```text
screenshots/processing/
```

Example:

```text
screenshots/
├── aws/
│   ├── s3-bucket.png
│   ├── s3-upload-folder.png
│   ├── s3-processed-folder.png
│   ├── s3-event-trigger.png
│   ├── lambda-function.png
│   ├── iam-permissions.png
│   └── cloudwatch-logs.png
│
└── processing/
    ├── original-image.png
    ├── thumbnail.png
    ├── medium.png
    └── large.png
```

---

# 🔗 Related Documentation

### Universal Project Documentation

📘 [`../README.md`](../README.md)

### Frontend Documentation

⚛️ [`../frontend/README.md`](../frontend/README.md)

---

# 📊 Backend Summary

| Category | Details |
|---|---|
| 🐍 Backend | Flask |
| 🔌 API | REST |
| ☁️ Storage | Amazon S3 |
| ⚡ Processing | AWS Lambda |
| 🖼️ Library | Pillow |
| 🔐 Access | IAM |
| 📊 Logs | CloudWatch |
| 🌍 Region | `ap-south-1` |
| 🖼️ Formats | JPEG, PNG |
| 📦 Max File Size | 10 MB |
| 🖼️ Variants | 3 |
| 🔗 Upload | Presigned URL |
| ⬇️ Download | Presigned URL |

---

# ⭐ Backend Technical Summary

```text
                 🐍 FLASK
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
 /api/upload-url       /api/processed-url
        │                       │
        ▼                       ▼
   🔐 Presigned             🔐 Presigned
      PUT                       GET
        │                       │
        ▼                       │
    🪣 S3 uploads/              │
        │                       │
        ▼                       │
 ⚡ ObjectCreated               │
        │                       │
        ▼                       │
   ⚡ Lambda                    │
        │                       │
        ▼                       │
   🖼️ Pillow                   │
        │                       │
        ├── Thumbnail           │
        ├── Medium              │
        └── Large               │
        │                       │
        ▼                       │
 🪣 S3 processed/ ──────────────┘
```

---

# 👨‍💻 Backend Summary

The backend provides the secure API and serverless processing layer for the ImageFlow application.

The architecture separates:

```text
🐍 API Responsibilities
```

from:

```text
⚡ Image Processing Responsibilities
```

This allows the Flask API to remain lightweight while AWS Lambda performs image processing asynchronously.

**Backend Status:** ✅ Completed & Tested