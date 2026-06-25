# 📱 Guide de Déploiement Mobile - Laura HealthTech

## 🎯 Vue d'Ensemble

Ce guide couvre le déploiement complet des applications mobiles Laura pour iOS et Android en mode production.

---

## 📋 Table des Matières

1. [Architecture Mobile](#architecture-mobile)
2. [Configuration Projet](#configuration-projet)
3. [Build iOS](#build-ios)
4. [Build Android](#build-android)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Publication App Store](#publication-app-store)
7. [Publication Google Play](#publication-google-play)
8. [Monitoring & Analytics](#monitoring--analytics)

---

## 🏗️ Architecture Mobile

### Stack Technologique

```
┌─────────────────────────────────────────────┐
│         Laura Mobile Application            │
├─────────────────────────────────────────────┤
│  Framework: React Native 0.73+              │
│  Language: TypeScript 5.3+                  │
│  State Management: Redux Toolkit            │
│  Navigation: React Navigation 6.x           │
│  UI Components: React Native Paper          │
│  Styling: Styled Components                 │
└─────────────────────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│   iOS Native     │  │  Android Native  │
│   - Swift/ObjC   │  │  - Kotlin/Java   │
│   - Xcode 15+    │  │  - Android Studio│
│   - CocoaPods    │  │  - Gradle 8.x    │
└──────────────────┘  └──────────────────┘
```

### Fonctionnalités Natives

#### iOS (Swift/Objective-C)
- **Biométrie**: Face ID / Touch ID
- **HealthKit**: Intégration données santé iOS
- **Notifications**: APNs (Apple Push Notification service)
- **Camera**: Scan documents optimisé
- **Keychain**: Stockage sécurisé credentials

#### Android (Kotlin/Java)
- **Biométrie**: BiometricPrompt API
- **Google Fit**: Intégration données santé Android
- **Notifications**: FCM (Firebase Cloud Messaging)
- **Camera**: CameraX API pour scan
- **Keystore**: Stockage sécurisé credentials

---

## ⚙️ Configuration Projet

### Structure du Projet Mobile

```
laura-mobile/
├── android/                 # Configuration Android
│   ├── app/
│   │   ├── build.gradle    # Build config
│   │   ├── proguard-rules.pro
│   │   └── src/
│   │       ├── main/
│   │       │   ├── AndroidManifest.xml
│   │       │   ├── java/
│   │       │   └── res/
│   │       └── release/
│   └── gradle.properties
│
├── ios/                     # Configuration iOS
│   ├── LauraHealth/
│   │   ├── Info.plist
│   │   ├── LaunchScreen.storyboard
│   │   └── Images.xcassets/
│   ├── LauraHealth.xcodeproj/
│   ├── LauraHealth.xcworkspace/
│   ├── Podfile
│   └── Podfile.lock
│
├── src/                     # Code source React Native
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── App.tsx
│
├── __tests__/               # Tests
├── .env.production          # Variables d'environnement
├── app.json                 # Configuration app
├── package.json
└── tsconfig.json
```

### Configuration Initiale

#### 1. Installation Dépendances

```bash
# Install dependencies
npm install

# Install iOS Pods
cd ios && pod install && cd ..

# Install Android dependencies
cd android && ./gradlew clean && cd ..
```

#### 2. Variables d'Environnement

```bash
# .env.production
APP_NAME=Laura Health
APP_ENV=production

# API Configuration
API_URL=https://api.laura-health.tn
API_TIMEOUT=30000

# Authentication
JWT_SECRET_KEY=your-production-jwt-secret

# External Services
CNAM_API_URL=https://centre.e-cnam.tn/api
KONNECT_API_KEY=your-production-konnect-key

# Firebase (Android)
FIREBASE_PROJECT_ID=laura-health-prod
GOOGLE_SERVICES_JSON=./android/app/google-services.json

# Apple (iOS)
APPLE_TEAM_ID=YOUR_TEAM_ID
BUNDLE_ID=tn.health.laura
PROVISIONING_PROFILE=Laura_Health_Production

# Analytics
MIXPANEL_TOKEN=your-mixpanel-token
SENTRY_DSN=your-sentry-dsn

# Feature Flags
ENABLE_BIOMETRIC_AUTH=true
ENABLE_OFFLINE_MODE=true
ENABLE_HEALTHKIT=true
ENABLE_GOOGLE_FIT=true
```

#### 3. Configuration app.json

```json
{
  "name": "LauraHealth",
  "displayName": "Laura Health",
  "expo": {
    "name": "Laura Health",
    "slug": "laura-health",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "tn.health.laura",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Laura a besoin d'accéder à votre caméra pour scanner vos documents médicaux.",
        "NSPhotoLibraryUsageDescription": "Laura a besoin d'accéder à vos photos pour importer des documents médicaux.",
        "NSFaceIDUsageDescription": "Laura utilise Face ID pour sécuriser l'accès à votre dossier médical.",
        "NSHealthShareUsageDescription": "Laura souhaite accéder à vos données de santé pour un meilleur suivi.",
        "NSHealthUpdateUsageDescription": "Laura souhaite mettre à jour vos données de santé."
      },
      "associatedDomains": [
        "applinks:laura-health.tn"
      ]
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "tn.health.laura",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ],
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## 🍎 Build iOS (Production)

### Prérequis

- macOS 13+ (Ventura ou plus récent)
- Xcode 15+
- Apple Developer Account (99$/an)
- CocoaPods installé

### Configuration Certificats

#### 1. Création des Certificats

```bash
# Via Fastlane
fastlane match appstore

# Ou manuellement sur Apple Developer Portal:
# 1. Aller sur https://developer.apple.com
# 2. Certificates, Identifiers & Profiles
# 3. Créer:
#    - App ID: tn.health.laura
#    - Distribution Certificate
#    - Provisioning Profile (App Store)
```

#### 2. Configuration Xcode

```bash
# Ouvrir le workspace
cd ios
open LauraHealth.xcworkspace

# Dans Xcode:
# 1. Sélectionner le projet LauraHealth
# 2. Onglet "Signing & Capabilities"
# 3. Team: Sélectionner votre team
# 4. Bundle Identifier: tn.health.laura
# 5. Provisioning Profile: Laura Health Production
# 6. Cocher "Automatically manage signing" (ou manuel si préféré)
```

#### 3. Capabilities iOS

Activer dans Xcode :

- ✅ **Push Notifications**
- ✅ **HealthKit**
- ✅ **Associated Domains** (applinks:laura-health.tn)
- ✅ **Background Modes** (Remote notifications, Background fetch)
- ✅ **Keychain Sharing**
- ✅ **App Groups** (group.tn.health.laura)

### Build Production iOS

#### Manuel (Xcode)

```bash
# 1. Clean build
cd ios
xcodebuild clean -workspace LauraHealth.xcworkspace -scheme LauraHealth

# 2. Archive
xcodebuild archive \
  -workspace LauraHealth.xcworkspace \
  -scheme LauraHealth \
  -configuration Release \
  -archivePath ./build/LauraHealth.xcarchive

# 3. Export IPA
xcodebuild -exportArchive \
  -archivePath ./build/LauraHealth.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ./build/Release
```

#### Fastlane (Automatisé)

```ruby
# ios/fastlane/Fastfile

default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    # Increment build number
    increment_build_number(xcodeproj: "LauraHealth.xcodeproj")
    
    # Get certificates
    match(type: "appstore", readonly: true)
    
    # Build app
    build_app(
      workspace: "LauraHealth.xcworkspace",
      scheme: "LauraHealth",
      configuration: "Release",
      export_method: "app-store",
      output_directory: "./build"
    )
    
    # Upload to TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      apple_id: "YOUR_APPLE_ID"
    )
    
    # Send notification
    slack(
      message: "iOS Build uploaded to TestFlight! 🚀",
      success: true
    )
  end
  
  desc "Deploy to App Store"
  lane :release do
    # Increment version
    increment_version_number(
      bump_type: "patch"
    )
    
    # Build and upload
    beta
    
    # Submit for review
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false,
      force: true,
      metadata_path: "./metadata",
      screenshots_path: "./screenshots"
    )
  end
end
```

```bash
# Exécuter le build
fastlane ios beta        # TestFlight
fastlane ios release     # App Store
```

### Configuration Info.plist

```xml
<!-- ios/LauraHealth/Info.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
<plist version="1.0">
<dict>
    <!-- App Information -->
    <key>CFBundleDisplayName</key>
    <string>Laura Health</string>
    <key>CFBundleIdentifier</key>
    <string>tn.health.laura</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    
    <!-- Privacy Permissions -->
    <key>NSCameraUsageDescription</key>
    <string>Laura a besoin d'accéder à votre caméra pour scanner vos documents médicaux.</string>
    
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Laura a besoin d'accéder à vos photos pour importer des documents médicaux.</string>
    
    <key>NSFaceIDUsageDescription</key>
    <string>Laura utilise Face ID pour sécuriser l'accès à votre dossier médical.</string>
    
    <key>NSHealthShareUsageDescription</key>
    <string>Laura souhaite accéder à vos données de santé pour un meilleur suivi.</string>
    
    <key>NSHealthUpdateUsageDescription</key>
    <string>Laura souhaite mettre à jour vos données de santé.</string>
    
    <!-- App Transport Security -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>laura-health.tn</key>
            <dict>
                <key>NSIncludesSubdomains</key>
                <true/>
                <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
                <false/>
                <key>NSTemporaryExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
            </dict>
        </dict>
    </dict>
    
    <!-- Deep Linking -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>laurahealth</string>
            </array>
        </dict>
    </array>
    
    <!-- Background Modes -->
    <key>UIBackgroundModes</key>
    <array>
        <string>remote-notification</string>
        <string>fetch</string>
    </array>
</dict>
</plist>
```

---

## 🤖 Build Android (Production)

### Prérequis

- Android Studio Arctic Fox ou plus récent
- JDK 17+
- Gradle 8.x
- Google Play Console Account (25$ one-time)

### Configuration Signing

#### 1. Générer Keystore

```bash
# Générer keystore de production
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore laura-health-release.keystore \
  -alias laura-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Laura Health, OU=Mobile, O=Laura HealthTech, L=Tunis, ST=Tunis, C=TN"

# Sauvegarder le keystore dans un endroit sûr!
# Ne JAMAIS commiter dans Git
```

#### 2. Configuration Gradle

```gradle
// android/app/build.gradle

android {
    namespace "tn.health.laura"
    compileSdkVersion 34
    buildToolsVersion "34.0.0"
    
    defaultConfig {
        applicationId "tn.health.laura"
        minSdkVersion 24  // Android 7.0+
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        
        multiDexEnabled true
        
        // ProGuard
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
    
    signingConfigs {
        release {
            if (project.hasProperty('LAURA_RELEASE_STORE_FILE')) {
                storeFile file(LAURA_RELEASE_STORE_FILE)
                storePassword LAURA_RELEASE_STORE_PASSWORD
                keyAlias LAURA_RELEASE_KEY_ALIAS
                keyPassword LAURA_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
        
        release {
            minifyEnabled true
            shrinkResources true
            signingConfig signingConfigs.release
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}

dependencies {
    implementation 'androidx.core:core:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    
    // React Native
    implementation "com.facebook.react:react-android"
    
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-messaging'
    
    // Biometric
    implementation 'androidx.biometric:biometric:1.2.0-alpha05'
    
    // Camera
    implementation 'androidx.camera:camera-camera2:1.3.1'
    implementation 'androidx.camera:camera-lifecycle:1.3.1'
    implementation 'androidx.camera:camera-view:1.3.1'
}

apply plugin: 'com.google.gms.google-services'
```

```properties
# android/gradle.properties

# Signing Config (Ne pas commiter ces valeurs!)
LAURA_RELEASE_STORE_FILE=../laura-health-release.keystore
LAURA_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
LAURA_RELEASE_KEY_ALIAS=laura-release
LAURA_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD

# Performance
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.caching=true

# AndroidX
android.useAndroidX=true
android.enableJetifier=true

# R8 Full Mode
android.enableR8.fullMode=true
```

### Build Production Android

#### Manuel (Gradle)

```bash
# Clean
cd android
./gradlew clean

# Build AAB (Android App Bundle) - Recommandé pour Google Play
./gradlew bundleRelease

# Ou APK
./gradlew assembleRelease

# Output:
# AAB: android/app/build/outputs/bundle/release/app-release.aab
# APK: android/app/build/outputs/apk/release/app-release.apk
```

#### Fastlane (Automatisé)

```ruby
# android/fastlane/Fastfile

default_platform(:android)

platform :android do
  desc "Build and upload to Google Play Internal Track"
  lane :beta do
    # Increment version code
    increment_version_code(
      gradle_file_path: "app/build.gradle"
    )
    
    # Build AAB
    gradle(
      task: "bundle",
      build_type: "Release",
      properties: {
        "android.injected.signing.store.file" => ENV["LAURA_RELEASE_STORE_FILE"],
        "android.injected.signing.store.password" => ENV["LAURA_RELEASE_STORE_PASSWORD"],
        "android.injected.signing.key.alias" => ENV["LAURA_RELEASE_KEY_ALIAS"],
        "android.injected.signing.key.password" => ENV["LAURA_RELEASE_KEY_PASSWORD"],
      }
    )
    
    # Upload to Play Console (Internal Track)
    upload_to_play_store(
      track: 'internal',
      aab: 'app/build/outputs/bundle/release/app-release.aab',
      skip_upload_apk: true,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
    
    # Notification
    slack(
      message: "Android Build uploaded to Play Console Internal Track! 🚀",
      success: true
    )
  end
  
  desc "Deploy to Google Play Production"
  lane :release do
    # Increment version name
    increment_version_name(
      gradle_file_path: "app/build.gradle",
      bump_type: "patch"
    )
    
    # Build
    beta
    
    # Promote to production
    upload_to_play_store(
      track: 'internal',
      track_promote_to: 'production',
      skip_upload_apk: true,
      skip_upload_aab: true,
      skip_upload_metadata: false,
      skip_upload_images: false,
      skip_upload_screenshots: false
    )
  end
end
```

```bash
# Exécuter le build
fastlane android beta      # Internal Track
fastlane android release   # Production
```

### Configuration AndroidManifest.xml

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="tn.health.laura">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- Google Fit (optional) -->
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    
    <!-- Features -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.fingerprint" android:required="false" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">
        
        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- Deep Linking -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="laura-health.tn" />
                <data android:scheme="laurahealth" />
            </intent-filter>
        </activity>
        
        <!-- Firebase Messaging Service -->
        <service
            android:name=".MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
        
        <!-- Notification Metadata -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_notification" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/colorPrimary" />
            
    </application>

</manifest>
```

### ProGuard Configuration

```proguard
# android/app/proguard-rules.pro

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Laura Health specific
-keep class tn.health.laura.** { *; }

# Preserve line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Gson
-keep class com.google.gson.** { *; }
-keepclassm members class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/mobile-deploy.yml

name: Mobile Build & Deploy

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18.x'
  JAVA_VERSION: '17'
  RUBY_VERSION: '3.2'

jobs:
  # iOS Build
  build-ios:
    name: Build iOS
    runs-on: macos-13
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Install dependencies
        run: |
          npm ci
          cd ios && pod install
      
      - name: Setup certificates
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
        run: |
          cd ios
          bundle exec fastlane match appstore --readonly
      
      - name: Build iOS
        env:
          FASTLANE_USER: ${{ secrets.APPLE_ID }}
          FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
        run: |
          cd ios
          bundle exec fastlane beta
      
      - name: Upload IPA artifact
        uses: actions/upload-artifact@v3
        with:
          name: ios-build
          path: ios/build/*.ipa
          
  # Android Build
  build-android:
    name: Build Android
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: ${{ env.JAVA_VERSION }}
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Install dependencies
        run: npm ci
      
      - name: Decode keystore
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
        run: |
          echo $KEYSTORE_BASE64 | base64 -d > android/app/laura-health-release.keystore
      
      - name: Build Android
        env:
          LAURA_RELEASE_STORE_PASSWORD: ${{ secrets.RELEASE_STORE_PASSWORD }}
          LAURA_RELEASE_KEY_PASSWORD: ${{ secrets.RELEASE_KEY_PASSWORD }}
        run: |
          cd android
          bundle exec fastlane beta
      
      - name: Upload AAB artifact
        uses: actions/upload-artifact@v3
        with:
          name: android-build
          path: android/app/build/outputs/bundle/release/*.aab
          
  # Tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 🍎 Publication App Store

### Métadonnées App Store

```
ios/fastlane/metadata/fr-FR/
├── name.txt                    # Laura Health
├── subtitle.txt                # Votre dossier médical centralisé
├── description.txt             # Description complète
├── keywords.txt                # Santé, Médical, Dossier, CNAM, Tunisie
├── marketing_url.txt           # https://laura-health.tn
├── support_url.txt             # https://support.laura-health.tn
├── privacy_url.txt             # https://laura-health.tn/privacy
└── release_notes.txt           # Notes de version
```

#### description.txt
```
Laura Health - Votre Santé Connectée en Tunisie

🏥 DOSSIER MÉDICAL CENTRALISÉ
• Stockez tous vos documents médicaux en un seul endroit sécurisé
• Ordonnances, analyses, imageries, comptes-rendus
• Accessible partout, à tout moment

🤖 INTELLIGENCE ARTIFICIELLE MÉDICALE
• Analyse automatique de vos documents avec OCR avancé
• Recommandations personnalisées basées sur votre dossier
• Assistant IA médical disponible 24/7

📅 GESTION DES RENDEZ-VOUS
• Prenez rendez-vous en ligne avec vos médecins
• Rappels automatiques avant chaque consultation
• Historique complet de vos consultations

🔬 LECTEUR DICOM GRATUIT
• Visualisez vos IRM, scanners et radiographies
• Outils professionnels de mesure et annotation
• Partage sécurisé avec vos médecins

🛡️ INTÉGRATION CNAM
• Connexion directe avec votre compte CNAM
• Suivi de vos remboursements
• Attestation de droits en temps réel

✨ FONCTIONNALITÉS AVANCÉES
• Détection d'interactions médicamenteuses
• Carnet de santé interactif
• Gestion familiale (ayants droit)
• Paiement sécurisé Konnect
• Biométrie (Face ID / Touch ID)
• Mode hors ligne

🔐 SÉCURITÉ & CONFIDENTIALITÉ
• Cryptage end-to-end
• Conformité RGPD
• Hébergement certifié données de santé
• Contrôle total sur vos données

🇹🇳 CONÇU POUR LA TUNISIE
• Interface en français et arabe
• Intégration complète avec l'écosystème santé tunisien
• Support local disponible 24/7

TÉLÉCHARGEZ LAURA HEALTH AUJOURD'HUI ET PRENEZ LE CONTRÔLE DE VOTRE SANTÉ!
```

### Screenshots

Préparer 6-10 screenshots pour chaque taille d'écran :

```
ios/fastlane/screenshots/fr-FR/
├── iPhone-6.7-inch/
│   ├── 1_dashboard.png
│   ├── 2_medical_records.png
│   ├── 3_ai_chat.png
│   ├── 4_appointments.png
│   ├── 5_dicom_viewer.png
│   └── 6_scan_document.png
├── iPhone-6.5-inch/
└── iPad-Pro-12.9-inch/
```

### Soumission App Store

```bash
# Via Fastlane
cd ios
fastlane release

# Ou manuellement :
# 1. Ouvrir Xcode
# 2. Product > Archive
# 3. Window > Organizer
# 4. Distribute App > App Store Connect
# 5. Upload
# 6. Aller sur App Store Connect
# 7. Remplir les métadonnées
# 8. Soumettre pour review
```

---

## 🤖 Publication Google Play

### Métadonnées Google Play

```
android/fastlane/metadata/android/fr-FR/
├── title.txt                   # Laura Health
├── short_description.txt       # Dossier médical + IA + CNAM
├── full_description.txt        # Description complète (4000 chars)
├── video.txt                   # URL vidéo YouTube
└── changelogs/
    └── 1.txt                   # Notes version 1
```

#### full_description.txt
```
Laura Health - Votre Santé Connectée en Tunisie 🇹🇳

[Même contenu que iOS, adapté au format Google Play]
```

### Store Listing Assets

```
android/fastlane/metadata/android/fr-FR/images/
├── featureGraphic.png          # 1024x500px
├── icon.png                    # 512x512px
├── tvBanner.png                # 1280x720px (si TV)
├── phoneScreenshots/
│   ├── 1_dashboard.png
│   ├── 2_medical_records.png
│   ├── 3_ai_chat.png
│   ├── 4_appointments.png
│   ├── 5_dicom_viewer.png
│   └── 6_scan_document.png
└── sevenInchScreenshots/       # Tablette 7"
```

### Content Rating

Répondre au questionnaire Google Play :

- **Catégorie** : Santé & Fitness
- **Contenu médical** : Oui
- **Données personnelles** : Oui (données de santé)
- **Target Age** : 18+ (données médicales sensibles)

### Soumission Google Play

```bash
# Via Fastlane
cd android
fastlane release

# Ou manuellement :
# 1. Aller sur Google Play Console
# 2. Production > Create new release
# 3. Upload AAB
# 4. Remplir release notes
# 5. Review et publish
```

---

## 📊 Monitoring & Analytics

### Firebase Analytics

```typescript
// src/services/analytics.ts

import analytics from '@react-native-firebase/analytics';

export class AnalyticsService {
  // Screen tracking
  static logScreenView(screenName: string) {
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }
  
  // Event tracking
  static logEvent(eventName: string, params?: Record<string, any>) {
    analytics().logEvent(eventName, params);
  }
  
  // User properties
  static setUserProperties(properties: Record<string, any>) {
    Object.entries(properties).forEach(([key, value]) => {
      analytics().setUserProperty(key, String(value));
    });
  }
  
  // Medical specific events
  static logDocumentScanned(documentType: string) {
    this.logEvent('document_scanned', { document_type: documentType });
  }
  
  static logAppointmentBooked(doctorSpecialty: string) {
    this.logEvent('appointment_booked', { specialty: doctorSpecialty });
  }
  
  static logAIChatUsed(messageCount: number) {
    this.logEvent('ai_chat_used', { message_count: messageCount });
  }
}
```

### Sentry Error Tracking

```typescript
// src/services/sentry.ts

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.APP_ENV,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Remove sensitive data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
```

### Performance Monitoring

```typescript
// src/services/performance.ts

import perf from '@react-native-firebase/perf';

export class PerformanceMonitoring {
  static async measureAPICall(apiName: string, fn: () => Promise<any>) {
    const trace = await perf().startTrace(`api_${apiName}`);
    
    try {
      const result = await fn();
      trace.putAttribute('status', 'success');
      return result;
    } catch (error) {
      trace.putAttribute('status', 'error');
      throw error;
    } finally {
      await trace.stop();
    }
  }
  
  static async measureScreenLoad(screenName: string, fn: () => Promise<void>) {
    const trace = await perf().startTrace(`screen_${screenName}`);
    
    try {
      await fn();
    } finally {
      await trace.stop();
    }
  }
}
```

---

## 🎯 Checklist de Déploiement

### Pré-déploiement

- [ ] **Tests complets** : Unitaires, intégration, E2E
- [ ] **Review code** : Code review + analyse statique
- [ ] **Sécurité** : Scan vulnérabilités, audit dépendances
- [ ] **Performance** : Profiling + optimisation
- [ ] **Accessibilité** : WCAG 2.1 AA compliance
- [ ] **Traductions** : Français + Arabe complets
- [ ] **Assets** : Icons, splash screens, screenshots

### iOS Specific

- [ ] **Certificats** : Distribution + Provisioning profiles à jour
- [ ] **Capabilities** : HealthKit, Push Notifications, etc.
- [ ] **Privacy** : Toutes les descriptions d'usage (Info.plist)
- [ ] **TestFlight** : Beta testing avec utilisateurs réels
- [ ] **App Store** : Métadonnées + Screenshots + Vidéo

### Android Specific

- [ ] **Keystore** : Sauvegardé dans un coffre-fort sécurisé
- [ ] **ProGuard** : Configuration optimale
- [ ] **Play Console** : Métadonnées + Screenshots
- [ ] **Internal Testing** : Track interne avec utilisateurs
- [ ] **Permissions** : Justification de chaque permission

### Post-déploiement

- [ ] **Monitoring** : Firebase Analytics + Crashlytics actifs
- [ ] **Alertes** : Configuration alertes erreurs critiques
- [ ] **Documentation** : Docs utilisateur + FAQ
- [ ] **Support** : Équipe support formée
- [ ] **Rollback plan** : Procédure de rollback testée

---

## 📞 Support & Ressources

### Documentation Officielle

- **React Native** : https://reactnative.dev
- **Apple Developer** : https://developer.apple.com
- **Google Play Console** : https://play.google.com/console
- **Fastlane** : https://fastlane.tools

### Contact Équipe Mobile

- **Email** : mobile@laura-health.tn
- **Slack** : #mobile-dev
- **Documentation interne** : https://docs.laura-health.tn/mobile

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2 Février 2026  
**Mainteneur** : Équipe Mobile Laura HealthTech  
**License** : Propriétaire - Laura HealthTech © 2026
