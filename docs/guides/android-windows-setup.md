# آماده‌سازی Windows 11 برای توسعه اپ Android

این راهنما برای توسعه Native اپ PersianToolbox روی Windows 11 است. پیش‌فرض پیشنهادی
این پروژه: Android Studio و Gradle به‌صورت native Windows؛ Codex نیز native؛
OpenCode داخل WSL2. repository اصلی روی درایو Windows، مثلاً
`C:\dev\persiantoolbox` نگه‌داری می‌شود.

برای اجرای agent-based این مرحله، از Mission نسخه‌بندی‌شده
[`android-phase-0-windows-bootstrap-v1`](../android/agent-missions/phase-0-windows-bootstrap.md)
و [قالب گزارش](../android/agent-reports/phase-0-windows-bootstrap-template.md) استفاده
کنید. Mission مرجع اجرایی است و این صفحه مرجع نصب و رفع اشکال.

## 1. بررسی سخت‌افزار و Windows

- Windows Update را کامل کنید.
- virtualization را در BIOS/UEFI فعال و در Task Manager > Performance بررسی کنید.
- حداقل عملی: 16GB RAM و 40GB فضای SSD آزاد؛ 32GB برای emulator و build بهتر است.
- یک گوشی Android واقعی و کابل data برای تست دوربین آماده کنید.

WSL2 فقط برای reviewer اختیاری OpenCode لازم است و بخشی از gate اصلی Android نیست.
اگر provider رایگان و قابل استفاده ندارید، نصب WSL2 را نیز می‌توانید فعلاً رد کنید.

## 2. ابزارهای پایه Windows

در PowerShell:

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Microsoft.OpenJDK.17 -e
```

ترمینال را ببندید و دوباره باز کنید:

```powershell
git --version
gh --version
node --version
npm --version
java -version
gh auth login
gh auth status *> $null
if ($LASTEXITCODE -eq 0) { 'github-auth: authenticated' } else { 'github-auth: not authenticated'; exit 1 }
```

Git را با نام و ایمیل واقعی حساب GitHub تنظیم کنید:

```powershell
git config --global user.name "YOUR NAME"
git config --global user.email "YOUR_GITHUB_EMAIL"
git config --global core.autocrlf false
git config --global init.defaultBranch main
```

مقدارهای نمونه را جایگزین کنید. token یا secret را داخل repository یا فایل راهنما
ثبت نکنید.

## 3. Android Studio و SDK

Android Studio stable را از صفحه رسمی نصب کنید و در Setup Wizard این موارد را فعال
کنید:

- Android SDK Platform 36
- Android SDK Build-Tools 36.0.0
- Android SDK Platform-Tools
- Android SDK Command-line Tools (latest)
- Android Emulator

در Android Studio > Settings > Build Tools > Gradle، گزینه Gradle JDK را روی
Embedded JDK (`jbr`) قرار دهید. OpenJDK 17 نصب‌شده در مرحله قبل برای اجرای پایدار
ابزارهای command line تا زمان ایجاد Gradle wrapper است.

Android Studio معمولاً `adb` و `sdkmanager` را به PATH اضافه نمی‌کند. پس از نصب SDK،
در PowerShell معمولی این تنظیم user-scoped را انجام دهید. اگر SDK Location در
Android Studio سفارشی است، فقط مقدار `$sdkRoot` را به همان مسیر محلی تغییر دهید و
آن مسیر را داخل گزارش commit نکنید:

```powershell
$sdkRoot = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$androidBinDirs = @(
  (Join-Path $sdkRoot 'platform-tools'),
  (Join-Path $sdkRoot 'cmdline-tools\latest\bin')
)

$missingDirs = $androidBinDirs | Where-Object { -not (Test-Path $_) }
if ($missingDirs) {
  throw 'Android SDK tools are incomplete; finish SDK Manager setup before continuing.'
}

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$userEntries = @($userPath -split ';' | Where-Object { $_ })
foreach ($directory in $androidBinDirs) {
  if ($userEntries -notcontains $directory) { $userEntries += $directory }
}

[Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdkRoot, 'User')
[Environment]::SetEnvironmentVariable('Path', ($userEntries -join ';'), 'User')
$env:ANDROID_HOME = $sdkRoot
$env:Path = ($androidBinDirs -join ';') + ';' + $env:Path

