plugins { alias(libs.plugins.android.library); alias(libs.plugins.kotlin.android) }
android { namespace = "ir.persiantoolbox.files"; compileSdk = 36; defaultConfig { minSdk = 26 } }
dependencies { implementation(project(":core:model")); testImplementation(libs.junit) }
