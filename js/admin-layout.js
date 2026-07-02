const logoutBtn = document.getElementById("logoutBtn");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.querySelector(".admin-sidebar");
const overlay = document.getElementById("mobileOverlay");
const menuLinks = document.querySelectorAll(".menu-link");
const adminFrame = document.getElementById("adminFrame");

/* Logout same logic */
logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();
  window.location.href = "../index.html";
});

/* Mobile sidebar */
sidebarToggle.addEventListener("click", function () {
  sidebar.classList.add("active");
  overlay.classList.add("active");
});

overlay.addEventListener("click", function () {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

/* Active menu + mobile close */
menuLinks.forEach(link => {
  link.addEventListener("click", function () {
    menuLinks.forEach(item => item.classList.remove("active"));
    this.classList.add("active");

    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
});

/* Iframe ke andar agar purana header/footer aa raha ho to hide */
adminFrame.addEventListener("load", function () {
  try {
    const iframeDoc = adminFrame.contentDocument || adminFrame.contentWindow.document;

    const hideSelectors = [
      "#header",
      "#footer",
      "#floating-icons",
      ".top-header",
      ".navbar-area",
      ".mobile-menu",
      ".overlay"
    ];

    hideSelectors.forEach(selector => {
      iframeDoc.querySelectorAll(selector).forEach(el => {
        el.style.display = "none";
      });
    });

    iframeDoc.body.style.margin = "0";
    iframeDoc.body.style.overflowX = "hidden";

  } catch (error) {
    console.log("Iframe hide header skipped:", error);
  }
});