const donorGrid = document.getElementById("donorGrid");
const donorPhotoInput = document.getElementById("donorPhotoInput");
const donorSearchInput = document.getElementById("donorSearchInput");

let donorPhotoFile = null;
let allDonors = [];

function getToken() {
  return localStorage.getItem("token");
}

function getDonorPhotoUrl(photo) {
  if (!photo) return "";

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  return `${BASE_URL}${photo}`;
}

async function fetchDonors() {
  try {
    const res = await fetch(API_PATHS.DONORS);
    const donors = await res.json();

    if (!res.ok) {
      alert(donors.message || "Donors fetch nahi hua");
      return;
    }

    allDonors = donors;
    renderDonors(allDonors);
  } catch (error) {
    console.error("Donors fetch error:", error);
    alert("Server error while fetching donors");
  }
}

function renderDonors(donors) {
  donorGrid.innerHTML = "";

  donors.forEach((donor) => {
    const card = document.createElement("div");
    card.className = "donor-card";

    const photoUrl = getDonorPhotoUrl(donor.photo);

    card.innerHTML = `
      <button class="donor-delete-btn" title="Delete Donor">
        <i class="fa-solid fa-trash"></i>
      </button>

      <div class="donor-photo-box">
        <img src="${photoUrl}" alt="${donor.name}">
      </div>

      <div class="donor-info">
        <h3>${donor.name}</h3>

        <div class="donor-row">
          <span>Amount</span>
          <span>${donor.amount}</span>
        </div>

        <div class="donor-row">
          <span>Mobile</span>
          <span>${donor.mobile}</span>
        </div>
      </div>
    `;

    card.querySelector(".donor-delete-btn").addEventListener("click", () => {
      deleteDonor(donor._id);
    });

    donorGrid.appendChild(card);
  });

  createDonorFormCard();
}

function createDonorFormCard() {
  donorPhotoFile = null;

  const formCard = document.createElement("div");
  formCard.className = "donor-form-card";

  formCard.innerHTML = `
    <div class="donor-photo-box" id="donorUploadBox">
      <div class="donor-upload-content">
        <i class="fa-solid fa-plus"></i>
        <h3>Upload Photo</h3>
      </div>
    </div>

    <input type="text" class="donor-input" id="donorNameInput" placeholder="Add Name">
    <input type="text" class="donor-input" id="donorAmountInput" placeholder="Amount">
    <input type="text" class="donor-input" id="donorMobileInput" placeholder="Mobile Number">

    <button class="donor-save-btn" id="donorSaveBtn">Save</button>
  `;

  donorGrid.appendChild(formCard);

  const uploadBox = formCard.querySelector("#donorUploadBox");
  const nameInput = formCard.querySelector("#donorNameInput");
  const amountInput = formCard.querySelector("#donorAmountInput");
  const mobileInput = formCard.querySelector("#donorMobileInput");
  const saveBtn = formCard.querySelector("#donorSaveBtn");

  uploadBox.addEventListener("click", () => {
    donorPhotoInput.click();
  });

  donorPhotoInput.onchange = function () {
    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please only image upload kare.");
      return;
    }

    donorPhotoFile = file;

    const reader = new FileReader();

    reader.onload = function (e) {
      uploadBox.innerHTML = `
        <img src="${e.target.result}" alt="Donor Photo">
      `;

      checkFormComplete(nameInput, amountInput, mobileInput, saveBtn);
    };

    reader.readAsDataURL(file);
    donorPhotoInput.value = "";
  };

  [nameInput, amountInput, mobileInput].forEach((input) => {
    input.addEventListener("input", () => {
      checkFormComplete(nameInput, amountInput, mobileInput, saveBtn);
    });
  });

  saveBtn.addEventListener("click", () => {
    saveDonor({
      name: nameInput.value.trim(),
      amount: amountInput.value.trim(),
      mobile: mobileInput.value.trim(),
    });
  });
}

function checkFormComplete(nameInput, amountInput, mobileInput, saveBtn) {
  const isComplete =
    donorPhotoFile &&
    nameInput.value.trim() &&
    amountInput.value.trim() &&
    mobileInput.value.trim();

  if (isComplete) {
    saveBtn.classList.add("show");
  } else {
    saveBtn.classList.remove("show");
  }
}

async function saveDonor(data) {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  if (!donorPhotoFile || !data.name || !data.amount || !data.mobile) {
    alert("Please fill all details");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("photo", donorPhotoFile);
    formData.append("name", data.name);
    formData.append("amount", data.amount);
    formData.append("mobile", data.mobile);

    const res = await fetch(API_PATHS.DONORS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Donor save failed:", result);
      alert(result.message || "Donor save nahi hua");
      return;
    }

    fetchDonors();
  } catch (error) {
    console.error("Donor save error:", error);
    alert("Server error while saving donor");
  }
}

async function deleteDonor(id) {
  const confirmDelete = confirm("Do you want to delete this donor?");
  if (!confirmDelete) return;

  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`${API_PATHS.DONORS}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Donor delete nahi hua");
      return;
    }

    fetchDonors();
  } catch (error) {
    console.error("Donor delete error:", error);
    alert("Server error while deleting donor");
  }
}

donorSearchInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase().trim();

  const filteredDonors = allDonors.filter((donor) => {
    return (
      donor.name.toLowerCase().includes(searchValue) ||
      donor.amount.toLowerCase().includes(searchValue) ||
      donor.mobile.toLowerCase().includes(searchValue)
    );
  });

  renderDonors(filteredDonors);
});

fetchDonors();