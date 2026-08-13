package ir.persiantoolbox.documents

import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import ir.persiantoolbox.designsystem.PersianToolboxTheme
import ir.persiantoolbox.feature.home.HomeUiState
import ir.persiantoolbox.feature.home.HomeScreen
import ir.persiantoolbox.feature.home.PickerDocumentMetadata

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { App() } }
}

@Composable private fun MainActivity.App() {
    val dark = remember { mutableStateOf(false) }
    val homeUiState = remember { mutableStateOf(HomeUiState()) }
    val documentPicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        homeUiState.value = homeUiState.value.onPickerResult(uri?.let(::pickerMetadata))
    }
    PersianToolboxTheme(dark.value) {
        CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
            HomeScreen(
                uiState = homeUiState.value,
                onSelectPdf = { documentPicker.launch(arrayOf("application/pdf")) },
                onAction = { action -> if (action.route == "settings") dark.value = !dark.value },
            )
        }
    }
}

private fun MainActivity.pickerMetadata(uri: Uri): PickerDocumentMetadata {
    val cursor: Cursor? = contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE), null, null, null)
    val name = cursor?.use { result ->
        if (result.moveToFirst()) result.getString(result.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME)) else null
    }
    val size = contentResolver.openAssetFileDescriptor(uri, "r")?.use { it.length } ?: -1L
    return PickerDocumentMetadata(name, size, contentResolver.getType(uri))
}
