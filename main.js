const fs = require("fs");
const https = require('https');
const path = require('path');
const {exec} = require('child_process');

const downloadImage = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(cb);
        });
    }).on('error', (err) => {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
};


const replaceTextInFile = (oldText, newText, filePath) => {
    console.log("Replacing text in file...");
    let content = fs.readFileSync(filePath, {encoding: 'utf-8'});
    content = content.replace(oldText, newText);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated: ", filePath);
}


// Validate configuration
const validateConfig = (config) => {
    console.log("Validating configuration...");
    if (!["react-native", "flutter"].includes(config.framework)) {
        throw new Error("Invalid framework. Choose 'react-native' or 'flutter'.");
    }
    if (!["ios", "android", "all"].includes(config.platform)) {
        throw new Error("Invalid platform. Choose 'ios', 'android', or 'all'.");
    }
    console.log("Configuration is valid.");
};

// Update app name
const updateAppName = (platform, framework, name) => {
    console.log("Updating app name...");
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
    console.log("App name updated.");
};

// Copy logo
const updateLogo = (platform, framework, link) => {
    console.log("Updating logo...");
    if (framework === "react-native") {
        console.log("React Native TODO");
    } else if (framework === "flutter") {
        downloadImage(link, path.resolve(__dirname, '../assets/images/logo.png'), (err) => {
            if (err) {
                console.error(`Error downloading image: ${err}`);
            } else {
                exec('dart run icons_launcher:create', {cwd: path.resolve(__dirname, '../')}, (err, stdout, stderr) => {
                    console.log("Updating logo done...");
                });
            }
        });
    }
};


const updateDomain = (domain) => {
    console.log("Updating domain...");
    replaceTextInFile("https://demo.listarapp.com", domain, "../lib/configs/application.dart");
    console.log("Domain updated.");
}

// Main function
const main = async () => {
    const args = process.argv.slice(2);

    const config = {
        framework: args.find(arg => arg.startsWith("--framework="))?.split("=")[1],
        platform: args.find(arg => arg.startsWith("--platform="))?.split("=")[1],
        appName: args.find(arg => arg.startsWith("--appName="))?.split("=")[1],
        logo: args.find(arg => arg.startsWith("--logo="))?.split("=")[1],
        domain: args.find(arg => arg.startsWith("--domain="))?.split("=")[1],
    };
    try {
        validateConfig(config);
        if (config.appName){
            updateAppName(config.platform, config.framework, config.appName);
        }
        if (config.logo){
            updateLogo(config.platform, config.framework, config.logo);
        }
        if (config.domain){
            updateDomain(config.domain);
        }
        console.log("All steps completed successfully.");
    } catch (error) {
        console.error(`[ERROR]: ${error.message}`);
    }
};

main();