adb version
sdkmanager --version
```

این دستورها فقط مسیرهای SDK همان کاربر را اضافه می‌کنند و PATH ماشین یا دسترسی
سراسری Codex را تغییر نمی‌دهند.

یک emulator با API 36 و ترجیحاً Google APIs x86_64 بسازید. وابستگی محصول به Google
Play Services نیست؛ این image فقط برای پوشش سازگاری است. برای دوربین و performance
حتماً از گوشی واقعی نیز استفاده کنید.

برای گوشی: Developer options و USB debugging را فعال، driver سازنده را در صورت
نیاز نصب و fingerprint اتصال را تأیید کنید:

```powershell
adb version
adb devices
```

## 4. Clone پروژه

```powershell
New-Item -ItemType Directory -Force C:\dev | Out-Null
Set-Location C:\dev
gh repo clone alirezasafaei-dev/persiantoolbox
Set-Location .\persiantoolbox
git status
```

تا قبل از ایجاد workspace Android، نبودن `android\gradlew.bat` طبیعی است.

## 5. Codex روی Windows

Codex CLI را طبق مستندات رسمی نصب کنید. مسیر npm برای Windows:

```powershell
npm install -g @openai/codex
codex --version
Set-Location C:\dev\persiantoolbox
codex
```

در اولین اجرا با حساب ChatGPT وارد شوید. sandbox نوع `elevated` انتخاب پیشنهادی
است؛ `unelevated` فقط fallback است. دسترسی Codex را به پوشه پروژه محدود نگه دارید
و full-access را پیش‌فرض نکنید.

داخل Codex ابتدا `/status` و سپس `/permissions` را بررسی کنید. `AGENTS.md` مخزن
قرارداد اجرایی پروژه است و نباید با دستور `/init` بازنویسی شود.

مرجع رسمی: [Codex CLI](https://learn.chatgpt.com/docs/codex/cli)،
[AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) و
[Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox).

## 6. OpenCode داخل WSL2

OpenCode برای Windows، WSL را پیشنهاد می‌کند. در Ubuntu:

ابتدا در PowerShell مدیر:

```powershell
wsl --install -d Ubuntu
wsl --update
```

پس از restart، Ubuntu را باز و user/password لینوکس را بسازید. سپس در Ubuntu:

```bash
sudo apt update
sudo apt install -y git curl unzip
curl -fsSL https://opencode.ai/install | bash
exec "$SHELL" -l
opencode --version
cd /mnt/c/dev/persiantoolbox
opencode
```

در TUI دستور `/connect` را اجرا و provider مجاز خود را انتخاب کنید. OpenCode بدون
provider/model قابل استفاده عملی نیست؛ رایگان‌بودن خود ابزار به معنی رایگان‌بودن
مدل نیست. کلید API را فقط در credential store خود OpenCode وارد کنید.

مرجع رسمی: [OpenCode install](https://opencode.ai/docs/) و
[OpenCode on WSL](https://opencode.ai/docs/windows-wsl/).

## 7. قرارداد همکاری agentها

- هر task یک branch: `android/<short-task>`.
- پیش از کار: `git status` باید تمیز باشد.
- یک agent می‌نویسد؛ agent دوم فقط diff را review می‌کند.
- برای نوشتن موازی، worktreeهای جدا الزامی‌اند.
- هیچ agentی signing key، token یا credential را نمی‌خواند یا commit نمی‌کند.
- هر commit باید DCO sign-off داشته باشد: `git commit -s`.
- انتشار، push اجباری، حذف داده و تغییر secret نیازمند تأیید انسان است.

### انتخاب مدل و effort

- inventory، format و گزارش ساده: Luna با effort پایین.
- نصب، doctor و عیب‌یابی معمول Windows: Terra با effort متوسط.
- معماری، Gradle پیچیده، Camera/PDF/OCR و review نهایی: Sol با effort بالا.
- Max/Ultra فقط وقتی یک شکست واقعی یا تصمیم پرریسک توجیهش کند.

در Codex از `/model` برای انتخاب مدل و reasoning effort همان session استفاده کنید.
انتخاب صریح session بر مقدار پیش‌فرض مقدم است.

## 8. Doctor checklist

PowerShell:

```powershell
winget --version
git --version
gh auth status *> $null
if ($LASTEXITCODE -eq 0) { 'github-auth: authenticated' } else { 'github-auth: not authenticated'; exit 1 }
node --version
codex --version
codex --ask-for-approval never exec "Read the active repository instructions and return only their source filenames. Do not edit files."
adb version
adb devices
sdkmanager --version
java -version
```

WSL:

```bash
opencode --version
git --version
test -f /mnt/c/dev/persiantoolbox/AGENTS.md && echo repository-ok
```

پس از ایجاد `android/`:

```powershell
Set-Location C:\dev\persiantoolbox\android
.\gradlew.bat --version
.\gradlew.bat projects
.\gradlew.bat :apps:documents:assembleDebug
.\gradlew.bat test lint
```

## 9. مشکلات رایج

- `adb` پیدا نشد: `platform-tools` را نصب و مسیر SDK را به PATH اضافه کنید.
- emulator کند است: virtualization و Windows Hypervisor Platform را بررسی کنید؛
  تست دوربین را به گوشی واقعی منتقل کنید.
- Gradle از JDK اشتباه استفاده می‌کند: Gradle JDK را به Embedded JDK (`jbr`) برگردانید.
- PowerShell اجرای npm script را مسدود می‌کند: قبل از تغییر execution policy، متن
  خطا و policy فعلی را بررسی کنید؛ تغییر سراسری بدون نیاز انجام ندهید.
- Codex به مسیر دسترسی ندارد: پروژه را زیر `C:\dev` نگه دارید و sandbox permission
  را فقط برای همان مسیر اضافه کنید.
- WSL به فایل‌ها کند دسترسی دارد: OpenCode برای review و تغییرهای محدود روی
  `/mnt/c` مناسب است؛ build اصلی Android را از Windows/Android Studio اجرا کنید.
