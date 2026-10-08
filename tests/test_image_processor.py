from io import BytesIO

import pytest
from PIL import Image

from image_processor import (
    process_image,
    resize_image,
    validate_image,
)


def create_test_image(
    width=2000,
    height=1500,
    image_format="JPEG",
):
    image = Image.new(
        "RGB",
        (width, height),
        "blue",
    )

    output = BytesIO()

    image.save(
        output,
        format=image_format,
    )

    return output.getvalue()


def test_validate_jpeg():
    image_bytes = create_test_image(
        image_format="JPEG"
    )

    image = validate_image(image_bytes)

    assert image.format == "JPEG"


def test_validate_png():
    image_bytes = create_test_image(
        image_format="PNG"
    )

    image = validate_image(image_bytes)

    assert image.format == "PNG"


def test_invalid_image():
    invalid_data = b"this is not an image"

    with pytest.raises(ValueError):
        validate_image(invalid_data)


def test_resize_image():
    image_bytes = create_test_image()

    image = validate_image(image_bytes)

    resized_bytes, _, _ = resize_image(
        image,
        (200, 200),
    )

    resized = Image.open(
        BytesIO(resized_bytes)
    )

    assert resized.width <= 200
    assert resized.height <= 200


def test_process_image():
    image_bytes = create_test_image()

    result = process_image(image_bytes)

    assert result["original"]["width"] == 2000
    assert result["original"]["height"] == 1500

    assert "thumbnail" in result["versions"]
    assert "medium" in result["versions"]
    assert "large" in result["versions"]

    thumbnail = result["versions"]["thumbnail"]
    medium = result["versions"]["medium"]
    large = result["versions"]["large"]

    assert thumbnail["width"] <= 200
    assert thumbnail["height"] <= 200

    assert medium["width"] <= 800
    assert medium["height"] <= 800

    assert large["width"] <= 1600
    assert large["height"] <= 1600
