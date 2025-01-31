import "./index.css";
import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "070c6453-a0bb-46aa-bb30-574e3fcfc6eb",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, users]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.prepend(cardElement);
    });

    profileName.textContent = users.name;
    profileDescription.textContent = users.about;
    profileAvatar.src = users.avatar;
  })
  .catch(console.error);

// Profile elements

const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileEditButton = document.querySelector(".profile__edit-btn");
const profileAddButton = document.querySelector(".profile__add-btn");
const profileAvatar = document.querySelector(".profile__avatar");

// Avatar form elements

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarModalSaveBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Edit form elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const modalCloseButton = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Card form elements
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardModalSaveBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");

// Preview image popup elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const modalPreviewCloseButton = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

// Card related elements
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");

let selectedCard, selectedCardId;

function handleCardDelete(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

// Delete form submission handler

function handleDeleteSubmit(evt) {
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Deleting", "Delete");
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Deleting", "Delete");
    });
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

// Like button functionality

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_liked");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardDeleteBtn.addEventListener("click", (evt) =>
    handleCardDelete(cardElement, data._id)
  );

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });
  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }
  return cardElement;
}

function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscapeKey);
}
function handleEditProfileSubmit(evt) {
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  evt.preventDefault();
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      disableButton(
        editModal.querySelector(settings.submitButtonSelector),
        settings
      );
      setButtonText(submitBtn, false);
    });
}

// Add card API
function handleAddCardSubmit(evt) {
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  evt.preventDefault();
  const name = cardNameInput.value;
  const link = cardLinkInput.value;
  disableButton(cardModalSaveBtn, settings);
  api
    .addCard({ name, link })
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      closeModal(cardModal);
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}
//avatar submit handler function
function handleAvatarSubmit(evt) {
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  evt.preventDefault();
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      avatarInput.value = data.avatar;
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
      evt.target.reset();
      disableButton(avatarModalSaveBtn, settings);
    });
  closeModal(avatarModal);
}

profileEditButton.addEventListener("click", () => {
  openModal(editModal);
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  editFormElement.reset();
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
});

modalPreviewCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});
modalCloseButton.addEventListener("click", () => {
  closeModal(editModal);
});

editFormElement.addEventListener("submit", handleEditProfileSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

profileAddButton.addEventListener("click", () => {
  openModal(cardModal);
});
cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

// avatar
avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);
avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

[editModal, cardModal, previewModal, avatarModal, deleteModal].forEach(
  (modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal_opened")) {
        closeModal(modal);
      }
    });
  }
);

enableValidation(settings);
