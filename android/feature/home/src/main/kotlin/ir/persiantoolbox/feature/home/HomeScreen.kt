package ir.persiantoolbox.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

data class HomeAction(val route: String, val label: String)
val homeActions = listOf(
    HomeAction("scan", "اسکن سند"), HomeAction("pdf", "ساخت PDF"), HomeAction("pdf-tools", "ابزارهای PDF"),
    HomeAction("ocr", "تشخیص متن"), HomeAction("recent", "اسناد اخیر"), HomeAction("settings", "تنظیمات")
)

@Composable fun HomeScreen(
    uiState: HomeUiState,
    onSelectPdf: () -> Unit,
    onAction: (HomeAction) -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("جعبه‌ابزار اسناد فارسی", style = MaterialTheme.typography.headlineMedium)
        Text("ابزارهای آفلاین اسناد برای فارسی", style = MaterialTheme.typography.bodyLarge)
        Button(
            onClick = onSelectPdf,
            modifier = Modifier.semantics { contentDescription = "انتخاب فایل PDF از دستگاه" },
        ) { Text("انتخاب فایل PDF") }
        uiState.selectedDocument?.let { document ->
            Text("فایل انتخاب‌شده: ${document.displayName}")
            document.sizeBytes?.let { Text("اندازه: $it بایت") }
        } ?: Text("فایل‌های شما فقط روی همین دستگاه می‌مانند.")
        uiState.errorMessage?.let { message -> Text(text = message) }
        homeActions.forEach { action ->
            Button(onClick = { onAction(action) }, modifier = Modifier.semantics { contentDescription = action.label }) { Text(action.label) }
        }
    }
}
