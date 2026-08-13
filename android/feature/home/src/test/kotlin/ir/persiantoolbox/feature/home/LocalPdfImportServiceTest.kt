package ir.persiantoolbox.feature.home

import ir.persiantoolbox.files.DocumentFileStore
import java.io.ByteArrayInputStream
import java.nio.file.Files
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class LocalPdfImportServiceTest {
    @Test fun importsPdfToAnOpaqueAppPrivateFileName() {
        val root = Files.createTempDirectory("ptb-import")
        val service = LocalPdfImportService(DocumentFileStore(root)) { "stored-id" }
        val selection = DocumentSelection("contract.pdf", 10, "application/pdf")

        service.import(selection, ByteArrayInputStream("%PDF-local".toByteArray()))

        val imported = root.resolve("stored-id.pdf")
        assertArrayEquals("%PDF-local".toByteArray(), Files.readAllBytes(imported))
        assertFalse(Files.exists(root.resolve("contract.pdf")))
    }

    @Test fun rejectsAStoredNameGeneratorThatDoesNotProduceAnIdentifier() {
        val root = Files.createTempDirectory("ptb-import")
        val service = LocalPdfImportService(DocumentFileStore(root)) { "../unsafe" }
        val selection = DocumentSelection("contract.pdf", 10, "application/pdf")

        val result = runCatching { service.import(selection, ByteArrayInputStream("%PDF-local".toByteArray())) }

        assertEquals(IllegalArgumentException::class.java, result.exceptionOrNull()!!::class.java)
        assertEquals(0, Files.list(root).use { it.count() })
    }

    @Test fun rejectsMetadataThatExceedsTheImportLimitBeforeReadingOrWriting() {
        val root = Files.createTempDirectory("ptb-import")
        val service = LocalPdfImportService(DocumentFileStore(root), maximumBytes = 4) { "stored-id" }
        val selection = DocumentSelection("contract.pdf", 5, "application/pdf")

        val result = runCatching { service.import(selection, ByteArrayInputStream(ByteArray(0))) }

        assertEquals(IllegalArgumentException::class.java, result.exceptionOrNull()!!::class.java)
        assertEquals(0, Files.list(root).use { it.count() })
    }

    @Test fun boundsUnknownProviderSizeWhileStreaming() {
        val root = Files.createTempDirectory("ptb-import")
        val service = LocalPdfImportService(DocumentFileStore(root), maximumBytes = 4) { "stored-id" }
        val selection = DocumentSelection("contract.pdf", null, "application/pdf")

        val result = runCatching { service.import(selection, ByteArrayInputStream(ByteArray(5))) }

        assertEquals(IllegalArgumentException::class.java, result.exceptionOrNull()!!::class.java)
        assertEquals(0, Files.list(root).use { it.count() })
    }
}
