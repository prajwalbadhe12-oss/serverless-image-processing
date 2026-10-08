# 🖼️ Serverless Image Processing & Intelligent Resizing Platform

### ⚡ Event-Driven Image Processing using AWS Serverless Architecture

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-REST%20API-black?logo=flask)](https://flask.palletsprojects.com/)
[![Amazon S3](https://img.shields.io/badge/Amazon%20S3-Storage-red?logo=amazon-s3)](https://aws.amazon.com/s3/)
[![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Serverless-orange?logo=awslambda)](https://aws.amazon.com/lambda/)
[![License](https://img.shields.io/badge/License-Portfolio%20Project-lightgrey)](#)

> A professional serverless image processing platform that securely uploads images to Amazon S3, automatically processes them using AWS Lambda and Pillow, and generates optimized thumbnail, medium, and large image variants.

---

# 📌 1. Project Overview

**Serverless Image Processing & Intelligent Resizing Platform** is a full-stack cloud application designed to automate image processing using an **event-driven serverless architecture**.

The application provides a modern React interface where users can upload JPEG and PNG images.

After the upload:

1. The React frontend requests a secure upload URL.
2. Flask generates an Amazon S3 presigned URL.
3. The browser uploads the image directly to S3.
4. S3 generates an `ObjectCreated` event.
5. AWS Lambda automatically processes the image.
6. Pillow validates and resizes the image.
7. Three optimized image variants are generated.
8. Processed images are stored back in S3.
9. The frontend retrieves temporary presigned URLs.
10. Users can preview and download the generated images.

### 🎯 Core Goal

Build a scalable image-processing workflow without maintaining a continuously running image-processing server.

---

# 🏆 2. Project Highlights

| Feature | Implementation |
|---|---|
| 🖼️ Image Upload | React + Presigned S3 URL |
| 🔐 Secure Storage | Private Amazon S3 |
| ⚡ Processing | AWS Lambda |
| 🐍 Image Engine | Python + Pillow |
| 📐 Resizing | Thumbnail / Medium / Large |
| 🔄 Event Trigger | S3 ObjectCreated |
| 🌐 Backend API | Flask REST API |
| 📊 Monitoring | Amazon CloudWatch |
| 🔑 Permissions | AWS IAM |
| 📱 UI | Responsive React Interface |
| ⏳ Processing Status | Frontend polling |
| ⬇️ Downloads | Temporary S3 presigned URLs |

---

# 🏗️ 3. Application Architecture

```text
                              👤 USER
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    ⚛️ React Frontend   │
                    │       ImageFlow        │
                    └────────────┬───────────┘
                                 │
                          REST API / JSON
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   🐍 Flask Backend     │
                    │      REST API          │
                    └────────────┬───────────┘
                                 │
                         Generate Presigned URL
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │      🪣 Amazon S3      │
                    │        uploads/        │
                    └────────────┬───────────┘
                                 │
                          ObjectCreated Event
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │      ⚡ AWS Lambda      │
                    │    Python + Pillow     │
                    └────────────┬───────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
          ┌────────────┐  ┌────────────┐  ┌────────────┐
          │ 🖼️ Thumb   │  │ 🖼️ Medium  │  │ 🖼️ Large   │
          │ 200 × 200  │  │ 800 × 800  │  │1600 × 1600 │
          └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
                │               │               │
                └───────────────┼───────────────┘
                                ▼
                    ┌────────────────────────┐
                    │      🪣 Amazon S3      │
                    │       processed/       │
                    └────────────┬───────────┘
                                 │
                           Presigned GET
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    ⚛️ React Gallery     │
                    │   👁️ View / ⬇️ Download │
                    └────────────────────────┘

        🔐 IAM ─────────────► Access Control
        📊 CloudWatch ──────► Lambda Logs
```

---

# 🔄 4. End-to-End Workflow

## 1️⃣ Select Image

The user selects a JPEG or PNG image from the React application.

The frontend validates:

- File type
- File extension
- File size
- Supported format

Maximum configured size:

```text
10 MB
```

---

## 2️⃣ Request Upload URL

React sends:

```http
POST /api/upload-url
```

to the Flask backend.

Example:

```json
{
  "filename": "sample.jpg",
  "contentType": "image/jpeg"
}
```

Flask generates a temporary S3 presigned upload URL.

---

## 3️⃣ Direct Upload to S3

The browser uploads the image directly to:

```text
Amazon S3
└── uploads/
```

The Flask server does not need to receive or store the image bytes.

---

## 4️⃣ S3 Event Trigger

When the upload completes:

```text
S3 ObjectCreated
        ↓
AWS Lambda
```

The Lambda function is triggered automatically.

The trigger is configured for the:

```text
uploads/
```

prefix.

Processed images are written under:

```text
processed/
```

which prevents recursive Lambda invocation.

---

## 5️⃣ Validate Image

Lambda:

- Downloads the image.
- Checks whether the file exists.
- Validates the image.
- Checks supported format.
- Processes the image using Pillow.

Supported formats:

```text
JPEG
PNG
```

---

## 6️⃣ Generate Variants

Lambda generates:

```text
🖼️ Thumbnail → 200 × 200
🖼️ Medium    → 800 × 800
🖼️ Large     → 1600 × 1600
```

The original aspect ratio is preserved.

---

## 7️⃣ Store Processed Images

Generated files are uploaded to:

```text
processed/
├── thumbnail/
├── medium/
└── large/
```

---

## 8️⃣ Retrieve Results

The React application requests processed image URLs through:

```http
POST /api/processed-url
```

The Flask backend verifies that the object exists before returning a temporary presigned download URL.

---

## 9️⃣ Display & Download

The frontend displays:

- 🖼️ Image preview
- 📐 Dimensions
- 📄 Image name
- 👁️ View button
- ⬇️ Download button

---

# ☁️ 5. AWS Services Used

Only the AWS services used by the current implementation are listed here.

| AWS Service | Purpose |
|---|---|
| 🪣 **Amazon S3** | Original and processed image storage |
| ⚡ **AWS Lambda** | Automatic image processing |
| 🔐 **AWS IAM** | Lambda access permissions |
| 📊 **Amazon CloudWatch** | Lambda execution logs |

---

## 🪣 Amazon S3

Amazon S3 acts as the application's object storage layer.

### Responsibilities

- Store uploaded images.
- Trigger Lambda processing.
- Store processed variants.
- Provide presigned upload URLs.
- Provide presigned download URLs.
- Keep images private.
- Apply server-side encryption.

### Bucket

```text
serverless-image-processing-2026
```

### Region

```text
ap-south-1
```

### Storage Structure

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

# ⚡ 6. AWS Lambda

AWS Lambda is the image-processing engine.

### Lambda Responsibilities

```text
Receive S3 Event
      ↓
Read Image
      ↓
Validate Image
      ↓
Open Using Pillow
      ↓
Resize Image
      ↓
Generate 3 Variants
      ↓
Upload Results to S3
      ↓
Write CloudWatch Logs
```

### Runtime

```text
Python 3.14
```

### Image Processing Library

```text
Pillow
```

A Lambda-compatible Pillow layer is used to provide the required native image-processing components.

---

# 🔐 7. AWS IAM

IAM controls what the Lambda function can access.

The Lambda execution role provides required permissions for:

```text
S3 Read:
uploads/*

S3 Write:
processed/*
```

The role also uses:

```text
AWSLambdaBasicExecutionRole
```

for CloudWatch logging.

### 🔒 Least Privilege

The Lambda function does not require unrestricted access to the entire AWS account or S3 bucket.

---

# 📊 8. Amazon CloudWatch

CloudWatch provides visibility into Lambda execution.

The application logs information such as:

- Lambda execution
- Source S3 object
- Image format
- Image dimensions
- Generated variants
- Processing status
- Processing errors
- Runtime diagnostics

Example workflow:

```text
S3 Event
   ↓
Lambda
   ↓
CloudWatch Logs
```

---

# 🖼️ 9. Image Processing

The project generates three optimized versions.

| Variant | Maximum Size | Intended Usage |
|---|---:|---|
| 🖼️ Thumbnail | 200 × 200 | Small previews |
| 🖼️ Medium | 800 × 800 | Standard web display |
| 🖼️ Large | 1600 × 1600 | High-resolution display |

### 📐 Aspect Ratio

The application uses Pillow resizing while preserving the original image aspect ratio.

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

---

# 🔐 10. Security

Security is implemented throughout the workflow.

## 🛡️ S3 Security

- 🔒 Block Public Access enabled
- 🔒 Private bucket
- 🔐 ACLs disabled
- 🔐 Server-side encryption enabled

---

## 🔑 Presigned URLs

The frontend does not receive permanent AWS credentials.

Temporary URLs are generated for:

```text
Upload
Download
```

Upload URL expiration:

```text
300 seconds
```

Processed-image download URLs are also temporary.

---

## 🔐 IAM Permissions

Lambda receives only the permissions required for:

```text
uploads/*
processed/*
```

---

## 🛡️ Input Validation

The system validates:

- Empty files
- File size
- File extension
- Image format
- Corrupted image files

---

## 🌐 CORS

S3 CORS is configured for the React development origin:

```text
http://localhost:5173
```

The Flask API also restricts allowed frontend origins.

---

# ⚠️ 11. Failure Handling

The application is designed to handle common processing failures.

### ❌ Invalid Image

```text
Invalid / Corrupted Image
        ↓
Lambda Validation Error
        ↓
CloudWatch Log
```

---

### ❌ Unsupported Format

Only:

```text
JPEG
PNG
```

are supported.

Unsupported formats are rejected.

---

### ❌ File Too Large

Files above:

```text
10 MB
```

are rejected by the application.

---

### ❌ Lambda Processing Failure

If Lambda encounters an error:

- Processing fails safely.
- Error information is logged.
- CloudWatch contains execution details.
- The frontend does not falsely report successful processing.

---

### ⏳ Output Not Ready

The backend checks whether the processed object exists.

If it is still being generated:

```http
404
```

is returned.

Example:

```json
{
  "error": "Processed image is not ready yet."
}
```

The React frontend continues polling until the processed images become available or the retry limit is reached.

---

# 🔌 12. REST API

The Flask backend exposes three primary endpoints.

---

## ❤️ Health Check

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

---

## 📤 Generate Upload URL

```http
POST /api/upload-url
```

### Request

```json
{
  "filename": "sample.jpg",
  "contentType": "image/jpeg"
}
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

## 📥 Generate Processed Image URL

```http
POST /api/processed-url
```

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

# ⚛️ 13. Frontend — ImageFlow

The frontend application is named:

```text
ImageFlow
```

### Main UI Components

```text
┌───────────────────────────────────────────┐
│             🖼️ ImageFlow                  │
│       AWS Serverless Image Platform       │
├───────────────────────────────────────────┤
│                                           │
│           📤 Upload Image                 │
│                                           │
│      [ Select JPEG / PNG Image ]          │
│                                           │
│             [ Process Image ]             │
│                                           │
├───────────────────────────────────────────┤
│          ⚙️ Processing Pipeline           │
│                                           │
│  Upload → Lambda → Variants → Complete    │
│                                           │
├───────────────────────────────────────────┤
│          📊 Processing Details            │
│                                           │
│ Original File    Format    File Size      │
│ AWS Region       Variants  Status         │
│                                           │
├───────────────────────────────────────────┤
│        🖼️ Generated Image Variants        │
│                                           │
│  Thumbnail     Medium       Large         │
│  [Preview]     [Preview]    [Preview]     │
│                                           │
│  👁️ View       👁️ View      👁️ View       │
│  ⬇️ Download    ⬇️ Download  ⬇️ Download   │
└───────────────────────────────────────────┘
```

---

# 🧰 14. Technology Stack

## 🎨 Frontend

- ⚛️ React.js
- ⚡ Vite
- JavaScript
- CSS
- Lucide React

## 🐍 Backend

- Python
- Flask
- Boto3
- Flask-CORS
- python-dotenv

## 🖼️ Image Processing

- Pillow

## ☁️ AWS

- Amazon S3
- AWS Lambda
- AWS IAM
- Amazon CloudWatch

## 🛠️ Development

- Git
- GitHub
- VS Code
- PowerShell

---

# 📁 15. Project Structure

```text
serverless-image-processing/
│
├── 📁 backend/
│   ├── app.py
│   └── .env
│
├── 📁 frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── 📁 infrastructure/
│   └── README.md
│
├── 📁 lambda/
│   ├── __init__.py
│   ├── image_processor.py
│   ├── lambda_function.py
│   └── requirements.txt
│
├── 📁 tests/
│   ├── test_image_processor.py
│   └── test_lambda_function.py
│
├── 📁 screenshots/
│   ├── frontend/
│   ├── aws/
│   └── processing/
│
├── .gitignore
├── README.md
├── requirements-dev.txt
└── index.html
```

> 📸 The `screenshots/` directory is maintained separately from the README and contains project evidence captured during development and AWS configuration.

> 🔒 `.env`, generated ZIP packages, build directories, and dependency folders are excluded from Git using `.gitignore`.

---

# 💻 16. Local Development

## 📋 Prerequisites

Install:

- Python 3.x
- Node.js
- npm
- Git
- AWS CLI
- AWS account

---

## 📥 Clone Repository

```powershell
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd serverless-image-processing
```

---

# 🐍 17. Backend Setup

Navigate to:

```powershell
cd backend
```

Create virtual environment:

```powershell
python -m venv .venv
```

Activate:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install flask boto3 flask-cors python-dotenv
```

---

## ⚙️ Configure Environment

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

⚠️ Never commit `.env` to Git.

---

## ▶️ Start Backend

```powershell
python app.py
```

Backend:

```text
http://127.0.0.1:5001
```

Health endpoint:

```text
http://127.0.0.1:5001/health
```

---

# ⚛️ 18. Frontend Setup

Open a new terminal:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🧪 19. Testing & Validation

The project was validated across application, AWS, and frontend workflows.

## 🧪 Image Processing Tests

Tested scenarios include:

- ✅ JPEG validation
- ✅ PNG validation
- ✅ Invalid image handling
- ✅ Image resizing
- ✅ Aspect ratio preservation
- ✅ Multiple image variants

---

## ☁️ AWS Integration Test

Verified workflow:

```text
📤 Upload Image
      ↓
🪣 S3 uploads/
      ↓
⚡ ObjectCreated Event
      ↓
⚡ Lambda
      ↓
🖼️ Pillow
      ↓
┌──────────┬──────────┬──────────┐
│Thumbnail │  Medium  │   Large  │
└──────────┴──────────┴──────────┘
      ↓
🪣 S3 processed/
```

---

## ✅ Verified Example

Test image:

```text
Format: PNG
Original: 1920 × 867
```

Generated:

```text
Thumbnail: 200 × 90
Medium:    800 × 361
Large:     1600 × 723
```

---

## 🌐 Frontend Integration Test

The complete workflow was verified:

```text
Select Image
     ↓
Request Upload URL
     ↓
Upload Directly to S3
     ↓
S3 ObjectCreated Event
     ↓
Lambda Processing
     ↓
Wait for Processed Objects
     ↓
Generate Presigned URLs
     ↓
Display Image Variants
     ↓
View / Download
```

---

# 🖼️ 20. Architecture Diagram

```text
                              👤 USER
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │     ⚛️ React App       │
                    │       ImageFlow        │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    🐍 Flask REST API   │
                    └────────────┬───────────┘
                                 │
                         🔐 Presigned URL
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │       🪣 S3            │
                    │       uploads/         │
                    └────────────┬───────────┘
                                 │
                         ⚡ ObjectCreated
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │      ⚡ Lambda          │
                    │    Python + Pillow     │
                    └────────────┬───────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
            🖼️ 200×200      🖼️ 800×800      🖼️ 1600×1600
             Thumbnail         Medium            Large
                 │               │               │
                 └───────────────┼───────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │       🪣 S3            │
                    │      processed/        │
                    └────────────┬───────────┘
                                 │
                           🔐 Presigned URL
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │     ⚛️ React Gallery    │
                    │    👁️ View / Download   │
                    └────────────────────────┘

             🔐 IAM ───────► Permissions
             📊 CloudWatch ─► Monitoring
```

---

# 🎤 21. Project Demonstration

Use the following flow when explaining the project in an interview or presentation.

### 💡 Step 1 — Explain the Problem

> “Image processing can consume significant application resources when handled synchronously by a traditional backend.”

### 💡 Step 2 — Explain the Solution

> “I designed an event-driven serverless architecture where Amazon S3 handles storage and AWS Lambda automatically processes uploaded images.”

### 💡 Step 3 — Explain Upload

> “The React frontend requests a presigned upload URL from Flask and uploads the image directly to S3.”

### 💡 Step 4 — Explain Event Trigger

> “When the image is uploaded to the uploads prefix, S3 generates an ObjectCreated event that invokes Lambda.”

### 💡 Step 5 — Explain Processing

> “Lambda uses Python and Pillow to validate the image and generate three versions: thumbnail, medium, and large.”

### 💡 Step 6 — Explain Storage

> “The processed variants are stored under separate S3 prefixes.”

### 💡 Step 7 — Explain Security

> “The S3 bucket remains private, and temporary presigned URLs are used instead of exposing permanent public URLs.”

### 💡 Step 8 — Explain Monitoring

> “Lambda execution information and failures can be inspected using CloudWatch logs.”

---

# 🛡️ 22. Why Serverless Architecture?

The project uses a serverless architecture because image processing is naturally suited to asynchronous event-driven execution.

### Traditional Approach

```text
User
 ↓
Application Server
 ↓
Image Processing
 ↓
Storage
```

The application server remains responsible for processing workloads.

### Serverless Approach

```text
User
 ↓
S3
 ↓
Event
 ↓
Lambda
 ↓
Processed S3 Objects
```

### Benefits

- ⚡ Event-driven execution
- 📈 Automatic scalability
- 💰 No continuously running processing server
- 🔧 Reduced infrastructure management
- 🔄 Independent image-processing workflow

---

# 🚀 23. Production Improvements

The current implementation is a functional serverless portfolio project.

Possible future enhancements include:

### 🖼️ Image Features

- WebP output
- Advanced compression
- Metadata extraction
- Additional image formats

### 🔐 Security

- User authentication
- Fine-grained authorization
- Enhanced API protection

### 📊 Data & Monitoring

- Persistent processing history
- Advanced monitoring
- Automated alerting

### ☁️ Cloud Architecture

- CDN-based image delivery
- Infrastructure as Code
- Automated deployment

> ⚠️ These are future improvements and are **not currently implemented** in this project.

---

# 📚 24. Learning Outcomes

This project demonstrates practical experience with:

### ☁️ AWS Cloud

- Amazon S3
- AWS Lambda
- IAM
- CloudWatch
- S3 event-driven architecture
- Presigned URLs

### 🐍 Backend Development

- Python
- Flask
- REST APIs
- Boto3
- CORS
- Environment configuration

### 🖼️ Image Processing

- Pillow
- Image validation
- Image resizing
- Image format handling
- Aspect-ratio preservation

### ⚛️ Frontend Development

- React
- Vite
- API integration
- File uploads
- Responsive UI
- Async processing states

### 🏗️ Architecture

- Serverless architecture
- Event-driven design
- Secure object storage
- Least-privilege IAM
- Asynchronous processing
- Cloud monitoring

---

# 📋 25. Project Submission Checklist

## 🎨 Application

- [x] React frontend
- [x] Flask backend
- [x] Image upload
- [x] JPEG support
- [x] PNG support
- [x] File validation
- [x] File-size validation
- [x] Processing pipeline
- [x] Processing details
- [x] Generated image gallery
- [x] Image preview
- [x] Image download

## ☁️ AWS

- [x] S3 bucket
- [x] S3 upload prefix
- [x] S3 processed prefixes
- [x] S3 ObjectCreated trigger
- [x] Lambda function
- [x] Pillow Lambda layer
- [x] IAM execution role
- [x] CloudWatch logging
- [x] S3 CORS configuration
- [x] Private S3 storage

## 🧪 Testing

- [x] PNG processing
- [x] Image validation
- [x] Image resizing
- [x] Thumbnail generation
- [x] Medium generation
- [x] Large generation
- [x] S3 trigger verification
- [x] Frontend integration
- [x] Presigned upload
- [x] Presigned download
- [x] Error handling

## 📦 GitHub

- [x] Git repository
- [x] `.gitignore`
- [x] Environment files excluded
- [x] Build artifacts excluded
- [x] Lambda packages excluded
- [x] README documentation
- [x] Source code committed

---

# 📊 26. Project Information

| Category | Details |
|---|---|
| 🏷️ Project | Serverless Image Processing & Intelligent Resizing Platform |
| 🏗️ Architecture | Event-Driven Serverless |
| ⚛️ Frontend | React.js + Vite |
| 🐍 Backend | Python + Flask |
| 🖼️ Processing | Pillow |
| 🪣 Storage | Amazon S3 |
| ⚡ Compute | AWS Lambda |
| 🔐 Security | AWS IAM |
| 📊 Monitoring | Amazon CloudWatch |
| 🌍 AWS Region | `ap-south-1` |
| 🖼️ Formats | JPEG, PNG |
| 📦 Maximum File Size | 10 MB |
| 🖼️ Variants | Thumbnail, Medium, Large |
| 📐 Thumbnail | 200 × 200 |
| 📐 Medium | 800 × 800 |
| 📐 Large | 1600 × 1600 |
| 🔗 API | Flask REST API |
| 📦 Repository | Git / GitHub |
| 🎯 Project Type | Full-Stack Cloud / Serverless |

---

# ⭐ 27. Key Technical Takeaways

```text
┌───────────────────────────────────────────────────┐
│             SERVERLESS IMAGE PLATFORM              │
├───────────────────────────────────────────────────┤
│                                                   │
│  ⚛️ React       → User Interface                 │
│  🐍 Flask       → REST API                       │
│  🔐 Presigned  → Secure S3 Access                │
│  🪣 S3         → Object Storage                  │
│  ⚡ Lambda      → Image Processing               │
│  🖼️ Pillow     → Image Transformation            │
│  🔑 IAM        → Access Control                  │
│  📊 CloudWatch → Monitoring                      │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

# 👨‍💻 28. Final Project Summary

**Serverless Image Processing & Intelligent Resizing Platform** demonstrates how a modern full-stack application can use AWS serverless services to build an automated image-processing workflow.

The complete architecture follows:

```text
⚛️ React
   ↓
🐍 Flask REST API
   ↓
🔐 Presigned S3 Upload
   ↓
🪣 Amazon S3
   ↓
⚡ S3 ObjectCreated Event
   ↓
⚡ AWS Lambda
   ↓
🖼️ Python + Pillow
   ↓
┌─────────────┬─────────────┬─────────────┐
│ 🖼️ Thumbnail│ 🖼️ Medium   │ 🖼️ Large    │
│ 200 × 200   │ 800 × 800   │ 1600 × 1600 │
└─────────────┴─────────────┴─────────────┘
   ↓
🪣 Amazon S3
   ↓
🔐 Presigned GET URL
   ↓
⚛️ React Gallery
   ↓
👁️ View / ⬇️ Download
```

The project demonstrates practical skills in:

**AWS Serverless Architecture • Amazon S3 • AWS Lambda • IAM • CloudWatch • Python • Flask • Pillow • React • REST APIs • Secure File Uploads • Event-Driven Processing • Cloud Application Development**

---

## 🚀 Built for Cloud Engineering & Full-Stack Portfolio Demonstration

**Project:** Serverless Image Processing & Intelligent Resizing Platform  
**Architecture:** Event-Driven Serverless  
**Cloud:** AWS  
**Region:** `ap-south-1`  
**Status:** ✅ Completed & Tested