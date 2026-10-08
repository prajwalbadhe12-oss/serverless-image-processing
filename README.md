@'
# Serverless Image Processing & Intelligent Resizing Platform

A production-style, event-driven image processing platform built with **React, Python Flask, Amazon S3, AWS Lambda, IAM, and CloudWatch**.

Users upload JPG/PNG images through a responsive React interface. The application securely uploads the original image directly to Amazon S3 using a presigned URL. An S3 event automatically invokes AWS Lambda, which validates the image and generates optimized **thumbnail, medium, and large** variants. Processed images are securely delivered through temporary presigned URLs.

---

## Architecture

```text
                    ┌──────────────────────┐
                    │     React Frontend    │
                    │      ImageFlow       │
                    └──────────┬───────────┘
                               │
                         Request upload URL
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Flask REST API     │
                    │     Port 5001        │
                    └──────────┬───────────┘
                               │
                     Presigned PUT URL
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Amazon S3        │
                    │      uploads/        │
                    └──────────┬───────────┘
                               │
                         ObjectCreated
                               │
                               ▼
                    ┌──────────────────────┐
                    │     AWS Lambda       │
                    │   Python + Pillow    │
                    └──────────┬───────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
               thumbnail     medium      large
                    │          │          │
                    └──────────┼──────────┘
                               ▼
                    ┌──────────────────────┐
                    │     Amazon S3        │
                    │     processed/       │
                    └──────────┬───────────┘
                               │
                         Presigned GET
                               │
                               ▼
                    ┌──────────────────────┐
                    │     React Gallery    │
                    │  View / Download     │
                    └──────────────────────┘