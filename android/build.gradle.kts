import org.gradle.api.artifacts.ProjectDependency

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.compose.compiler) apply false
}

allprojects {
    dependencyLocking {
        lockAllConfigurations()
    }
}

val projectDependencyEdges = allprojects.flatMap { project ->
    project.configurations.flatMap { configuration ->
        configuration.dependencies.withType<ProjectDependency>().map { dependency ->
            Triple(project.path, configuration.name, dependency.path)
        }
    }
}

tasks.register("verifyArchitecture") {
    doLast {
        projectDependencyEdges.forEach { (projectPath, _, target) ->
            when {
                projectPath.startsWith(":core") && (target.startsWith(":feature") || target.startsWith(":apps")) -> error("Forbidden dependency: $projectPath -> $target")
                projectPath.startsWith(":processing") && (target.startsWith(":feature") || target.startsWith(":apps")) -> error("Forbidden dependency: $projectPath -> $target")
                projectPath.startsWith(":feature") && target.startsWith(":feature") && target != projectPath -> error("Feature-to-feature dependency: $projectPath -> $target")
            }
        }
    }
}

val manifestFiles = fileTree(rootDir) { include("**/src/main/AndroidManifest.xml") }.files.toList()
val manifestContents = manifestFiles.associateWith { it.readText() }
val gradlePolicyFiles = fileTree(rootDir) {
    include("**/*.gradle.kts")
    include("**/*.toml")
    exclude("build.gradle.kts")
}.files.toList()
val gradlePolicyContents = gradlePolicyFiles.associateWith { it.readText() }

tasks.register("verifyAndroidPrivacy") {
    doLast {
        manifestContents.forEach { (manifest, text) ->
            check(!text.contains("android.permission.INTERNET")) { "INTERNET permission found in $manifest" }
            check(!text.contains("MANAGE_EXTERNAL_STORAGE")) { "Broad storage permission found in $manifest" }
            check(!text.contains("READ_EXTERNAL_STORAGE")) { "Legacy storage permission found in $manifest" }
            check(!text.contains("WRITE_EXTERNAL_STORAGE")) { "Legacy storage permission found in $manifest" }
        }
        val appManifest = manifestContents.getValue(file("apps/documents/src/main/AndroidManifest.xml"))
        check(appManifest.contains("android:allowBackup=\"false\"")) { "Document backup must be disabled" }
        check(appManifest.contains("androidx.core.content.FileProvider")) { "Secure FileProvider is required" }
        check(appManifest.contains("android:exported=\"false\"")) { "FileProvider must not be exported" }
        gradlePolicyContents.forEach { (file, text) ->
            check(!text.contains("jitpack.io")) { "JitPack found in $file" }
        }
    }
}
tasks.register("dependencyVerification") { dependsOn("verifyArchitecture", "verifyAndroidPrivacy") }
