plugins { alias(libs.plugins.android.application); alias(libs.plugins.kotlin.android); alias(libs.plugins.compose.compiler) }
android { namespace = "ir.persiantoolbox.documents"; compileSdk = 36
    defaultConfig { applicationId = "ir.persiantoolbox.documents"; minSdk = 26; targetSdk = 36; versionCode = 1; versionName = "1.0.0"; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    buildTypes { release { isMinifyEnabled = true; isShrinkResources = true; proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro") } }
    buildFeatures { compose = true }
}
dependencies { implementation(project(":core:designsystem")); implementation(project(":core:files")); implementation(project(":feature:home")); implementation(libs.androidx.core.ktx); implementation(libs.androidx.activity.compose); implementation(platform(libs.androidx.compose.bom)); implementation(libs.androidx.compose.ui); implementation(libs.androidx.compose.material3) }
