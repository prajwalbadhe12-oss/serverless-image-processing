from io import BytesIO


SUPPORTED_FORMATS = {
    "JPEG": "jpg",
    "PNG": "png",
}

IMAGE_SIZES = {
    "thumbnail": (200, 200),
    "medium": (800, 800),
    "large": (1600, 1600),
}


def validate_image(image_bytes):
    """
    Validate that the uploaded file is a supported JPEG or PNG image.
    """

    if not image_bytes:
        raise ValueError("Image file is empty.")

    # Import Pillow only when this function is actually called.
    from PIL import Image

    try:
        image = Image.open(BytesIO(image_bytes))
        image.verify()

        # Re-open after verify() because verify() invalidates the image object.
        image = Image.open(BytesIO(image_bytes))

    except Exception as exc:
        raise ValueError("Invalid or corrupted image file.") from exc

    if image.format not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported image format: {image.format}. "
            f"Only JPEG and PNG are supported."
        )

    return image


def resize_image(image, size):
    """
    Resize image while preserving aspect ratio.
    """

    resized = image.copy()
    resized.thumbnail(size)

    output = BytesIO()

    if image.format == "JPEG":
        if resized.mode not in ("RGB", "L"):
            resized = resized.convert("RGB")

        resized.save(
            output,
            format="JPEG",
            quality=90,
            optimize=True,
        )

    elif image.format == "PNG":
        resized.save(
            output,
            format="PNG",
            optimize=True,
        )

    else:
        raise ValueError(
            f"Unsupported image format: {image.format}"
        )

    return output.getvalue(), resized.width, resized.height


def process_image(image_bytes):
    """
    Validate the image and generate thumbnail, medium,
    and large versions.
    """

    # Import Pillow lazily.
    from PIL import Image

    image = validate_image(image_bytes)

    original_format = image.format
    original_width, original_height = image.size

    versions = {}

    for version_name, size in IMAGE_SIZES.items():

        resized_bytes, width, height = resize_image(
            image,
            size,
        )

        versions[version_name] = {
            "bytes": resized_bytes,
            "width": width,
            "height": height,
            "size": len(resized_bytes),
            "format": original_format,
        }

    return {
        "original": {
            "width": original_width,
            "height": original_height,
            "size": len(image_bytes),
            "format": original_format,
        },
        "versions": versions,
    }