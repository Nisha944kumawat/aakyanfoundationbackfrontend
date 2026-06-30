const documentGrid = document.getElementById("documentGrid");
const documentFileInput = document.getElementById("documentFileInput");
const documentPdfModal = document.getElementById("documentPdfModal");
const documentPdfFrame = document.getElementById("documentPdfFrame");
const documentModalClose = document.getElementById("documentModalClose");
const pdfScrollUp = document.getElementById("pdfScrollUp");
const pdfScrollDown = document.getElementById("pdfScrollDown");

const isDocumentAdmin = true;

function getToken() {
  return localStorage.getItem("token");
}

function getPdfUrl(filePath) {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return `${BASE_URL}${filePath}`;
}

function getPdfViewerUrl(pdfUrl) {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    pdfUrl
  )}`;
}

async function fetchDocuments() {
  try {
    const res = await fetch(API_PATHS.DOCUMENTS);
    const documents = await res.json();

    if (!res.ok) {
      alert(documents.message || "Documents fetch nahi hua");
      return;
    }

    renderDocumentPdfFiles(documents);
  } catch (error) {
    console.error("Documents fetch error:", error);
    alert("Server error while fetching documents");
  }
}

function renderDocumentPdfFiles(documents) {
  documentGrid.innerHTML = "";

  documents.forEach((pdf) => {
    const card = document.createElement("div");
    card.className = "document-card";

    const pdfUrl = getPdfUrl(pdf.file);

    card.innerHTML = `
      <div class="document-card-content">
        <div class="document-pdf-icon">
          <i class="fa-solid fa-file-pdf"></i>
        </div>

        <h3 class="document-name">${pdf.name}</h3>

        <div class="document-actions">
          <button class="document-action-btn document-view-btn" title="View PDF">
            <i class="fa-solid fa-eye"></i>
          </button>

          <a class="document-download-btn" href="${pdfUrl}" download="${pdf.name}" title="Download PDF" target="_blank">
            <i class="fa-solid fa-download"></i>
          </a>

          ${
            isDocumentAdmin
              ? `
              <button class="document-action-btn document-delete-btn" title="Delete PDF">
                <i class="fa-solid fa-trash"></i>
              </button>
            `
              : ""
          }
        </div>
      </div>
    `;

    card.querySelector(".document-pdf-icon").addEventListener("click", () => {
      openDocumentPdfModal(pdfUrl);
    });

    card.querySelector(".document-view-btn").addEventListener("click", () => {
      openDocumentPdfModal(pdfUrl);
    });

    if (isDocumentAdmin) {
      card.querySelector(".document-delete-btn").addEventListener("click", () => {
        deleteDocumentPdf(pdf._id);
      });
    }

    documentGrid.appendChild(card);
  });

  if (isDocumentAdmin) {
    createDocumentUploadCard();
  }
}

function createDocumentUploadCard() {
  const uploadCard = document.createElement("div");
  uploadCard.className = "document-upload-card";

  uploadCard.innerHTML = `
    <div class="document-upload-content">
      <div class="document-upload-icon">
        <i class="fa-solid fa-plus"></i>
      </div>
      <h3>Upload Your Document</h3>
      <p>Click here to upload PDF</p>
    </div>
  `;

  uploadCard.addEventListener("click", () => {
    documentFileInput.click();
  });

  documentGrid.appendChild(uploadCard);
}

documentFileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Please only PDF file upload kare.");
    return;
  }

  showDocumentPreviewCard(file);
  documentFileInput.value = "";
});

function showDocumentPreviewCard(file) {
  const uploadCard = document.querySelector(".document-upload-card");

  const previewCard = document.createElement("div");
  previewCard.className = "document-card";

  previewCard.innerHTML = `
    <div class="document-card-content">
      <div class="document-pdf-icon">
        <i class="fa-solid fa-file-pdf"></i>
      </div>

      <h3 class="document-name">${file.name}</h3>

      <button class="document-save-btn">Save</button>
    </div>
  `;

  previewCard.querySelector(".document-save-btn").addEventListener("click", () => {
    saveDocumentPdf(file);
  });

  if (uploadCard) {
    documentGrid.insertBefore(previewCard, uploadCard);
    uploadCard.remove();
  } else {
    documentGrid.appendChild(previewCard);
  }
}

async function saveDocumentPdf(file) {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("document", file);

    const res = await fetch(API_PATHS.DOCUMENTS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Document upload failed:", data);
      alert(data.message || "Document upload failed");
      return;
    }

    fetchDocuments();
  } catch (error) {
    console.error("Upload error:", error);
    alert("Server error while uploading document");
  }
}

async function deleteDocumentPdf(id) {
  const confirmDelete = confirm("Do you want to delete this PDF document?");
  if (!confirmDelete) return;

  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`${API_PATHS.DOCUMENTS}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Document delete failed");
      return;
    }

    fetchDocuments();
  } catch (error) {
    console.error("Delete error:", error);
    alert("Server error while deleting document");
  }
}

function openDocumentPdfModal(pdfSrc) {
  const viewerUrl = getPdfViewerUrl(pdfSrc);
  documentPdfFrame.src = viewerUrl;
  documentPdfModal.classList.add("active");
}

function closeDocumentPdfModal() {
  documentPdfModal.classList.remove("active");
  documentPdfFrame.src = "";
}

documentModalClose.addEventListener("click", closeDocumentPdfModal);

documentPdfModal.addEventListener("click", (e) => {
  if (e.target === documentPdfModal) {
    closeDocumentPdfModal();
  }
});


fetchDocuments();