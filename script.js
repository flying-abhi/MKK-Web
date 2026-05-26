const bookingForm = document.getElementById("booking-form");
const programSelect = document.getElementById("program");
const formMessage = document.getElementById("form-message");
const bookButtons = document.querySelectorAll(".book-button");
const submitButton = document.getElementById("submit-button");
const sheetEndpoint = window.MAATI_KE_KHEL_CONFIG?.sheetEndpoint || "";
const formStartedAt = Date.now();

function setFormMessage(message, type) {
  formMessage.textContent = message;
  formMessage.classList.remove("is-error", "is-success");

  if (type) {
    formMessage.classList.add(type === "error" ? "is-error" : "is-success");
  }
}

function clearFieldErrors() {
  const fields = bookingForm.querySelectorAll("input, select, textarea");
  fields.forEach((field) => field.removeAttribute("aria-invalid"));
}

function markFieldInvalid(field) {
  field.setAttribute("aria-invalid", "true");
}

function getValidationError(payload) {
  const childName = payload.childName.trim();
  const parentName = payload.parentName.trim();
  const email = payload.email.trim();
  const phone = payload.phone.trim();
  const childAge = Number(payload.childAge);
  const notes = payload.notes.trim();

  if (!payload.program) {
    return { field: "program", message: "Please select a program." };
  }

  if (!/^[A-Za-z][A-Za-z\s'.-]{1,59}$/.test(childName)) {
    return { field: "child-name", message: "Please enter a valid child name." };
  }

  if (!Number.isInteger(childAge) || childAge < 4 || childAge > 18) {
    return { field: "child-age", message: "Child age must be between 4 and 18." };
  }

  if (!/^[A-Za-z][A-Za-z\s'.-]{1,59}$/.test(parentName)) {
    return { field: "parent-name", message: "Please enter a valid parent name." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { field: "email", message: "Please enter a valid email address." };
  }

  if (!/^\+?[0-9\s-]{10,16}$/.test(phone)) {
    return { field: "phone", message: "Please enter a valid phone number." };
  }

  if (notes.length > 300) {
    return { field: "notes", message: "Notes must be 300 characters or fewer." };
  }

  return null;
}

bookButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedProgram = button.dataset.program;
    programSelect.value = selectedProgram;
    bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
    programSelect.focus();
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFieldErrors();

  const formData = new FormData(bookingForm);
  const payload = Object.fromEntries(formData.entries());
  const spamTrapTriggered = payload.website && payload.website.trim() !== "";
  const submittedTooFast = Date.now() - formStartedAt < 3000;

  if (!sheetEndpoint || sheetEndpoint === "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    setFormMessage(
      "Add your Google Apps Script web app URL in config.js before using Google Sheets booking storage.",
      "error"
    );
    return;
  }

  if (spamTrapTriggered || submittedTooFast) {
    setFormMessage("Submission blocked. Please try again in a few seconds.", "error");
    bookingForm.reset();
    return;
  }

  const validationError = getValidationError(payload);

  if (validationError) {
    const invalidField = document.getElementById(validationError.field);
    if (invalidField) {
      markFieldInvalid(invalidField);
      invalidField.focus();
    }
    setFormMessage(validationError.message, "error");
    return;
  }

  delete payload.website;
  payload.childName = payload.childName.trim();
  payload.parentName = payload.parentName.trim();
  payload.email = payload.email.trim();
  payload.phone = payload.phone.trim();
  payload.notes = payload.notes.trim();
  payload.submittedAt = new Date().toISOString();

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  setFormMessage("Sending booking request...", null);

  fetch(sheetEndpoint, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Submission failed");
      }

      return response.json().catch(() => ({ result: "success" }));
    })
    .then(() => {
      setFormMessage(
        `Booking request received for ${payload.childName} in ${payload.program}. Thank you, ${payload.parentName}. Our team will contact you shortly to confirm the seat.`,
        "success"
      );
      bookingForm.reset();
    })
    .catch(() => {
      setFormMessage(
        "We could not save this booking right now. Please try again after checking the Google Sheets connection.",
        "error"
      );
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = "Confirm Booking Request";
    });
});
