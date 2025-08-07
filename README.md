# StorageManager

Test system for managing the balance of all goods in the storage, their receipts and shipments.

## Setup

### Clone the Repository
- Open the terminal in needed folder (click mouse **Right Button** in the free space of folder and chouse **Open in Terminal**)

- In opened terminal window run command:  
```powershall
git clone https://github.com/RamanShuliak/StorageManager.git  
```

### Create Docker-container with the system builds
- Install Docker Desktop on your machine (if it is not installed yet) and start it

- Go to repository folder after it cloning

- Open the terminal and run command to create container with Client app, Server app & PostgreSQL DB:  

```powershall
docker-compose up -d
```

## Usage
- Open Docker Desktop and run storagemanager container with all three components (if they are not running yet)

- Move to component **client-1** and click mouse **Left Button** on port **3000:80**

- After this actions Client app will be opened by the tour default browser on the Balance page and you will be able to use the system