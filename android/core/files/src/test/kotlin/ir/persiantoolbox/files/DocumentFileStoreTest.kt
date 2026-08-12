package ir.persiantoolbox.files

import ir.persiantoolbox.model.ProcessingErrorCode
import java.nio.file.Files
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Test

class DocumentFileStoreTest {
    @Test fun failedReplacementPreservesLastCommittedDocument() {
        val root = Files.createTempDirectory("ptb-files")
        val store = DocumentFileStore(root)
        store.writeAtomically("document.pdf", "old".toByteArray())
        store.writeAtomically("document.pdf", "new".toByteArray()) { error("interrupted") }
        assertArrayEquals("old".toByteArray(), Files.readAllBytes(root.resolve("document.pdf")))
    }

    @Test fun cleanupIsIdempotent() {
        val root = Files.createTempDirectory("ptb-files")
        val store = DocumentFileStore(root)
        Files.writeString(root.resolve("orphan.tmp"), "partial")
        assertEquals(1, store.cleanupTemporaryFiles())
        assertEquals(0, store.cleanupTemporaryFiles())
    }

    @Test fun diskFullMapsToStableError() {
        assertEquals(ProcessingErrorCode.OUT_OF_SPACE, DocumentFileStore.mapFailure(java.io.IOException("No space left on device")))
    }
}
