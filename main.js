const fs = require("fs");
const https = require('https');
const path = require('path');
const {execSync} = require('child_process');

const downloadImage = async (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                resolve();
            });
        }).on('error', (err) => {
            fs?.unlink?.(dest);
            reject(err.message);
        });
    });
};


const replaceTextInFile = (oldText, newText, filePath) => {
    console.log(`Replacing text in file... ${filePath}`);
    let content = fs.readFileSync(filePath, {encoding: 'utf-8'});
    content = content.replace(oldText, newText);
    fs.writeFileSync(filePath, content, 'utf8');
}


const replaceFile = (currentPath, destinationPath) => {
    if (!fs.existsSync(currentPath)) {
        console.log(`File not found: ${currentPath}`);
        return;
    }

    fs.renameSync(currentPath, destinationPath);

    if (!fs.existsSync(destinationPath)) {
        console.log(`File replacement failed: ${destinationPath}`);
    }

    console.log(`File replaced successfully: ${destinationPath}`);
};

const copyFile = (sourcePath, destinationPath) => {
    if (!fs.existsSync(sourcePath)) {
        console.log(`File not found: ${sourcePath}`);
        return;
    }

    fs.copyFileSync(sourcePath, destinationPath);

    if (!fs.existsSync(destinationPath)) {
        console.log(`File copy failed: ${destinationPath}`);
    } else {
        console.log(`File copied successfully: ${destinationPath}`);
    }
};

// Validate configuration
const validateConfig = (config) => {
    if (!["react-native", "flutter"].includes(config.framework)) {
        throw new Error("Invalid framework. Choose 'react-native' or 'flutter'.");
    }
    console.log("Configuration is success.\n");
};

// Update app name
const updateAppName = async (framework, name) => {
    if (framework === "react-native") {
        console.log("React Native TODO");
    } else if (framework === "flutter") {
        replaceTextInFile("android:label=\"Listar FluxPro\"", `android:label="${name}"`, "../android/app/src/main/AndroidManifest.xml");
        replaceTextInFile("<string>Listar FluxPro</string>", `<string>${name}</string>`, "../ios/Runner/Info.plist");
    }
    console.log("App name updated.\n");
};

// Copy logo
const updateLogo = async (framework, link) => {
    try {
        await downloadImage(link, path.resolve(__dirname, '../icons_launcher.png'));

        if (framework === "react-native") {
            console.log("React Native TODO");
        } else if (framework === "flutter") {
            replaceTextInFile("dev_dependencies:", "  \n" +
                "icons_launcher:\n" +
                "  image_path: \"icons_launcher.png\"\n" +
                "  platforms:\n", "../pubspec.yaml");

            replaceTextInFile("platforms:", "platforms:\n    ios:\n      enable: true\n    android:\n      enable: true", "../pubspec.yaml");

            console.log("Installing icons_launcher package...");
            execSync('flutter pub add --dev icons_launcher', {cwd: path.resolve(__dirname, '../')});

            console.log("Creating icons...");
            execSync('dart run icons_launcher:create', {cwd: path.resolve(__dirname, '../')});
        }

        console.log("Logo updated.\n");

    } catch (error) {
        console.error(error);
    }

};

// update splash screen
const updateSplash = async (framework, link) => {
    try {
        await downloadImage(link, path.resolve(__dirname, '../logo.png'));

        if (framework === "react-native") {
            console.log("React Native TODO");
        } else if (framework === "flutter") {
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../assets/images/logo.png'));
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../ios/Runner/Assets.xcassets/icon.imageset/icon.png'));
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-hdpi/ic_logo.png'));
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-mdpi/ic_logo.png'));
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xhdpi/ic_logo.png'));
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xxhdpi/ic_logo.png'));
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xxxhdpi/ic_logo.png'));
        }

        console.log("splashscreen updated.\n");

    } catch (error) {
        console.error(error);
    }

};

// update domain
const updateDomain = async (framework, domain) => {
    if (framework === "react-native") {
        console.log("React Native TODO");
    } else if (framework === "flutter") {
        replaceTextInFile("https://demo.listarapp.com", domain, "../lib/configs/application.dart");
    }
    console.log("Domain updated.\n");
}

const updateColor = async (framework, primary) => {
    if (framework === "react-native") {
        console.log("React Native TODO");
    } else if (framework === "flutter") {
        replaceTextInFile(`"primary": 'ffe5634d',`, `"primary": 'ff${primary}',`, "../lib/configs/theme.dart");
    }
    console.log("Color updated.\n");
}

