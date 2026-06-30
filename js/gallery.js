const galleryGrid = document.getElementById("galleryGrid");
const galleryFileInput = document.getElementById("galleryFileInput");
const galleryImageModal = document.getElementById("galleryImageModal");
const galleryModalImage = document.getElementById("galleryModalImage");
const galleryModalClose = document.getElementById("galleryModalClose");

let galleryImages = [];
let selectedGalleryFile = null;

async function fetchGalleryImages() {
  try {
    const res = await fetch(API_PATHS.ADMIN_GALLERY);
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gallery images fetch nahi ho paayi");
      return;
    }

    galleryImages = data;
    renderGalleryImages();
  } catch (error) {
    console.error("Gallery fetch error:", error);
    alert("Server error while fetching gallery images");
  }
}

function getImageUrl(imagePath) {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${BASE_URL}${imagePath}`;
}

function renderGalleryImages() {
  galleryGrid.innerHTML = "";

  galleryImages.forEach((item) => {
    const card = document.createElement("div");
    card.className = "activity-calendar-card";

    const imageUrl = getImageUrl(item.image);

    card.innerHTML = `
      <img src="${imageUrl}" alt="Gallery Image">
      <button class="activity-calendar-delete-btn" title="Delete Image">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    card.querySelector("img").addEventListener("click", () => {
      openGalleryImageModal(imageUrl);
    });

    card.querySelector(".activity-calendar-delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteGalleryImage(item._id);
    });

    galleryGrid.appendChild(card);
  });

  createGalleryUploadCard();
}

function createGalleryUploadCard() {
  const uploadCard = document.createElement("div");
  uploadCard.className = "activity-calendar-upload-card";

  uploadCard.innerHTML = `
    <div class="activity-calendar-upload-content">
      <div class="activity-calendar-upload-icon">
        <i class="fa-solid fa-plus"></i>
      </div>
      <h3>Add Gallery Image</h3>
      <p>Click here to upload</p>
    </div>
  `;

  uploadCard.addEventListener("click", () => {
    galleryFileInput.click();
  });

  galleryGrid.appendChild(uploadCard);
}

galleryFileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please only image file upload kare.");
    return;
  }

  selectedGalleryFile = file;

  const reader = new FileReader();

  reader.onload = function (e) {
    showGalleryPreviewCard(e.target.result);
  };

  reader.readAsDataURL(file);
  galleryFileInput.value = "";
});

function showGalleryPreviewCard(imageSrc) {
  const uploadCard = document.querySelector(".activity-calendar-upload-card");

  const previewCard = document.createElement("div");
  previewCard.className = "activity-calendar-card";

  previewCard.innerHTML = `
    <img src="${imageSrc}" alt="Preview Gallery Image">
    <button class="activity-calendar-save-btn">Save</button>
  `;

  previewCard.querySelector(".activity-calendar-save-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    saveGalleryImage();
  });

  previewCard.querySelector("img").addEventListener("click", () => {
    openGalleryImageModal(imageSrc);
  });

  if (uploadCard) {
    galleryGrid.insertBefore(previewCard, uploadCard);
    uploadCard.remove();
  } else {
    galleryGrid.appendChild(previewCard);
  }
}

async function saveGalleryImage() {
  if (!selectedGalleryFile) return;

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  const formData = new FormData();
  formData.append("image", selectedGalleryFile);

  try {
    const res = await fetch(API_PATHS.ADMIN_GALLERY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gallery upload failed:", data);
      alert(data.message || "Gallery image save nahi hui");
      return;
    }

    selectedGalleryFile = null;
    fetchGalleryImages();
  } catch (error) {
    console.error("Gallery save error:", error);
    alert("Server error while saving gallery image");
  }
}

async function deleteGalleryImage(id) {
  const confirmDelete = confirm("Do you want to delete this gallery image?");

  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`${API_PATHS.ADMIN_GALLERY}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gallery image delete nahi hui");
      return;
    }

    fetchGalleryImages();
  } catch (error) {
    console.error("Gallery delete error:", error);
    alert("Server error while deleting gallery image");
  }
}

function openGalleryImageModal(imageSrc) {
  galleryModalImage.src = imageSrc;
  galleryImageModal.classList.add("active");
}

function closeGalleryImageModal() {
  galleryImageModal.classList.remove("active");
  galleryModalImage.src = "";
}

galleryModalClose.addEventListener("click", closeGalleryImageModal);

galleryImageModal.addEventListener("click", (e) => {
  if (e.target === galleryImageModal) {
    closeGalleryImageModal();
  }
});

fetchGalleryImages();