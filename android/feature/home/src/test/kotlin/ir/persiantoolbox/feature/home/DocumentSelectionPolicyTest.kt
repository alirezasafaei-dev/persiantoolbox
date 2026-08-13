package ir.persiantoolbox.feature.home

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DocumentSelectionPolicyTest {
    @Test fun acceptsPdfMetadataWithoutRetainingTheSourceUri() {
        val result = validateDocumentSelection("contract.pdf", 2048, "application/pdf")

        assertTrue(result.isSuccess)
        assertEquals(DocumentSelection("contract.pdf", 2048, "application/pdf"), result.getOrThrow())
    }

    @Test fun givesBlankPdfNameAPersianSafeFallback() {
        val result = validateDocumentSelection("  ", 0, "application/pdf")

        assertEquals("سند PDF", result.getOrThrow().displayName)
    }

    @Test fun rejectsUnsupportedDocumentTypesBeforeTheyReachTheUi() {
        val result = validateDocumentSelection("scan.jpg", 512, "image/jpeg")

        assertTrue(result.isFailure)
        assertEquals("فقط فایل PDF پشتیبانی می‌شود.", result.exceptionOrNull()?.message)
    }

    @Test fun rejectsNegativeDocumentSizes() {
        val result = validateDocumentSelection("contract.pdf", -1, "application/pdf")

        assertTrue(result.isFailure)
        assertEquals("اندازه فایل نامعتبر است.", result.exceptionOrNull()?.message)
    }

    @Test fun cancellationKeepsThePreviouslySelectedDocumentVisible() {
        val selected = DocumentSelection("contract.pdf", 2048, "application/pdf")

        val state = HomeUiState(selectedDocument = selected).onPickerResult(null)

        assertEquals(selected, state.selectedDocument)
        assertEquals(null, state.errorMessage)
    }

    @Test fun invalidPickerMetadataPreservesSelectionAndShowsAPersianError() {
        val selected = DocumentSelection("contract.pdf", 2048, "application/pdf")

        val state = HomeUiState(selectedDocument = selected).onPickerResult(
            PickerDocumentMetadata("photo.jpg", 512, "image/jpeg"),
        )

        assertEquals(selected, state.selectedDocument)
        assertEquals("فقط فایل PDF پشتیبانی می‌شود.", state.errorMessage)
    }
}
