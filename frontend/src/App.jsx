import { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cloud,
  Maximize2,
  Download,
  Info,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = "http://127.0.0.1:5001";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [processedImages, setProcessedImages] = useState([]);
  const [processingDetails, setProcessingDetails] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);

  // =========================================================
  // File Selection
  // =========================================================

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProcessedImages([]);
    setProcessingDetails(null);
    setPipelineStep(0);
    setMessage("");

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setSelectedFile(null);
      setStatus("error");
      setMessage("Only JPG and PNG images are supported.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setStatus("error");
      setMessage("File size must be 10 MB or less.");
      return;
    }

    setSelectedFile(file);
    setStatus("ready");
    setMessage("Image ready for secure upload.");
  };

  // =========================================================
  // Get Secure Processed Image URL
  // =========================================================

  const getProcessedUrl = async (key) => {
    const response = await fetch(
      `${API_BASE_URL}/api/processed-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Processed image is not ready yet."
      );
    }

    return response.json();
  };

  // =========================================================
  // Wait for Lambda-Generated Images
  // =========================================================

  const waitForProcessedImages = async (sourceKey) => {
    const filename = sourceKey.split("/").pop();

    const versions = [
      {
        name: "Thumbnail",
        key: `processed/thumbnail/${filename}`,
        size: "200 × 200",
      },
      {
        name: "Medium",
        key: `processed/medium/${filename}`,
        size: "800 × 800",
      },
      {
        name: "Large",
        key: `processed/large/${filename}`,
        size: "1600 × 1600",
      },
    ];

    const maxAttempts = 20;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        const results = await Promise.all(
          versions.map(async (version) => {
            const data = await getProcessedUrl(
              version.key
            );

            return {
              ...version,
              url: data.downloadUrl,
            };
          })
        );

        return results;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(
            "Image processing is taking longer than expected. Please check S3 processed files."
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );
      }
    }
  };

  // =========================================================
  // Upload and Processing Pipeline
  // =========================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setStatus("uploading");
      setProcessedImages([]);
      setProcessingDetails(null);

      // -----------------------------------------------------
      // Step 1 - Preparing Upload
      // -----------------------------------------------------

      setPipelineStep(1);
      setMessage(
        "Preparing secure upload..."
      );

      const urlResponse = await fetch(
        `${API_BASE_URL}/api/upload-url`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            filename: selectedFile.name,
            contentType: selectedFile.type,
          }),
        }
      );

      if (!urlResponse.ok) {
        throw new Error(
          "Unable to create secure upload URL."
        );
      }

      const uploadData =
        await urlResponse.json();

      // -----------------------------------------------------
      // Step 2 - Uploading to S3
      // -----------------------------------------------------

      setPipelineStep(2);

      setMessage(
        "Uploading image securely to Amazon S3..."
      );

      const uploadResponse = await fetch(
        uploadData.uploadUrl,
        {
          method: "PUT",

          headers: {
            "Content-Type": selectedFile.type,
          },

          body: selectedFile,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(
          "S3 upload failed."
        );
      }

      // -----------------------------------------------------
      // Step 3 - Lambda Processing
      // -----------------------------------------------------

      setPipelineStep(3);

      setMessage(
        "Image uploaded. Lambda processing has started..."
      );

      const results =
        await waitForProcessedImages(
          uploadData.key
        );

      // -----------------------------------------------------
      // Step 4 - Generating Variants
      // -----------------------------------------------------

      setPipelineStep(4);

      setMessage(
        "Generating optimized image variants..."
      );

      // -----------------------------------------------------
      // Save Processing Details
      // -----------------------------------------------------

      setProcessingDetails({
        filename: selectedFile.name,

        format:
          selectedFile.type === "image/png"
            ? "PNG"
            : "JPEG",

        size: selectedFile.size,

        region: "ap-south-1",

        status: "Completed",

        variants: results.length,
      });

      // -----------------------------------------------------
      // Step 5 - Complete
      // -----------------------------------------------------

      setProcessedImages(results);

      setPipelineStep(5);

      setStatus("success");

      setMessage(
        "Image processed successfully."
      );
    } catch (error) {
      console.error(error);

      setStatus("error");

      setMessage(
        error.message ||
          "Something went wrong."
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="app">

      {/* ===================================================
          Navigation
          =================================================== */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-icon">
            <ImageIcon size={22} />
          </div>

          <span>
            ImageFlow
          </span>

        </div>

        <div className="aws-status">

          <span className="status-dot"></span>

          AWS Connected

        </div>

      </nav>


      {/* ===================================================
          Main Content
          =================================================== */}

      <main className="main-content">

        {/* =================================================
            Hero
            ================================================= */}

        <section className="hero">

          <div className="hero-badge">

            <Cloud size={16} />

            Serverless Image Processing

          </div>

          <h1>

            Transform images.

            <br />

            <span>
              Automatically.
            </span>

          </h1>

          <p>
            Upload your image and let our
            serverless AWS pipeline generate
            optimized versions in multiple
            resolutions.
          </p>

        </section>


        {/* =================================================
            Upload Section
            ================================================= */}

        <section className="upload-section">

          <div className="upload-card">

            <div className="upload-icon">

              <Upload size={30} />

            </div>

            <h2>
              Upload your image
            </h2>

            <p>
              JPG or PNG · Maximum 10 MB
            </p>


            {/* Choose Image */}

            <label className="choose-button">

              <Upload size={18} />

              Choose Image

              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                hidden
              />

            </label>


            {/* Selected File */}

            {selectedFile && (

              <div className="selected-file">

                <ImageIcon size={18} />

                <div>

                  <strong>
                    {selectedFile.name}
                  </strong>

                  <span>
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </span>

                </div>

              </div>

            )}


            {/* Process Button */}

            {selectedFile &&
              status !== "uploading" && (

                <button
                  className="process-button"
                  onClick={handleUpload}
                  disabled={
                    status === "success"
                  }
                >

                  {status === "success" ? (

                    <>

                      <CheckCircle2
                        size={18}
                      />

                      Processed

                    </>

                  ) : (

                    <>

                      <Zap size={18} />

                      Process Image

                    </>

                  )}

                </button>

              )}


            {/* =================================================
                Processing Pipeline
                ================================================= */}

            {status === "uploading" && (

              <div className="pipeline">

                <div className="pipeline-header">

                  <Loader2
                    className="spin"
                    size={19}
                  />

                  <span>
                    {message}
                  </span>

                </div>


                <div className="pipeline-steps">

                  {/* Step 1 */}

                  <div
                    className={`pipeline-step ${
                      pipelineStep >= 1
                        ? "active"
                        : ""
                    }`}
                  >

                    <div className="step-icon">

                      {pipelineStep > 1 ? (
                        <CheckCircle2
                          size={16}
                        />
                      ) : (
                        "1"
                      )}

                    </div>

                    <span>
                      Preparing upload
                    </span>

                  </div>


                  {/* Step 2 */}

                  <div
                    className={`pipeline-step ${
                      pipelineStep >= 2
                        ? "active"
                        : ""
                    }`}
                  >

                    <div className="step-icon">

                      {pipelineStep > 2 ? (
                        <CheckCircle2
                          size={16}
                        />
                      ) : (
                        "2"
                      )}

                    </div>

                    <span>
                      Uploading to S3
                    </span>

                  </div>


                  {/* Step 3 */}

                  <div
                    className={`pipeline-step ${
                      pipelineStep >= 3
                        ? "active"
                        : ""
                    }`}
                  >

                    <div className="step-icon">

                      {pipelineStep > 3 ? (
                        <CheckCircle2
                          size={16}
                        />
                      ) : (
                        "3"
                      )}

                    </div>

                    <span>
                      Lambda processing
                    </span>

                  </div>


                  {/* Step 4 */}

                  <div
                    className={`pipeline-step ${
                      pipelineStep >= 4
                        ? "active"
                        : ""
                    }`}
                  >

                    <div className="step-icon">

                      {pipelineStep > 4 ? (
                        <CheckCircle2
                          size={16}
                        />
                      ) : (
                        "4"
                      )}

                    </div>

                    <span>
                      Generating variants
                    </span>

                  </div>


                  {/* Step 5 */}

                  <div
                    className={`pipeline-step ${
                      pipelineStep >= 5
                        ? "active"
                        : ""
                    }`}
                  >

                    <div className="step-icon">

                      {pipelineStep >= 5 ? (
                        <CheckCircle2
                          size={16}
                        />
                      ) : (
                        "5"
                      )}

                    </div>

                    <span>
                      Complete
                    </span>

                  </div>

                </div>

              </div>

            )}


            {/* Success */}

            {status === "success" && (

              <div className="success-message">

                <CheckCircle2 size={18} />

                {message}

              </div>

            )}


            {/* Error */}

            {status === "error" && (

              <div className="error-message">

                <AlertCircle size={18} />

                {message}

              </div>

            )}


            {/* Ready */}

            {status === "ready" && (

              <div className="success-message">

                <ShieldCheck size={18} />

                {message}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            Processed Results
            ================================================= */}

        {processedImages.length > 0 && (

          <section className="results-section">

            {/* Results Header */}

            <div className="results-heading">

              <div>

                <span className="section-label">
                  PROCESSING COMPLETE
                </span>

                <h2>
                  Generated Image Variants
                </h2>

              </div>

              <CheckCircle2 size={26} />

            </div>


            {/* =================================================
                Processing Details
                ================================================= */}

            {processingDetails && (

              <div className="processing-details">

                <div className="details-title">

                  <Info size={20} />

                  <div>

                    <h3>
                      Processing Details
                    </h3>

                    <span>
                      Image processing pipeline
                      summary
                    </span>

                  </div>

                </div>


                <div className="details-grid">

                  {/* Original File */}

                  <div className="detail-item">

                    <span>
                      Original File
                    </span>

                    <strong
                      title={
                        processingDetails.filename
                      }
                    >
                      {
                        processingDetails.filename
                      }
                    </strong>

                  </div>


                  {/* Format */}

                  <div className="detail-item">

                    <span>
                      Format
                    </span>

                    <strong>
                      {
                        processingDetails.format
                      }
                    </strong>

                  </div>


                  {/* File Size */}

                  <div className="detail-item">

                    <span>
                      File Size
                    </span>

                    <strong>
                      {(
                        processingDetails.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </strong>

                  </div>


                  {/* AWS Region */}

                  <div className="detail-item">

                    <span>
                      AWS Region
                    </span>

                    <strong>
                      {
                        processingDetails.region
                      }
                    </strong>

                  </div>


                  {/* Variants */}

                  <div className="detail-item">

                    <span>
                      Variants Generated
                    </span>

                    <strong>
                      {
                        processingDetails.variants
                      }
                    </strong>

                  </div>


                  {/* Status */}

                  <div className="detail-item">

                    <span>
                      Processing Status
                    </span>

                    <strong className="status-completed">

                      <span className="mini-status-dot"></span>

                      {
                        processingDetails.status
                      }

                    </strong>

                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                Processed Image Grid
                ================================================= */}

            <div className="processed-grid">

              {processedImages.map(
                (image) => (

                  <div
                    className="processed-card"
                    key={image.name}
                  >

                    {/* Image Preview */}

                    <div className="processed-preview">

                      <img
                        src={image.url}
                        alt={`${image.name} version`}
                      />

                    </div>


                    {/* Image Information */}

                    <div className="processed-info">

                      <div>

                        <h3>
                          {image.name}
                        </h3>

                        <span>
                          {
                            image.size
                          }{" "}
                          max dimensions
                        </span>

                      </div>


                      {/* Actions */}

                      <div className="result-actions">

                        {/* View */}

                        <a
                          href={image.url}
                          target="_blank"
                          rel="noreferrer"
                          className="view-button"
                        >

                          <Maximize2
                            size={16}
                          />

                          View

                        </a>


                        {/* Download */}

                        <a
                          href={image.url}
                          download={`${image.name.toLowerCase()}-${selectedFile?.name || "image"}`}
                          className="download-button"
                        >

                          <Download
                            size={16}
                          />

                          Download

                        </a>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* =================================================
            Feature Cards
            ================================================= */}

        <section className="features">

          <div className="feature-card">

            <ShieldCheck size={24} />

            <h3>
              Secure
            </h3>

            <p>
              Private S3 storage with secure
              presigned URLs.
            </p>

          </div>


          <div className="feature-card">

            <Zap size={24} />

            <h3>
              Serverless
            </h3>

            <p>
              AWS Lambda processes images
              automatically.
            </p>

          </div>


          <div className="feature-card">

            <Cloud size={24} />

            <h3>
              Scalable
            </h3>

            <p>
              Event-driven architecture
              scales with demand.
            </p>

          </div>


          <div className="feature-card">

            <ImageIcon size={24} />

            <h3>
              Multi-Size
            </h3>

            <p>
              Automatically creates three
              optimized versions.
            </p>

          </div>

        </section>

      </main>


      {/* =====================================================
          Footer
          ===================================================== */}

      <footer>

        <span>
          ImageFlow
        </span>

        <span>
          Powered by AWS Serverless Architecture
        </span>

      </footer>

    </div>
  );
}

export default App;