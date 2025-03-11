const fs = require("fs");
const http = require("http");
const { spawn, execSync } = require("child_process");

console.log("IPv6 Prefix Watcher is starting...");

const containerToRestart = process.env.TARGET_CONTAINER;

if (!containerToRestart) {
    console.error("Error: TARGET_CONTAINER environment variable is required but not set.");
    process.exit(1);
}

const DOCKER_SOCK_PATH = "/tmp/docker.sock";
let lastPrefix = null;

function getIPv6Prefix() {
    try {
        const output = execSync("ip -6 addr show scope global | grep inet6 | awk '{print $2}'");
        const lines = output.toString().split("\n").filter(line => line.trim() !== "");
        
        for (const line of lines) {
            const address = line.split("/")[0];
            // Ignore ULA (fd00::/8) addresses
            if (!address.startsWith("fd")) {
                return address.split(":").slice(0, 4).join(":");
            }
        }
    } catch (err) {
        console.error("Error retrieving IPv6 address:", err.message);
    }
    return null;
}

function restartDockerContainer() {
    console.log(`IPv6 prefix has changed. Restarting container ${containerToRestart}...`);
    
    if (!fs.existsSync(DOCKER_SOCK_PATH)) {
        console.error("Error: Docker socket not found. Is /var/run/docker.sock mounted?");
        return;
    }

    const options = {
        socketPath: DOCKER_SOCK_PATH,
        path: `/containers/${containerToRestart}/restart`,
        method: "POST"
    };

    const req = http.request(options, (res) => {
        if (res.statusCode === 204) {
            console.log(`Container ${containerToRestart} successfully restarted.`);
        } else {
            console.error(`Error restarting container: ${res.statusCode}`);
        }
    });

    req.on("error", (err) => {
        console.error("Error communicating with Docker API:", err.message);
    });

    req.end();
}

console.log('Start monitoring IPv6 address changes')
const monitor = spawn("ip", ["monitor", "address"]);

monitor.stdout.on("data", (data) => {
    const output = data.toString();
    if (output.includes("inet6")) {
        const newPrefix = getIPv6Prefix();
        if (newPrefix && newPrefix !== lastPrefix) {
            console.log(`New IPv6 prefix detected: ${newPrefix}`);
            restartDockerContainer();
            lastPrefix = newPrefix;
        }
    }
});

monitor.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
});

monitor.on("close", (code) => {
    console.log(`Monitor process exited with code ${code}`);
});
