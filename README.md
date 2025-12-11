# E-Sign Backend API

A lightweight PDF signing service with cloud storage.

## Quick Start

```bash
npm install
npm start
```

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

**Get PDF**

```
GET /api/v1/get-pdf?id={documentId}
```

**Sign PDF**

```
POST /api/v1/sign-pdf
Body: {
  documentId: string,
  signatures: [{
    x: number,
    y: number,
    imageUrl: string
  }]
}
```

## Stack

Node.js • Express • MongoDB • Cloudinary • pdf-lib
