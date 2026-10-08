import os
import uuid

import boto3
from botocore.exceptions import ClientError
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)


CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }
    },
)


S3_BUCKET = os.environ.get("S3_BUCKET")
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")

UPLOAD_PREFIX = "uploads/"
PROCESSED_PREFIX = "processed/"

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
)


@app.get("/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "serverless-image-processing-api",
    })


@app.post("/api/upload-url")
def create_upload_url():

    data = request.get_json(silent=True) or {}

    filename = data.get("filename")
    content_type = data.get("contentType")

    if not filename or not content_type:
        return jsonify({
            "error": "filename and contentType are required"
        }), 400

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
    }

    if content_type not in allowed_types:
        return jsonify({
            "error": "Only JPEG and PNG images are supported"
        }), 400

    extension = allowed_types[content_type]

    object_name = f"{uuid.uuid4().hex}{extension}"
    object_key = f"{UPLOAD_PREFIX}{object_name}"

    try:
        upload_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=300,
        )

        return jsonify({
            "uploadUrl": upload_url,
            "key": object_key,
            "filename": filename,
            "expiresIn": 300,
        })

    except ClientError:
        app.logger.exception(
            "Failed to generate S3 presigned upload URL"
        )

        return jsonify({
            "error": "Unable to generate upload URL"
        }), 500


@app.post("/api/processed-url")
def create_processed_url():

    data = request.get_json(silent=True) or {}
    key = data.get("key")

    if not key:
        return jsonify({
            "error": "key is required"
        }), 400

    if not key.startswith(PROCESSED_PREFIX):
        return jsonify({
            "error": "Invalid processed image key"
        }), 400

    try:
        s3_client.head_object(
            Bucket=S3_BUCKET,
            Key=key,
        )

        download_url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": key,
            },
            ExpiresIn=300,
        )

        return jsonify({
            "downloadUrl": download_url,
            "key": key,
            "expiresIn": 300,
        })

    except ClientError as exc:

        error_code = (
            exc.response
            .get("Error", {})
            .get("Code")
        )

        if error_code in (
            "404",
            "NoSuchKey",
            "NotFound",
        ):
            return jsonify({
                "error": "Processed image is not ready yet."
            }), 404

        app.logger.exception(
            "Failed to verify processed image"
        )

        return jsonify({
            "error": "Unable to access processed image"
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=False,
    )