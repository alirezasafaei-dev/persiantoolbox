package ir.persiantoolbox.feature.home

import ir.persiantoolbox.files.DocumentFileStore
import java.io.InputStream
import java.util.UUID

private const val MaximumPdfImportBytes = 100L * 1024L * 1024L

class LocalPdfImportService(
    private val fileStore: DocumentFileStore,
    private val maximumBytes: Long = MaximumPdfImportBytes,
    private val nextIdentifier: () -> String = { UUID.randomUUID().toString() },
) {
    fun import(selection: DocumentSelection, source: InputStream) {
        require(selection.sizeBytes == null || selection.sizeBytes <= maximumBytes) { "Document exceeds the import size limit" }
        val identifier = nextIdentifier()
        require(identifier.matches(Regex("[A-Za-z0-9_-]+"))) { "Invalid internal document identifier" }
        fileStore.copyAtomically("$identifier.pdf", source, maximumBytes)
    }
}
