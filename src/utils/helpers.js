export function setButtonText(
  btn,
  isLoading,
  loadingText = "Saving...",
  defautlText = "Save"
) {
  if (isLoading) {
    btn.textContent = loadingText;
  } else {
    btn.textContent = defautlText;
  }
}
