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
    if (!["ios", "android", "all"].includes(config.platform)) {
        throw new Error("Invalid platform. Choose 'ios', 'android', or 'all'.");
    }
    console.log("Configuration is success.\n");
};

// Update app name
const updateAppName = async (platform, framework, name) => {
    if (framework === "react-native") {
        console.log("React Native TODO");
    } else if (framework === "flutter") {
        if (platform === "android") {
            replaceTextInFile("android:label=\"Listar FluxPro\"", `android:label="${name}"`, "../android/app/src/main/AndroidManifest.xml");
        } else if (platform === "ios") {
            replaceTextInFile("<string>Listar FluxPro</string>", `<string>${name}</string>`, "../ios/Runner/Info.plist");
        } else {
            replaceTextInFile("android:label=\"Listar FluxPro\"", `android:label="${name}"`, "../android/app/src/main/AndroidManifest.xml");
            replaceTextInFile("<string>Listar FluxPro</string>", `<string>${name}</string>`, "../ios/Runner/Info.plist");
        }
    }
    console.log("App name updated.\n");
};

// Copy logo
const updateLogo = async (platform, framework, link) => {
    try {
        await downloadImage(link, path.resolve(__dirname, '../icons_launcher.png'));

        if (framework === "react-native") {
            console.log("React Native TODO");
        } else if (framework === "flutter") {
            replaceTextInFile("dev_dependencies:", "  \n" +
                "icons_launcher:\n" +
                "  image_path: \"icons_launcher.png\"\n" +
                "  platforms:\n", "../pubspec.yaml");

            if (platform === "ios") {
                replaceTextInFile("platforms:", "platforms:\n    ios:\n      enable: true", "../pubspec.yaml");
            } else if (platform === "android") {
                replaceTextInFile("platforms:", "platforms:\n    android:\n      enable: true", "../pubspec.yaml");
            } else {
                replaceTextInFile("platforms:", "platforms:\n    ios:\n      enable: true\n    android:\n      enable: true", "../pubspec.yaml");
            }

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

const updateSplash = async (platform, framework, link) => {
    try {
        await downloadImage(link, path.resolve(__dirname, '../logo.png'));

        if (framework === "react-native") {
            console.log("React Native TODO");
        } else if (framework === "flutter") {
            copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../assets/images/logo.png'));
            if (platform === "ios") {
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../ios/Runner/Assets.xcassets/icon.imageset/icon.png'));
            } else if (platform === "android") {
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-hdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-mdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xhdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xxhdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xxxhdpi/ic_logo.png'));
            } else {
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../ios/Runner/Assets.xcassets/icon.imageset/icon.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-hdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-mdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xhdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xxhdpi/ic_logo.png'));
                copyFile(path.resolve(__dirname, '../logo.png'), path.resolve(__dirname, '../android/app/src/main/res/drawable-xxxhdpi/ic_logo.png'));
            }
        }

        console.log("splashscreen updated.\n");

    } catch (error) {
        console.error(error);
    }

};

const updateDomain = async (domain) => {
    replaceTextInFile("https://demo.listarapp.com", domain, "../lib/configs/application.dart");
    console.log("Domain updated.\n");
}

const updateColor = async (primary, secondary) => {
    if (primary) {
        replaceTextInFile(`"primary": 'ffe5634d',`, `"primary": '${primary}',`, "../lib/configs/theme.dart");
    }
    if (secondary) {
        replaceTextInFile(`"secondary": "ff4a91a4",`, `"secondary": '${secondary}',`, "../lib/configs/theme.dart");
    }
    console.log("Color updated.\n");
}

const main = async () => {
    const args = process.argv.slice(2);

    const config = {
        framework: args.find(arg => arg.startsWith("--framework="))?.split("=")[1],
        platform: args.find(arg => arg.startsWith("--platform="))?.split("=")[1],
        name: args.find(arg => arg.startsWith("--name="))?.split("=")[1],
        logo: args.find(arg => arg.startsWith("--logo="))?.split("=")[1],
        splashLogo: args.find(arg => arg.startsWith("--splash-logo="))?.split("=")[1],
        domain: args.find(arg => arg.startsWith("--domain="))?.split("=")[1],
        primaryColor: args.find(arg => arg.startsWith("--primary-color="))?.split("=")[1],
        secondaryColor: args.find(arg => arg.startsWith("--secondary-color="))?.split("=")[1],
    };

    try {
        console.log("Step: Validating configuration...");
        validateConfig(config);

        if (config.name) {
            console.log(`Step: Updating app name...${config.name}`);
            await updateAppName(config.platform, config.framework, config.name);
        }

        if (config.logo) {
            console.log(`Step: Updating logo...${config.logo}`);
            await updateLogo(config.platform, config.framework, config.logo);
        }

        if (config.splashLogo) {
            console.log(`Step: Updating splash logo...${config.splashLogo}`);
            await updateSplash(config.platform, config.framework, config.splashLogo);
        }

        if (config.domain) {
            console.log(`Step: Updating domain...${config.domain}`);
            await updateDomain(config.domain);
        }

        if (config.primaryColor || config.secondaryColor) {
            console.log(`Step: Updating color...${config.domain}`);
            await updateColor(config.primaryColor, config.secondaryColor);
        }

        console.log("All steps completed successfully.\n");
    } catch (error) {
        console.error(`[ERROR]: ${error.message}`);
    }
};

main();
