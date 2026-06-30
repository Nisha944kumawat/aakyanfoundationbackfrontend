const pressCoverageGrid = document.getElementById("pressCoverageGrid");
const pressCoverageFileInput = document.getElementById("pressCoverageFileInput");
const pressCoverageImageModal = document.getElementById("pressCoverageImageModal");
const pressCoverageModalImage = document.getElementById("pressCoverageModalImage");
const pressCoverageModalClose = document.getElementById("pressCoverageModalClose");

let pressCoverageImages = [];
let selectedPressCoverageFile = null;

async function fetchPressCoverageImages() {
  try {
    const res = await fetch(API_PATHS.PRESS_COVERAGE);
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Press coverage images fetch nahi ho paayi");
      return;
    }

    pressCoverageImages = data;
    renderPressCoverageImages();
  } catch (error) {
    console.error("Press coverage fetch error:", error);
    alert("Server error while fetching press coverage images");
  }
}

function getImageUrl(imagePath) {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${BASE_URL}${imagePath}`;
}

function renderPressCoverageImages() {
  pressCoverageGrid.innerHTML = "";

  pressCoverageImages.forEach((item) => {
    const card = document.createElement("div");
    card.className = "activity-calendar-card";

    const imageUrl = getImageUrl(item.image);

    card.innerHTML = `
      <img src="${imageUrl}" alt="Press Coverage Image">
      <button class="activity-calendar-delete-btn" title="Delete Image">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    card.querySelector("img").addEventListener("click", () => {
      openPressCoverageImageModal(imageUrl);
    });

    card.querySelector(".activity-calendar-delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePressCoverageImage(item._id);
    });

    pressCoverageGrid.appendChild(card);
  });

  createPressCoverageUploadCard();
}

function createPressCoverageUploadCard() {
  const uploadCard = document.createElement("div");
  uploadCard.className = "activity-calendar-upload-card";

  uploadCard.innerHTML = `
    <div class="activity-calendar-upload-content">
      <div class="activity-calendar-upload-icon">
        <i class="fa-solid fa-plus"></i>
      </div>
      <h3>Add Press Coverage</h3>
      <p>Click here to upload</p>
    </div>
  `;

  uploadCard.addEventListener("click", () => {
    pressCoverageFileInput.click();
  });

  pressCoverageGrid.appendChild(uploadCard);
}

pressCoverageFileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please only image file upload kare.");
    return;
  }

  selectedPressCoverageFile = file;

  const reader = new FileReader();

  reader.onload = function (e) {
    showPressCoveragePreviewCard(e.target.result);
  };

  reader.readAsDataURL(file);
  pressCoverageFileInput.value = "";
});

function showPressCoveragePreviewCard(imageSrc) {
  const uploadCard = document.querySelector(".activity-calendar-upload-card");

  const previewCard = document.createElement("div");
  previewCard.className = "activity-calendar-card";

  previewCard.innerHTML = `
    <img src="${imageSrc}" alt="Preview Press Coverage Image">
    <button class="activity-calendar-save-btn">Save</button>
  `;

  previewCard.querySelector(".activity-calendar-save-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    savePressCoverageImage();
  });

  previewCard.querySelector("img").addEventListener("click", () => {
    openPressCoverageImageModal(imageSrc);
  });

  if (uploadCard) {
    pressCoverageGrid.insertBefore(previewCard, uploadCard);
    uploadCard.remove();
  } else {
    pressCoverageGrid.appendChild(previewCard);
  }
}

async function savePressCoverageImage() {
  if (!selectedPressCoverageFile) return;

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  const formData = new FormData();
  formData.append("image", selectedPressCoverageFile);

  try {
    const res = await fetch(API_PATHS.PRESS_COVERAGE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Press coverage upload failed:", data);
      alert(data.message || "Press coverage image save nahi hui");
      return;
    }

    selectedPressCoverageFile = null;
    fetchPressCoverageImages();
  } catch (error) {
    console.error("Press coverage save error:", error);
    alert("Server error while saving press coverage image");
  }
}

async function deletePressCoverageImage(id) {
  const confirmDelete = confirm("Do you want to delete this press coverage image?");

  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`${API_PATHS.PRESS_COVERAGE}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Press coverage image delete nahi hui");
      return;
    }

    fetchPressCoverageImages();
  } catch (error) {
    console.error("Press coverage delete error:", error);
    alert("Server error while deleting press coverage image");
  }
}

function openPressCoverageImageModal(imageSrc) {
  pressCoverageModalImage.src = imageSrc;
  pressCoverageImageModal.classList.add("active");
}

function closePressCoverageImageModal() {
  pressCoverageImageModal.classList.remove("active");
  pressCoverageModalImage.src = "";
}

pressCoverageModalClose.addEventListener("click", closePressCoverageImageModal);

pressCoverageImageModal.addEventListener("click", (e) => {
  if (e.target === pressCoverageImageModal) {
    closePressCoverageImageModal();
  }
});

fetchPressCoverageImages();