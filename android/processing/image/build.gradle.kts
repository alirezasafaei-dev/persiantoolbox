plugins { alias(libs.plugins.kotlin.jvm) }
dependencies { api(project(":core:model")); api(project(":core:common")); testImplementation(libs.junit) }
