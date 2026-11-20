package ir.persiantoolbox.testing

import ir.persiantoolbox.model.ImageRef
import ir.persiantoolbox.model.OcrLanguage
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class FakesTest {
    @Test fun fakeOcrReturnsConfiguredOriginalAndDisplayText() = runTest {
        val fake = FakeOcrEngine("ي" to "ی")
        val result = fake.recognize(ImageRef("fixture"), setOf(OcrLanguage.FAS))
        assertEquals("ي", result.original)
        assertEquals("ی", result.display)
    }
}
