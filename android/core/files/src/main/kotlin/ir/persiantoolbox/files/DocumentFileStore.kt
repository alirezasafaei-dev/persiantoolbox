package ir.persiantoolbox.files

import ir.persiantoolbox.model.ProcessingErrorCode
import java.io.IOException
import java.io.InputStream
import java.nio.channels.FileChannel
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.nio.file.StandardOpenOption

class DocumentFileStore(private val root: Path) {
    init { Files.createDirectories(root) }

    fun writeAtomically(name: String, bytes: ByteArray, beforeCommit: () -> Unit = {}) {
        val destination = destinationFor(name)
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

    fun copyAtomically(name: String, source: InputStream, maximumBytes: Long): Path {
        require(maximumBytes >= 0) { "Maximum import size must not be negative" }
        val destination = destinationFor(name)
        val temporary = Files.createTempFile(root, "$name.", ".tmp")
        try {
            FileChannel.open(temporary, StandardOpenOption.WRITE).use { channel ->
                val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                var importedBytes = 0L
                while (true) {
                    val read = source.read(buffer)
                    if (read < 0) break
                    importedBytes += read
                    require(importedBytes <= maximumBytes) { "Document exceeds the import size limit" }
                    channel.write(java.nio.ByteBuffer.wrap(buffer, 0, read))
                }
                channel.force(true)
            }
            Files.move(temporary, destination, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE)
            return destination
        } finally {
            Files.deleteIfExists(temporary)
        }
    }

    fun cleanupTemporaryFiles(): Int = Files.list(root).use { files ->
        files.filter { it.fileName.toString().endsWith(".tmp") }.map { Files.deleteIfExists(it); 1 }.reduce(0, Int::plus)
    }

    private fun destinationFor(name: String): Path {
        require(name.isNotBlank() && !name.contains('/') && !name.contains('\\')) { "Invalid document name" }
        val destination = root.resolve(name).normalize()
        require(destination.parent == root.normalize()) { "Document must remain inside storage root" }
        return destination
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
