package ir.persiantoolbox.feature.home

private const val PdfMimeType = "application/pdf"
private const val UnnamedPdf = "سند PDF"

data class DocumentSelection(
    val displayName: String,
    val sizeBytes: Long,
    val mimeType: String,
)

data class PickerDocumentMetadata(
    val displayName: String?,
    val sizeBytes: Long,
    val mimeType: String?,
)

data class HomeUiState(
    val selectedDocument: DocumentSelection? = null,
    val errorMessage: String? = null,
) {
    fun onPickerResult(metadata: PickerDocumentMetadata?): HomeUiState {
        if (metadata == null) return copy(errorMessage = null)
        return validateDocumentSelection(metadata.displayName, metadata.sizeBytes, metadata.mimeType).fold(
            onSuccess = { copy(selectedDocument = it, errorMessage = null) },
            onFailure = { copy(errorMessage = it.message ?: "انتخاب فایل ناموفق بود.") },
        )
    }
}

fun validateDocumentSelection(
    displayName: String?,
    sizeBytes: Long,
    mimeType: String?,
): Result<DocumentSelection> = when {
    mimeType != PdfMimeType -> Result.failure(IllegalArgumentException("فقط فایل PDF پشتیبانی می‌شود."))
    sizeBytes < 0 -> Result.failure(IllegalArgumentException("اندازه فایل نامعتبر است."))
    else -> Result.success(
        DocumentSelection(
            displayName = displayName?.trim().takeUnless { it.isNullOrEmpty() } ?: UnnamedPdf,
            sizeBytes = sizeBytes,
            mimeType = PdfMimeType,
        ),
    )
}
