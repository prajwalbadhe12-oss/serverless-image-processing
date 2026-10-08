
import json
import logging
import os
import sys
from urllib.parse import unquote_plus

import boto3

try:
    from .image_processor import process_image
except ImportError:
    from image_processor import process_image


logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client("s3")

INPUT_PREFIX = "uploads/"
OUTPUT_PREFIX = "processed/"

MAX_FILE_SIZE = int(
    os.environ.get(
        "MAX_FILE_SIZE",
        10 * 1024 * 1024,
    )
)


def lambda_handler(event, context):
    """
    AWS Lambda entry point.
    Triggered by an Amazon S3 ObjectCreated event.
    """

    # Temporary diagnostics.
    logger.info("Python version: %s", sys.version)
    logger.info("Python path: %s", sys.path)
    logger.info(
        "LD_LIBRARY_PATH: %s",
        os.environ.get("LD_LIBRARY_PATH"),
    )
    logger.info(
        "PYTHONPATH: %s",
        os.environ.get("PYTHONPATH"),
    )

    logger.info("Image processing Lambda started.")
    logger.info(
        "Received event: %s",
        json.dumps(event),
    )

    records = event.get("Records", [])

    if not records:
        logger.warning("No S3 records found in event.")

        return {
            "statusCode": 400,
            "body": json.dumps(
                {
                    "message": "No S3 records found."
                }
            ),
        }

    results = []

    for record in records:
        try:
            result = process_s3_record(record)
            results.append(result)

        except Exception as exc:
            logger.exception(
                "Failed to process S3 record: %s",
                exc,
            )

            results.append(
                {
                    "status": "failed",
                    "error": str(exc),
                }
            )

    logger.info("Image processing Lambda completed.")

    return {
        "statusCode": 200,
        "body": json.dumps(
            {
                "results": results,
            }
        ),
    }


def process_s3_record(record):
    """
    Process one S3 ObjectCreated event record.
    """

    bucket_name = record["s3"]["bucket"]["name"]

    object_key = unquote_plus(
        record["s3"]["object"]["key"]
    )

    object_size = int(
        record["s3"]["object"].get(
            "size",
            0,
        )
    )

    logger.info(
        "Processing s3://%s/%s",
        bucket_name,
        object_key,
    )

    # Prevent recursive processing.
    if not object_key.startswith(INPUT_PREFIX):
        logger.info(
            "Skipping object outside uploads/: %s",
            object_key,
        )

        return {
            "status": "skipped",
            "key": object_key,
        }

    # Validate file size.
    if object_size > MAX_FILE_SIZE:
        raise ValueError(
            f"File exceeds maximum allowed size "
            f"of {MAX_FILE_SIZE} bytes."
        )

    # Validate file extension.
    extension = object_key.lower().rsplit(
        ".",
        1,
    )[-1]

    if extension not in {
        "jpg",
        "jpeg",
        "png",
    }:
        raise ValueError(
            f"Unsupported file extension: .{extension}"
        )

    # Download image from S3.
    response = s3_client.get_object(
        Bucket=bucket_name,
        Key=object_key,
    )

    image_bytes = response["Body"].read()

    logger.info(
        "Downloaded image: %s bytes",
        len(image_bytes),
    )

    # Process image.
    # Pillow is imported lazily inside process_image().
    processing_result = process_image(
        image_bytes
    )

    logger.info(
        "Image validated successfully."
    )

    versions = processing_result["versions"]

    original_file_name = object_key.rsplit(
        "/",
        1,
    )[-1]

    uploaded_files = []

    # Upload generated versions.
    for version_name, version_data in versions.items():

        output_key = (
            f"{OUTPUT_PREFIX}"
            f"{version_name}/"
            f"{original_file_name}"
        )

        content_type = (
            "image/png"
            if version_data["format"] == "PNG"
            else "image/jpeg"
        )

        s3_client.put_object(
            Bucket=bucket_name,
            Key=output_key,
            Body=version_data["bytes"],
            ContentType=content_type,
        )

        logger.info(
            "Uploaded processed image: "
            "s3://%s/%s",
            bucket_name,
            output_key,
        )

        uploaded_files.append(
            {
                "version": version_name,
                "key": output_key,
                "width": version_data["width"],
                "height": version_data["height"],
                "size": version_data["size"],
            }
        )

    return {
        "status": "processed",
        "source": object_key,
        "original": processing_result["original"],
        "outputs": uploaded_files,
    }

