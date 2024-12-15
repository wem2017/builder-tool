const fs = require("fs");
const https = require('https');
const path = require('path');
const {exec} = require('child_process');

const downloadImage = async (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest);
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
        await downloadImage(link, path.resolve(__dirname, '../assets/images/logo.png'));

        if (framework === "react-native") {
            console.log("React Native TODO");
        } else if (framework === "flutter") {
            await new Promise((resolve, reject) => {
                exec('dart run icons_launcher:create', {cwd: path.resolve(__dirname, '../')}, (err, stdout, stderr) => {
                    if (err) {
                        reject(`Error executing command: ${err}`);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log("Logo updated.\n");

    } catch (error) {
        console.error(error);
    }

};

const updateDomain = async (domain) => {
    replaceTextInFile("https://demo.listarapp.com", domain, "../lib/configs/application.dart");
    console.log("Domain updated.\n");
}

const main = async () => {
    const args = process.argv.slice(2);

    const config = {
        framework: args.find(arg => arg.startsWith("--framework="))?.split("=")[1],
        platform: args.find(arg => arg.startsWith("--platform="))?.split("=")[1],
        name: args.find(arg => arg.startsWith("--name="))?.split("=")[1],
        logo: args.find(arg => arg.startsWith("--logo="))?.split("=")[1],
        domain: args.find(arg => arg.startsWith("--domain="))?.split("=")[1],
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

        if (config.domain) {
            console.log(`Step: Updating domain...${config.domain}`);
            await updateDomain(config.domain);
        }

        console.log("All steps completed successfully.\n");
    } catch (error) {
        console.error(`[ERROR]: ${error.message}`);
    }
};

main();