const updateApiKey = async (framework, key) => {
    if (framework === "react-native") {
        console.log("React Native TODO");
    } else if (framework === "flutter") {
        replaceTextInFile("AIzaSyDg1evvc68xACuU2RsbBiV5uoF0vwVNM8Y", key, "../ios/Runner/AppDelegate.swift");
        replaceTextInFile("AIzaSyDg1evvc68xACuU2RsbBiV5uoF0vwVNM8Y", key, "../android/app/src/main/AndroidManifest.xml");
    }

    console.log("Api Key updated.\n");
}

const updateFirebaseIOS = async (link) => {
    try {
        await downloadImage(link, path.resolve(__dirname, '../ios/Runner/GoogleService-Info.plist'));
        console.log("Updated firebase iOS.\n");
    } catch (error) {
        console.error(error);
    }
}

const updateFirebaseAndroid = async (link) => {
    try {
        await downloadImage(link, path.resolve(__dirname, '../android/app/google-services.json'));
        console.log("Updated firebase Android.\n");
    } catch (error) {
        console.error(error);
    }
}

const updateAdmobIOS = async (key) => {
    replaceTextInFile("ca-app-pub-3940256099942544~1458002511", key, "../ios/Runner/Info.plist");
    console.log("Updated admob iOS.\n");
}

const updateAdmobAndroid = async (key) => {
    replaceTextInFile("ca-app-pub-3940256099942544~3347511713", key, "../android/app/src/main/AndroidManifest.xml");
    console.log("Updated admob Android.\n");
}

const main = async () => {
    const args = process.argv.slice(2);

    const config = {
        framework: args.find(arg => arg.startsWith("--framework="))?.split("=")[1],
        name: args.find(arg => arg.startsWith("--name="))?.split("=")[1],
        logo: args.find(arg => arg.startsWith("--logo="))?.split("=")[1],
        splashLogo: args.find(arg => arg.startsWith("--splash-logo="))?.split("=")[1],
        domain: args.find(arg => arg.startsWith("--domain="))?.split("=")[1],
        primaryColor: args.find(arg => arg.startsWith("--primary-color="))?.split("=")[1],
        apiKey: args.find(arg => arg.startsWith("--api-key="))?.split("=")[1],
        firebaseIOS: args.find(arg => arg.startsWith("--firebase-ios="))?.split("=")[1],
        firebaseAndroid: args.find(arg => arg.startsWith("--firebase-android="))?.split("=")[1],
        admobIOS: args.find(arg => arg.startsWith("--admob-ios="))?.split("=")[1],
        admobAndroid: args.find(arg => arg.startsWith("--admob-android="))?.split("=")[1],
    };

    try {
        console.log("Step: Validating configuration...");
        validateConfig(config);

        if (config.name) {
            console.log(`Step: Updating app name...${config.name}`);
            await updateAppName(config.framework, config.name);
        }

        if (config.logo) {
            console.log(`Step: Updating logo...${config.logo}`);
            await updateLogo(config.framework, config.logo);
        }

        if (config.splashLogo) {
            console.log(`Step: Updating splash logo...${config.splashLogo}`);
            await updateSplash(config.framework, config.splashLogo);
        }

        if (config.domain) {
            console.log(`Step: Updating domain...${config.domain}`);
            await updateDomain(config.framework, config.domain);
        }

        if (config.primaryColor) {
            console.log(`Step: Updating color...${config.domain}`);
            await updateColor(config.framework, config.primaryColor);
        }

        if (config.apiKey) {
            console.log(`Step: Updating google Api Key...${config.apiKey}`);
            await updateApiKey(config.framework, config.apiKey);
        }

        if (config.firebaseIOS) {
            console.log(`Step: Updating GoogleService-Info.plist ...${config.firebaseIOS}`);
            await updateFirebaseIOS(config.firebaseIOS);
        }

        if (config.firebaseAndroid) {
            console.log(`Step: Updating google-services.json ...${config.firebaseAndroid}`);
            await updateFirebaseAndroid(config.firebaseAndroid);
        }

        if (config.admobIOS) {
            console.log(`Step: Updating admob iOS ...${config.admobIOS}`);
            await updateAdmobIOS(config.admobIOS);
        }

        if (config.admobAndroid) {
            console.log(`Step: Updating admob Android ...${config.admobAndroid}`);
            await updateAdmobAndroid(config.admobAndroid);
        }

        console.log("All steps completed successfully.\n");
    } catch (error) {
        console.error(`[ERROR]: ${error.message}`);
    }
};

main();
