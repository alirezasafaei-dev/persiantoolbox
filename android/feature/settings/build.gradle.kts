plugins { alias(libs.plugins.android.library); alias(libs.plugins.kotlin.android) }
android { namespace = "ir.persiantoolbox.feature.settings"; compileSdk = 36; defaultConfig { minSdk = 26 } }
