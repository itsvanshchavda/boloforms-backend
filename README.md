# E-Sign Backend API

PDF signing service that adds text, signatures, images, dates, and radio buttons to PDFs.

## Quick Start

```bash
npm install
npm start
```

Place your PDF at `sample.pdf` in the root directory.

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/esign
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## API Endpoints

**Health Check**

```
GET /health
```

**Get Signed PDF**

```
GET /api/v1/get-pdf
```

Returns the signed PDF document stored in the database.

**Sign PDF**

```
POST /api/v1/sign-pdf
Content-Type: application/json

{
  "fields": [
    {
      "type": "text",
      "value": "John Doe",
      "page": 1,
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 30
    },
    {
      "type": "signature",
      "value": "data:image/png;base64,...",
      "page": 1,
      "x": 100,
      "y": 300,
      "width": 200,
      "height": 60
    },
    {
      "type": "date",
      "value": "2025-12-11",
      "page": 1,
      "x": 100,
      "y": 400,
      "width": 120,
      "height": 25
    },
    {
      "type": "radio",
      "value": "yes",
      "radioOptions": ["yes", "no"],
      "page": 1,
      "x": 100,
      "y": 500,
      "width": 150,
      "height": 25
    }
  ]
}
```

**Field Types:** `text`, `signature`, `image`, `date`, `radio`

**Response:**

```json
{
  "success": true,
  "message": "PDF signed successfully",
  "document": {
    "fileName": "signed_1234567890_sample.pdf",
    "pdfUrl": "https://cloudinary.com/...",
    "originalPdfHash": "...",
    "signedPdfHash": "...",
    "signedAt": "2025-12-11T..."
  }
}
```

## Stack

Node.js • Express • MongoDB • Cloudinary • pdf-lib
