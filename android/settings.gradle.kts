import org.gradle.api.initialization.resolve.RepositoriesMode

pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
    resolutionStrategy {
        eachPlugin {
            when (requested.id.id) {
                "com.android.application", "com.android.library" -> useModule("com.android.tools.build:gradle:${requested.version}")
            }
        }
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "persiantoolbox-android"
include(":apps:documents")
include(":core:common", ":core:model", ":core:designsystem", ":core:database", ":core:files", ":core:testing")
include(":processing:image", ":processing:pdf", ":processing:ocr")
include(":feature:home", ":feature:scan", ":feature:editor", ":feature:pdf-tools", ":feature:ocr", ":feature:settings")
