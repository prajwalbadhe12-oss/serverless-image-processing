from unittest.mock import MagicMock, patch

from lambda_function import (
    process_s3_record,
)


def test_non_upload_file_is_skipped():

    record = {
        "s3": {
            "bucket": {
                "name": "test-bucket"
            },
            "object": {
                "key": "processed/test.jpg",
                "size": 1000,
            },
        }
    }

    result = process_s3_record(record)

    assert result["status"] == "skipped"


@patch(
    "lambda_function.s3_client"
)
@patch(
    "lambda_function.process_image"
)
def test_s3_image_processing(
    mock_process_image,
    mock_s3,
):

    mock_s3.get_object.return_value = {
        "Body": MagicMock(
            read=MagicMock(
                return_value=b"fake-image"
            )
        )
    }

    mock_process_image.return_value = {
        "original": {
            "width": 2000,
            "height": 1500,
            "format": "JPEG",
            "size": 1000,
        },
        "versions": {
            "thumbnail": {
                "bytes": b"thumbnail",
                "width": 200,
                "height": 150,
                "size": 9,
                "format": "JPEG",
            },
            "medium": {
                "bytes": b"medium",
                "width": 800,
                "height": 600,
                "size": 7,
                "format": "JPEG",
            },
            "large": {
                "bytes": b"large",
                "width": 1600,
                "height": 1200,
                "size": 5,
                "format": "JPEG",
            },
        },
    }

    record = {
        "s3": {
            "bucket": {
                "name": "test-bucket"
            },
            "object": {
                "key": "uploads/test.jpg",
                "size": 1000,
            },
        }
    }

    result = process_s3_record(record)

    assert result["status"] == "processed"

    assert len(
        result["outputs"]
    ) == 3

    assert (
        mock_s3.put_object.call_count
        == 3
    )
