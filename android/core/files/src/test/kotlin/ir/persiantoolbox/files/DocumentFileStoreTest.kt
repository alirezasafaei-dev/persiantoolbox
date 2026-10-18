package ir.persiantoolbox.files

import ir.persiantoolbox.model.ProcessingErrorCode
import java.io.ByteArrayInputStream
import java.nio.ByteBuffer
import java.nio.channels.WritableByteChannel
import java.nio.file.Files
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class DocumentFileStoreTest {
    @Test fun completesPartialChannelWritesBeforeCommittingData() {
        val channel = PartialWriteChannel(2)

        writeFully(channel, ByteBuffer.wrap("%PDF-local".toByteArray()))

        assertArrayEquals("%PDF-local".toByteArray(), channel.bytes())
    }

    @Test fun importsPdfStreamAtomicallyWithoutLoadingTheWholeFile() {
        val root = Files.createTempDirectory("ptb-files")
        val store = DocumentFileStore(root)

        val imported = store.copyAtomically("imported.pdf", ByteArrayInputStream("%PDF-local".toByteArray()), 1024)

        assertEquals(root.resolve("imported.pdf"), imported)
        assertArrayEquals("%PDF-local".toByteArray(), Files.readAllBytes(imported))
    }

    @Test fun rejectsOversizedImportAndLeavesNoDestinationOrTemporaryFile() {
        val root = Files.createTempDirectory("ptb-files")
        val store = DocumentFileStore(root)

        assertThrows(IllegalArgumentException::class.java) {
            store.copyAtomically("imported.pdf", ByteArrayInputStream(ByteArray(5)), 4)
        }

        assertEquals(false, Files.exists(root.resolve("imported.pdf")))
        assertEquals(0, store.cleanupTemporaryFiles())
    }

    @Test fun rejectedOversizedImportPreservesAnExistingDocument() {
        val root = Files.createTempDirectory("ptb-files")
        val store = DocumentFileStore(root)
        store.writeAtomically("imported.pdf", "previous".toByteArray())

        assertThrows(IllegalArgumentException::class.java) {
            store.copyAtomically("imported.pdf", ByteArrayInputStream(ByteArray(5)), 4)
        }

        assertArrayEquals("previous".toByteArray(), Files.readAllBytes(root.resolve("imported.pdf")))
    }

    @Test fun failedReplacementPreservesLastCommittedDocument() {
        val root = Files.createTempDirectory("ptb-files")
        val store = DocumentFileStore(root)
        store.writeAtomically("document.pdf", "old".toByteArray())
        assertThrows(IllegalStateException::class.java) {
            store.writeAtomically("document.pdf", "new".toByteArray()) { error("interrupted") }
        }
        assertArrayEquals("old".toByteArray(), Files.readAllBytes(root.resolve("document.pdf")))
    }

    @Test fun cleanupIsIdempotent() {
        val root = Files.createTempDirectory("ptb-files")
        val store = DocumentFileStore(root)
        Files.write(root.resolve("orphan.tmp"), "partial".toByteArray())
        assertEquals(1, store.cleanupTemporaryFiles())
        assertEquals(0, store.cleanupTemporaryFiles())
    }

    @Test fun diskFullMapsToStableError() {
        assertEquals(ProcessingErrorCode.OUT_OF_SPACE, DocumentFileStore.mapFailure(java.io.IOException("No space left on device")))
    }

    private class PartialWriteChannel(private val maximumWriteBytes: Int) : WritableByteChannel {
        private val output = ArrayList<Byte>()
        private var open = true

        override fun write(source: ByteBuffer): Int {
            val count = minOf(maximumWriteBytes, source.remaining())
            repeat(count) { output += source.get() }
            return count
        }

        override fun isOpen() = open
        override fun close() { open = false }
        fun bytes() = output.toByteArray()
    }
}
