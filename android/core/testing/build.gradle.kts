plugins { alias(libs.plugins.kotlin.jvm) }
dependencies { api(project(":core:model")); api(project(":core:common")); api(libs.kotlinx.coroutines.test); api(libs.junit) }
