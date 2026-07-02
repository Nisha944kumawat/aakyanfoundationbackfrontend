const policyDocumentGrid = document.getElementById("policyDocumentGrid");
const policyDocumentFileInput = document.getElementById("policyDocumentFileInput");
const policyDocumentPdfModal = document.getElementById("policyDocumentPdfModal");
const policyDocumentPdfFrame = document.getElementById("policyDocumentPdfFrame");
const policyDocumentModalClose = document.getElementById("policyDocumentModalClose");

const isPolicyDocumentAdmin = true;

function getToken() {
  return localStorage.getItem("token");
}

function getPolicyPdfUrl(filePath) {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return `${BASE_URL}${filePath}`;
}

function getPolicyPdfViewerUrl(pdfUrl) {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
}

async function fetchPolicyDocuments() {
  try {
    const res = await fetch(API_PATHS.POLICY_DOCUMENTS);
    const documents = await res.json();

    if (!res.ok) {
      alert(documents.message || "Policy documents fetch nahi hua");
      return;
    }

    renderPolicyDocumentFiles(documents);
  } catch (error) {
    console.error("Policy documents fetch error:", error);
    alert("Server error while fetching policy documents");
  }
}

function renderPolicyDocumentFiles(documents) {
  policyDocumentGrid.innerHTML = "";

  documents.forEach((pdf) => {
    const card = document.createElement("div");
    card.className = "document-card";

    const pdfUrl = getPolicyPdfUrl(pdf.file);

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
            isPolicyDocumentAdmin
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
      openPolicyDocumentPdfModal(pdfUrl);
    });

    card.querySelector(".document-view-btn").addEventListener("click", () => {
      openPolicyDocumentPdfModal(pdfUrl);
    });

    if (isPolicyDocumentAdmin) {
      card.querySelector(".document-delete-btn").addEventListener("click", () => {
        deletePolicyDocumentPdf(pdf._id);
      });
    }

    policyDocumentGrid.appendChild(card);
  });

  if (isPolicyDocumentAdmin) {
    createPolicyDocumentUploadCard();
  }
}

function createPolicyDocumentUploadCard() {
  const uploadCard = document.createElement("div");
  uploadCard.className = "document-upload-card";

  uploadCard.innerHTML = `
    <div class="document-upload-content">
      <div class="document-upload-icon">
        <i class="fa-solid fa-plus"></i>
      </div>
      <h3>Upload Policy Document</h3>
      <p>Click here to upload PDF</p>
    </div>
  `;

  uploadCard.addEventListener("click", () => {
    policyDocumentFileInput.click();
  });

  policyDocumentGrid.appendChild(uploadCard);
}

policyDocumentFileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Please only PDF file upload kare.");
    return;
  }

  showPolicyDocumentPreviewCard(file);
  policyDocumentFileInput.value = "";
});

function showPolicyDocumentPreviewCard(file) {
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
    savePolicyDocumentPdf(file);
  });

  if (uploadCard) {
    policyDocumentGrid.insertBefore(previewCard, uploadCard);
    uploadCard.remove();
  } else {
    policyDocumentGrid.appendChild(previewCard);
  }
}

async function savePolicyDocumentPdf(file) {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("document", file);

    const res = await fetch(API_PATHS.POLICY_DOCUMENTS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Policy document upload failed:", data);
      alert(data.message || "Policy document upload failed");
      return;
    }

    fetchPolicyDocuments();
  } catch (error) {
    console.error("Policy document upload error:", error);
    alert("Server error while uploading policy document");
  }
}

async function deletePolicyDocumentPdf(id) {
  const confirmDelete = confirm("Do you want to delete this policy PDF document?");
  if (!confirmDelete) return;

  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`${API_PATHS.POLICY_DOCUMENTS}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Policy document delete failed");
      return;
    }

    fetchPolicyDocuments();
  } catch (error) {
    console.error("Policy document delete error:", error);
    alert("Server error while deleting policy document");
  }
}

function openPolicyDocumentPdfModal(pdfSrc) {
  policyDocumentPdfFrame.src = getPolicyPdfViewerUrl(pdfSrc);
  policyDocumentPdfModal.classList.add("active");
}

function closePolicyDocumentPdfModal() {
  policyDocumentPdfModal.classList.remove("active");
  policyDocumentPdfFrame.src = "";
}

policyDocumentModalClose.addEventListener("click", closePolicyDocumentPdfModal);

policyDocumentPdfModal.addEventListener("click", (e) => {
  if (e.target === policyDocumentPdfModal) {
    closePolicyDocumentPdfModal();
  }
});

fetchPolicyDocuments();