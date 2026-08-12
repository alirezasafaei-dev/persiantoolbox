package ir.persiantoolbox.model

import org.junit.Assert.assertEquals
import org.junit.Test

class ModelTest {
    @Test fun pageRangeIsOneBasedAndOrdered() { assertEquals(1, PageRange(1, 3).startInclusive) }
    @Test(expected = IllegalArgumentException::class) fun pageRangeRejectsReverse() { PageRange(3, 1) }
    @Test(expected = IllegalArgumentException::class) fun quadrilateralRejectsDuplicatePoints() { val p = Point(1f, 1f); Quadrilateral(p, p, Point(2f, 2f), Point(3f, 3f)) }
    @Test fun errorCodesAreStable() { assertEquals("CANCELLED", ProcessingErrorCode.CANCELLED.name) }
    @Test fun mixedOcrLanguagesAreRepresentable() { assertEquals(setOf(OcrLanguage.FAS, OcrLanguage.ENG), setOf(OcrLanguage.FAS, OcrLanguage.ENG)) }
}
