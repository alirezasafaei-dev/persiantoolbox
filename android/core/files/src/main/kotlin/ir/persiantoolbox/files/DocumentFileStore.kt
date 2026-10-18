package ir.persiantoolbox.files

import ir.persiantoolbox.model.ProcessingErrorCode
import java.io.IOException
import java.nio.channels.FileChannel
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.nio.file.StandardOpenOption

class DocumentFileStore(private val root: Path) {
    init { Files.createDirectories(root) }

    fun writeAtomically(name: String, bytes: ByteArray, beforeCommit: () -> Unit = {}) {
        require(name.isNotBlank() && !name.contains('/') && !name.contains('\\')) { "Invalid document name" }
        val destination = root.resolve(name).normalize()
        require(destination.parent == root.normalize()) { "Document must remain inside storage root" }
        val temporary = Files.createTempFile(root, "$name.", ".tmp")
        try {
            FileChannel.open(temporary, StandardOpenOption.WRITE).use { channel ->
                channel.write(java.nio.ByteBuffer.wrap(bytes))
                channel.force(true)
            }
            beforeCommit()
            Files.move(temporary, destination, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE)
        } finally {
            Files.deleteIfExists(temporary)
        }
    }

    fun cleanupTemporaryFiles(): Int = Files.list(root).use { files ->
        files.filter { it.fileName.toString().endsWith(".tmp") }.map { Files.deleteIfExists(it); 1 }.reduce(0, Int::plus)
    }

    companion object {
        fun mapFailure(error: Throwable): ProcessingErrorCode = when {
            error is java.util.concurrent.CancellationException -> ProcessingErrorCode.CANCELLED
            error.message?.contains("space", ignoreCase = true) == true -> ProcessingErrorCode.OUT_OF_SPACE
            error is OutOfMemoryError -> ProcessingErrorCode.OUT_OF_MEMORY
            error is IllegalArgumentException -> ProcessingErrorCode.INVALID_INPUT
            else -> ProcessingErrorCode.ENGINE_FAILURE
        }
    }
}
