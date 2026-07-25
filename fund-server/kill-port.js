// Script to kill process on port 3001 (cross-platform)
const { exec } = require("child_process");
const PORT = process.env.PORT || 3001;
const isWindows = process.platform === "win32";

function killOnWindows() {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`No process found on port ${PORT}.`);
        resolve(false);
        return;
      }

      const pids = new Set();
      for (const line of stdout.split("\n")) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1]?.includes(`:${PORT}`)) {
          const pid = parts[parts.length - 1];
          if (/^\d+$/.test(pid) && pid !== "0") {
            pids.add(pid);
          }
        }
      }

      if (pids.size === 0) {
        console.log(`No process found on port ${PORT}.`);
        resolve(false);
        return;
      }

      console.log(
        `Found process(es) on port ${PORT}: ${[...pids].join(", ")}`
      );
      console.log("Killing process(es)...");

      let remaining = pids.size;
      for (const pid of pids) {
        exec(`taskkill /PID ${pid} /F`, (killError) => {
          if (killError) {
            console.error(`Error killing process ${pid}:`, killError.message);
          } else {
            console.log(`Killed process ${pid}`);
          }
          remaining -= 1;
          if (remaining === 0) {
            console.log(`Port ${PORT} is now free.`);
            resolve(true);
          }
        });
      }
    });
  });
}

function killOnUnix() {
  return new Promise((resolve) => {
    exec(`lsof -ti:${PORT}`, (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`No process found on port ${PORT}.`);
        resolve(false);
        return;
      }

      const pids = stdout
        .trim()
        .split("\n")
        .filter((pid) => pid);

      if (pids.length === 0) {
        console.log(`No process found on port ${PORT}.`);
        resolve(false);
        return;
      }

      console.log(`Found process(es) on port ${PORT}: ${pids.join(", ")}`);
      console.log("Killing process(es)...");

      let remaining = pids.length;
      for (const pid of pids) {
        exec(`kill -9 ${pid}`, (killError) => {
          if (killError) {
            console.error(`Error killing process ${pid}:`, killError.message);
          } else {
            console.log(`Killed process ${pid}`);
          }
          remaining -= 1;
          if (remaining === 0) {
            console.log(`Port ${PORT} is now free.`);
            resolve(true);
          }
        });
      }
    });
  });
}

console.log(`Checking for processes on port ${PORT}...`);

(isWindows ? killOnWindows() : killOnUnix()).then(() => process.exit(0));
