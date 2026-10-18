package ir.persiantoolbox.testing

import ir.persiantoolbox.common.DetectionResult
import ir.persiantoolbox.common.ImageProcessor
import ir.persiantoolbox.common.OcrEngine
import ir.persiantoolbox.common.PdfEngine
import ir.persiantoolbox.model.*

class FakeImageProcessor(private val image: ImageRef = ImageRef("processed")) : ImageProcessor {
    override suspend fun detectDocument(input: ImageRef) = DetectionResult(null)
    override suspend fun transform(input: ImageRef, crop: Quadrilateral, filter: PageFilter) = image
}
class FakePdfEngine : PdfEngine {
    override suspend fun create(pages: List<ImageRef>, output: FileRef, options: PdfOptions) = PdfResult(output, pages.size)
    override suspend fun merge(inputs: List<FileRef>, output: FileRef) = PdfResult(output, inputs.size)
    override suspend fun split(input: FileRef, ranges: List<PageRange>, outputDir: DirectoryRef) = ranges.mapIndexed { index, range -> PdfResult(FileRef("${outputDir.value}/$index.pdf"), range.endInclusive - range.startInclusive + 1) }
    override suspend fun compress(input: FileRef, output: FileRef, quality: CompressionQuality) = PdfResult(output, 1)
}
class FakeOcrEngine(private val configured: Pair<String, String> = "" to "") : OcrEngine {
    override suspend fun recognize(input: ImageRef, languages: Set<OcrLanguage>) = OcrText(configured.first, configured.second)
}
