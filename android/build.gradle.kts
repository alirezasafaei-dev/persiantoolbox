import org.gradle.api.artifacts.ProjectDependency

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.compose.compiler) apply false
}
tasks.register("verifyArchitecture") {
    doLast {
        rootProject.allprojects.forEach { project ->
            project.configurations.forEach { configuration ->
                configuration.dependencies.withType<ProjectDependency>().forEach { dependency ->
                    val target = dependency.path
                    when {
                        project.path.startsWith(":core") && (target.startsWith(":feature") || target.startsWith(":apps")) -> error("Forbidden dependency: ${project.path} -> $target")
                        project.path.startsWith(":processing") && (target.startsWith(":feature") || target.startsWith(":apps")) -> error("Forbidden dependency: ${project.path} -> $target")
                        project.path.startsWith(":feature") && target.startsWith(":feature") -> error("Feature-to-feature dependency: ${project.path} -> $target")
                    }
                }
            }
        }
    }
}
tasks.register("verifyAndroidPrivacy") {
    doLast {
        fileTree(rootDir) { include("**/src/main/AndroidManifest.xml") }.forEach { manifest ->
            val text = manifest.readText()
            check(!text.contains("android.permission.INTERNET")) { "INTERNET permission found in $manifest" }
            check(!text.contains("MANAGE_EXTERNAL_STORAGE")) { "Broad storage permission found in $manifest" }
            check(!text.contains("READ_EXTERNAL_STORAGE")) { "Legacy storage permission found in $manifest" }
            check(!text.contains("WRITE_EXTERNAL_STORAGE")) { "Legacy storage permission found in $manifest" }
        }
        fileTree(rootDir) { include("**/*.gradle.kts"); include("**/*.toml") }.forEach { file ->
            check(!file.readText().contains("jitpack.io")) { "JitPack found in $file" }
        }
    }
}
tasks.register("dependencyVerification") { dependsOn("verifyArchitecture", "verifyAndroidPrivacy") }
