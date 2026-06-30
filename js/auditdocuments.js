const auditDocumentGrid = document.getElementById("auditDocumentGrid");
const auditDocumentFileInput = document.getElementById("auditDocumentFileInput");
const auditDocumentPdfModal = document.getElementById("auditDocumentPdfModal");
const auditDocumentPdfFrame = document.getElementById("auditDocumentPdfFrame");
const auditDocumentModalClose = document.getElementById("auditDocumentModalClose");
const auditPdfScrollUp = document.getElementById("auditPdfScrollUp");
const auditPdfScrollDown = document.getElementById("auditPdfScrollDown");

const isAuditDocumentAdmin = true;

function getToken() {
  return localStorage.getItem("token");
}

function getAuditPdfUrl(filePath) {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return `${BASE_URL}${filePath}`;
}

function getAuditPdfViewerUrl(pdfUrl) {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    pdfUrl
  )}`;
}

async function fetchAuditDocuments() {
  try {
    const res = await fetch(API_PATHS.AUDIT_DOCUMENTS);
    const documents = await res.json();

    if (!res.ok) {
      alert(documents.message || "Audit documents fetch nahi hua");
      return;
    }

    renderAuditDocumentFiles(documents);
  } catch (error) {
    console.error("Audit documents fetch error:", error);
    alert("Server error while fetching audit documents");
  }
}

function renderAuditDocumentFiles(documents) {
  auditDocumentGrid.innerHTML = "";

  documents.forEach((pdf) => {
    const card = document.createElement("div");
    card.className = "document-card";

    const pdfUrl = getAuditPdfUrl(pdf.file);

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
            isAuditDocumentAdmin
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
      openAuditDocumentPdfModal(pdfUrl);
    });

    card.querySelector(".document-view-btn").addEventListener("click", () => {
      openAuditDocumentPdfModal(pdfUrl);
    });

    if (isAuditDocumentAdmin) {
      card.querySelector(".document-delete-btn").addEventListener("click", () => {
        deleteAuditDocumentPdf(pdf._id);
      });
    }

    auditDocumentGrid.appendChild(card);
  });

  if (isAuditDocumentAdmin) {
    createAuditDocumentUploadCard();
  }
}

function createAuditDocumentUploadCard() {
  const uploadCard = document.createElement("div");
  uploadCard.className = "document-upload-card";

  uploadCard.innerHTML = `
    <div class="document-upload-content">
      <div class="document-upload-icon">
        <i class="fa-solid fa-plus"></i>
      </div>
      <h3>Upload Audit Document</h3>
      <p>Click here to upload PDF</p>
    </div>
  `;

  uploadCard.addEventListener("click", () => {
    auditDocumentFileInput.click();
  });

  auditDocumentGrid.appendChild(uploadCard);
}

auditDocumentFileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Please only PDF file upload kare.");
    return;
  }

  showAuditDocumentPreviewCard(file);
  auditDocumentFileInput.value = "";
});

function showAuditDocumentPreviewCard(file) {
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
    saveAuditDocumentPdf(file);
  });

  if (uploadCard) {
    auditDocumentGrid.insertBefore(previewCard, uploadCard);
    uploadCard.remove();
  } else {
    auditDocumentGrid.appendChild(previewCard);
  }
}

async function saveAuditDocumentPdf(file) {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("document", file);

    const res = await fetch(API_PATHS.AUDIT_DOCUMENTS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Audit document upload failed:", data);
      alert(data.message || "Audit document upload failed");
      return;
    }

    fetchAuditDocuments();
  } catch (error) {
    console.error("Audit document upload error:", error);
    alert("Server error while uploading audit document");
  }
}

async function deleteAuditDocumentPdf(id) {
  const confirmDelete = confirm("Do you want to delete this audit PDF document?");
  if (!confirmDelete) return;

  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`${API_PATHS.AUDIT_DOCUMENTS}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Audit document delete failed");
      return;
    }

    fetchAuditDocuments();
  } catch (error) {
    console.error("Audit document delete error:", error);
    alert("Server error while deleting audit document");
  }
}

function openAuditDocumentPdfModal(pdfSrc) {
  const viewerUrl = getAuditPdfViewerUrl(pdfSrc);
  auditDocumentPdfFrame.src = viewerUrl;
  auditDocumentPdfModal.classList.add("active");
}

function closeAuditDocumentPdfModal() {
  auditDocumentPdfModal.classList.remove("active");
  auditDocumentPdfFrame.src = "";
}

auditDocumentModalClose.addEventListener("click", closeAuditDocumentPdfModal);

auditDocumentPdfModal.addEventListener("click", (e) => {
  if (e.target === auditDocumentPdfModal) {
    closeAuditDocumentPdfModal();
  }
});



fetchAuditDocuments();