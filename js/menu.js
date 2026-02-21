document.getElementById("github-btn").addEventListener("click", () => {
    window.open(
        "https://github.com/tibetmdk/tetrizz",
        "_blank",
        "noopener,noreferrer"
    );
});

// Contact modal
const modal = document.getElementById("contact-modal");
const openBtn = document.getElementById("contact-btn");
const closeBtn = document.getElementById("close-modal");

openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

modal.addEventListener("click", e => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
