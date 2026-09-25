package ir.persiantoolbox.model

@JvmInline value class DocumentId(val value: String)
@JvmInline value class ImageRef(val value: String)
@JvmInline value class FileRef(val value: String)
@JvmInline value class DirectoryRef(val value: String)
enum class ProcessingErrorCode { INVALID_INPUT, ENCRYPTED_PDF, OUT_OF_SPACE, OUT_OF_MEMORY, CANCELLED, ENGINE_FAILURE }
enum class PageFilter { ORIGINAL, COLOR, GRAYSCALE, BLACK_AND_WHITE }
enum class CompressionQuality { HIGH, MEDIUM, LOW }
enum class OcrLanguage { FAS, ENG }
data class Document(val id: DocumentId, val title: String, val pages: List<DocumentPage> = emptyList())
data class DocumentPage(val id: String, val documentId: DocumentId, val order: Int, val image: ImageRef)
data class Quadrilateral(val topLeft: Point, val topRight: Point, val bottomRight: Point, val bottomLeft: Point) {
    init { require(points().toSet().size == 4) { "Quadrilateral points must be unique" }; require(points().all { it.x >= 0f && it.y >= 0f }) }
    fun points() = listOf(topLeft, topRight, bottomRight, bottomLeft)
}
data class Point(val x: Float, val y: Float)
data class PageRange(val startInclusive: Int, val endInclusive: Int) { init { require(startInclusive >= 1 && endInclusive >= startInclusive) } }
data class PdfOptions(val quality: CompressionQuality = CompressionQuality.HIGH)
data class PdfResult(val output: FileRef, val pageCount: Int)
data class OcrText(val original: String, val display: String)
data class ProcessingProgress(val completed: Int, val total: Int)
data class ProcessingJob(val id: String, val progress: ProcessingProgress, val error: ProcessingErrorCode? = null)
