# ---- Step 1: Use official Node.js base image ----
    FROM node:18-bullseye

    # ---- Step 2: Install Java 17 and dependencies ----
    RUN apt-get update && apt-get install -y \
        openjdk-17-jdk \
        unzip \
        wget \
        git \
        curl \
        zip \
        libgl1-mesa-glx \
        && rm -rf /var/lib/apt/lists/*
    
    # ---- Step 3: Set environment variables ----
    ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
    ENV ANDROID_SDK_ROOT=/opt/android-sdk
    ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools
    
    # ---- Step 4: Install Android SDK (Command Line Tools) ----
    RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
        cd $ANDROID_SDK_ROOT/cmdline-tools && \
        wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip && \
        unzip cmdline-tools.zip && rm cmdline-tools.zip && \
        mv cmdline-tools latest
    
    RUN yes | sdkmanager --licenses && \
        sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.2.9519653"
    
    # ---- Step 5: Set working directory and copy app ----
    WORKDIR /app
    COPY . .
    
    # ---- Step 6: Install dependencies ----
    RUN npm install -g expo-cli
    RUN npm install
    
    # ---- Step 7: Prebuild (if needed for native) ----
    RUN npx expo prebuild
    
    COPY my-release-key.keystore android/app/
    
    # ---- Step 8: Build release APK ----
    RUN cd android && ./gradlew assembleRelease
    
    # ---- Output path: /app/android/app/build/outputs/apk/release/app-release.apk ----
    