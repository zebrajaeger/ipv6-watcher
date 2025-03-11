# IPv6 Prefix Watcher

This project provides a **Dockerized IPv6 Prefix Watcher**, which monitors changes to the global IPv6 prefix on a Linux server and automatically restarts a specified Docker container when a prefix change is detected.

## Features
- **Real-time monitoring** of IPv6 address changes using `ip monitor`
- **Automatic restart** of a target container upon IPv6 prefix change
- **Uses Docker API via `docker.sock`**, avoiding privileged mode
- **Lightweight Node.js implementation**
- **Includes a `docker-compose.yml` for easy setup**

## Repository
This project is hosted on GitHub: [IPv6-Watcher Repository](https://github.com/zebrajaeger/ipv6-watcher.git)

## Prerequisites
- A **Linux server** with IPv6 enabled
- **Docker and Docker Compose** installed
- The target container must be **managed by Docker**

## Installation
### 1. Clone the Repository
```sh
git clone https://github.com/zebrajaeger/ipv6-watcher.git
cd ipv6-watcher
```

### 2. Configure Environment
Set the target container name in the `docker-compose.yml` file:
```yaml
    environment:
      - TARGET_CONTAINER=your-container-name
```
Replace `your-container-name` with the name of the container you want to restart.

### 3. Start the Service
```sh
docker-compose up -d
```

## How It Works
1. The container runs `ip monitor address` to listen for network changes.
2. When an IPv6 change is detected, it extracts the new **IPv6 prefix**, ignoring ULA (`fd00::/8`) addresses.
3. If the public prefix has changed, the **target Docker container** is restarted.
4. This ensures that your container always operates with an up-to-date IPv6 address.

## Troubleshooting
- **The script does not detect IPv6 changes:** Ensure IPv6 is enabled on your server and that the `ip` command is available.
- **Target container is not restarting:** Verify that the container name is correct and that the Docker API via `docker.sock` is accessible.
- **Permission errors:** Ensure that `/var/run/docker.sock` is properly mounted inside the container.

## License
MIT License. Feel free to modify and distribute.