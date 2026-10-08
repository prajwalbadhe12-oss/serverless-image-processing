# ⚛️ ImageFlow — Frontend

### Modern React Interface for Serverless Image Processing

> ImageFlow is the React-based frontend for the Serverless Image Processing & Intelligent Resizing Platform.

---

# 📌 Frontend Overview

The ImageFlow frontend provides the user interface for uploading images, monitoring processing progress, viewing generated image variants, and downloading processed images.

The frontend communicates with the Flask backend to obtain secure S3 presigned URLs.

Images are uploaded directly from the browser to Amazon S3.

```text
User
 │
 ▼
⚛️ React / ImageFlow
 │
 │ REST API
 ▼
🐍 Flask Backend
 │
 │ Presigned URL
 ▼
🪣 Amazon S3
```

---

# 🎯 Frontend Responsibilities

The frontend is responsible for:

- 📤 Image selection
- 🔍 Client-side validation
- 🔐 Requesting presigned upload URLs
- ☁️ Direct S3 upload
- ⏳ Processing status
- 🔄 Polling for processed images
- 🖼️ Displaying image variants
- 👁️ Previewing images
- ⬇️ Downloading processed images
- 📊 Displaying processing details
- 📱 Responsive user interface

---

# 🏗️ Frontend Architecture

```text
                         👤 USER
                            │
                            ▼
                ┌──────────────────────┐
                │    ⚛️ ImageFlow      │
                │    React Frontend    │
                └──────────┬───────────┘
                           │
                           │ REST API
                           ▼
                ┌──────────────────────┐
                │   🐍 Flask Backend   │
                └──────────┬───────────┘
                           │
                     Presigned URL
                           │
                           ▼
                ┌──────────────────────┐
                │     🪣 Amazon S3     │
                └──────────┬───────────┘
                           │
                    Processed Images
                           │
                           ▼
                ┌──────────────────────┐
                │    ⚛️ Image Gallery   │
                └──────────────────────┘
```

---

# 🔄 Upload Workflow

The frontend follows this workflow:

```text
1️⃣ User selects image
        ↓
2️⃣ Validate file
        ↓
3️⃣ Request presigned URL
        ↓
4️⃣ Upload directly to S3
        ↓
5️⃣ Wait for Lambda processing
        ↓
6️⃣ Poll processed-image API
        ↓
7️⃣ Receive presigned URLs
        ↓
8️⃣ Display variants
        ↓
9️⃣ View / Download
```

---

# 🖼️ Supported Images

The frontend currently supports:

```text
JPEG
PNG
```

Maximum file size:

```text
10 MB
```

---

# 🔍 Client-Side Validation

Before uploading, the frontend validates:

### File Type

Allowed:

```text
image/jpeg
image/png
```

### File Size

Maximum:

```text
10 MB
```

Invalid files are rejected before an API request is made.

---

# 🔐 Presigned Upload

The frontend does not contain AWS credentials.

Instead, it requests a temporary upload URL from Flask.

### Request

```http
POST http://127.0.0.1:5001/api/upload-url
```

Example:

```json
{
  "filename": "sample.jpg",
  "contentType": "image/jpeg"
}
```

The backend returns:

```json
{
  "uploadUrl": "PRESIGNED_S3_URL",
  "key": "uploads/generated-file.jpg",
  "filename": "sample.jpg",
  "expiresIn": 300
}
```

The frontend then performs a direct:

```http
PUT
```

request to S3.

---

# ☁️ Direct S3 Upload

The browser sends the image directly to S3.

```text
React
  │
  │ PUT
  ▼
Amazon S3
```

This prevents the Flask server from becoming responsible for transferring large image files.

---

# ⚙️ Processing Pipeline

The frontend provides a visual processing pipeline.

```text
┌──────────────────────────────────────────┐
│         ⚙️ PROCESSING PIPELINE           │
├──────────────────────────────────────────┤
│                                          │
│  📤 Upload                               │
│      ↓                                   │
│  ☁️ S3 Storage                           │
│      ↓                                   │
│  ⚡ Lambda Processing                    │
│      ↓                                   │
│  🖼️ Generate Variants                    │
│      ↓                                   │
│  ✅ Processing Complete                 │
│                                          │
└──────────────────────────────────────────┘
```

---

# ⏳ Processing Status

Because Lambda processing occurs asynchronously, the frontend does not assume that processing is immediately complete.

After uploading:

```text
Upload Complete
      ↓
Lambda Processing
      ↓
Wait / Poll
      ↓
Processed Objects Available
      ↓
Display Results
```

The frontend polls the backend for processed image availability.

---

# 🔄 Processed Image Polling

The frontend calls:

```http
POST /api/processed-url
```

for the expected processed image objects.

If the object is not ready:

```http
404
```

the frontend waits and retries.

This prevents broken image previews from appearing while Lambda is still processing.

---

# 🖼️ Generated Image Gallery

The frontend displays three variants:

| Variant | Maximum Size |
|---|---:|
| 🖼️ Thumbnail | 200 × 200 |
| 🖼️ Medium | 800 × 800 |
| 🖼️ Large | 1600 × 1600 |

Each result card contains:

- Image preview
- Variant name
- Dimensions
- View button
- Download button

