package ir.persiantoolbox.common

import ir.persiantoolbox.model.*
import kotlinx.coroutines.flow.Flow

data class DetectionResult(val corners: Quadrilateral?)
interface ProgressReporter { val progress: Flow<ProcessingProgress>; suspend fun report(progress: ProcessingProgress) }
interface ImageProcessor { suspend fun detectDocument(input: ImageRef): DetectionResult; suspend fun transform(input: ImageRef, crop: Quadrilateral, filter: PageFilter): ImageRef }
interface PdfEngine { suspend fun create(pages: List<ImageRef>, output: FileRef, options: PdfOptions): PdfResult; suspend fun merge(inputs: List<FileRef>, output: FileRef): PdfResult; suspend fun split(input: FileRef, ranges: List<PageRange>, outputDir: DirectoryRef): List<PdfResult>; suspend fun compress(input: FileRef, output: FileRef, quality: CompressionQuality): PdfResult }
interface OcrEngine { suspend fun recognize(input: ImageRef, languages: Set<OcrLanguage>): OcrText }