---

# 📊 Processing Details

The UI displays:

```text
Original File
Format
File Size
AWS Region
Variants Generated
Processing Status
```

Example:

```text
Original File: image.png
Format: PNG
File Size: 245 KB
AWS Region: ap-south-1
Variants: 3
Status: Completed
```

---

# 🎨 User Interface

The ImageFlow interface contains:

```text
┌───────────────────────────────────────────┐
│             🖼️ ImageFlow                  │
│        AWS Connected                      │
├───────────────────────────────────────────┤
│                                           │
│            📤 Upload Image                │
│                                           │
│       Select JPEG / PNG Image             │
│                                           │
│           [ Process Image ]               │
│                                           │
├───────────────────────────────────────────┤
│           ⚙️ Processing Pipeline          │
├───────────────────────────────────────────┤
│           📊 Processing Details           │
├───────────────────────────────────────────┤
│        🖼️ Generated Variants              │
│                                           │
│ Thumbnail │ Medium │ Large                │
│                                           │
│ 👁️ View   │ 👁️ View │ 👁️ View             │
│ ⬇️ Download│⬇️ Download│⬇️ Download       │
└───────────────────────────────────────────┘
```

---

# 📁 Frontend Project Structure

```text
frontend/
│
├── 📁 public/
│
├── 📁 src/
│   ├── 📁 assets/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

# 🧰 Frontend Technology Stack

| Technology | Purpose |
|---|---|
| ⚛️ React | UI development |
| ⚡ Vite | Frontend development/build tool |
| JavaScript | Application logic |
| CSS | UI styling |
| Lucide React | UI icons |
| Fetch API | Backend/S3 communication |

---

# 🔌 Backend API Integration

The frontend communicates with:

```text
http://127.0.0.1:5001
```

### Health

```http
GET /health
```

### Upload URL

```http
POST /api/upload-url
```

### Processed Image URL

```http
POST /api/processed-url
```

---

# 🔐 Frontend Security

The frontend follows these security principles:

- ❌ No AWS access keys stored in React.
- 🔐 Uses temporary presigned URLs.
- 🔐 Does not expose permanent S3 URLs.
- 🛡️ Validates file type.
- 🛡️ Validates file size.
- 🌐 Uses restricted backend CORS configuration.

---

# ⚙️ Configuration

The current frontend API endpoint is configured to communicate with:

```text
http://127.0.0.1:5001
```

Frontend development server:

```text
http://localhost:5173
```

---

# 💻 Local Development

## Prerequisites

Install:

- Node.js
- npm
- Git

---

## Install Dependencies

From the frontend directory:

```powershell
npm install
```

---

## Start Development Server

```powershell
npm run dev
```

Application:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

Create a production build using:

```powershell
npm run build
```

The production output is generated in:

```text
dist/
```

---

# 🧪 Frontend Testing

The frontend workflow should be validated using:

### Upload

- [x] JPEG upload
- [x] PNG upload
- [x] Invalid file rejection
- [x] Large file rejection

### Processing

- [x] Upload URL generation
- [x] Direct S3 upload
- [x] Processing status
- [x] Polling
- [x] Variant retrieval

### Gallery

- [x] Thumbnail preview
- [x] Medium preview
- [x] Large preview
- [x] View button
- [x] Download button

---

# ⚠️ Error Handling

The frontend handles:

```text
Invalid File
      ↓
Display Error
```

```text
Upload Failure
      ↓
Display Error
```

```text
Processing Failure
      ↓
Display Error
```

```text
Processing Not Ready
      ↓
Continue Polling
```

---

# 📱 Responsive Design

The frontend is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

The generated image cards use a responsive layout.

---

# 📸 Frontend Screenshots

Frontend screenshots are intentionally maintained separately.

Recommended location:

```text
screenshots/frontend/
```

Example:

```text
screenshots/frontend/
├── homepage.png
├── image-upload.png
├── processing-pipeline.png
├── processing-details.png
└── generated-variants.png
```

---

# 🔗 Related Documentation

### Universal Project Documentation

📘 [`../README.md`](../README.md)

### Backend Documentation

🐍 [`../backend/README.md`](../backend/README.md)

---

# 📊 Frontend Summary

| Category | Details |
|---|---|
| ⚛️ Framework | React |
| ⚡ Build Tool | Vite |
| 🎨 UI | ImageFlow |
| 🖼️ Supported Images | JPEG, PNG |
| 📦 Maximum File Size | 10 MB |
| 🔐 Upload | S3 Presigned URL |
| ⏳ Processing | Polling |
| 🖼️ Results | 3 variants |
| 🌐 Backend | Flask REST API |
| 📱 Responsive | Yes |
| 📍 Development URL | `http://localhost:5173` |

---

# 👨‍💻 Frontend Summary

The ImageFlow frontend provides a secure and user-friendly interface for the serverless image processing platform.

Its primary responsibilities are:

```text
📤 Upload
   ↓
🔐 Secure URL
   ↓
☁️ Direct S3 Upload
   ↓
⏳ Wait for Processing
   ↓
🖼️ Retrieve Variants
   ↓
👁️ View
   ↓
⬇️ Download
```

**Frontend Status:** ✅ Completed & Tested