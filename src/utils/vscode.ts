import * as vscode from "vscode";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const executeCommand = (cmd: string, createNew = true): void => {
  let terminal = vscode.window.activeTerminal;
  if (createNew || !terminal) {
    terminal = vscode.window.createTerminal();
  }

  terminal.show();
  terminal.sendText(cmd);
};

export const getFileStat = async (fileName: string) => {
  // Get the currently opened workspace folders
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    return null;
  }

  for (const workspaceFolder of workspaceFolders) {
    const filePath = vscode.Uri.joinPath(workspaceFolder.uri, fileName);
    try {
      const fileMetadata = await vscode.workspace.fs.stat(filePath);

      return fileMetadata;
    } catch (error) {
      return null;
    }
  }
};

const PM_FROM_PACKAGE_JSON: Record<string, PackageManager> = {
  npm: "npm",
  pnpm: "pnpm",
  yarn: "yarn",
  bun: "bun",
};

/**
 * Read the workspace's package.json and extract the package manager name.
 *
 * Checks two fields (in priority order):
 * 1. `packageManager` — Corepack standard, e.g. `"pnpm@10.25.0"`
 * 2. `devEngines.packageManager.name` — npm v11+ enforcement field
 *
 * Returns null when neither field is present or the value is unrecognised.
 */
const detectPackageManagerFromPackageJson = async (): Promise<PackageManager | null> => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) { return null; }

  for (const workspaceFolder of workspaceFolders) {
    const pkgUri = vscode.Uri.joinPath(workspaceFolder.uri, "package.json");
    try {
      const raw = await vscode.workspace.fs.readFile(pkgUri);
      const pkg = JSON.parse(Buffer.from(raw).toString("utf-8"));

      // 1. Corepack `packageManager` field: "pnpm@10.25.0+sha512.xxx"
      if (typeof pkg.packageManager === "string") {
        const name = pkg.packageManager.split("@")[0]?.toLowerCase();
        if (name && name in PM_FROM_PACKAGE_JSON) {
          return PM_FROM_PACKAGE_JSON[name];
        }
      }

      // 2. `devEngines.packageManager.name` (npm v11+)
      const devPmName = pkg.devEngines?.packageManager?.name?.toLowerCase();
      if (devPmName && devPmName in PM_FROM_PACKAGE_JSON) {
        return PM_FROM_PACKAGE_JSON[devPmName];
      }
    } catch {
      // package.json missing or unparseable — try next folder
    }
  }

  return null;
};

export const detectPackageManager = async (): Promise<PackageManager> => {
  // 1. Authoritative source: package.json fields
  const fromPkg = await detectPackageManagerFromPackageJson();
  if (fromPkg) { return fromPkg; }

  // 2. Lock-file fallback (original logic)
  const lockFiles = ["bun.lock", "bun.lockb"];
  const results = await Promise.all(
    lockFiles.map((file) =>
      getFileStat(file).catch(err => err.code === 'ENOENT' ? false : Promise.reject(err))
    )
  );

  if (results.some(Boolean)) {
    return 'bun';
  }

  const pnpmLockExists = await getFileStat("pnpm-lock.yaml");
  if (pnpmLockExists) {
    return "pnpm";
  }

  const yarnLockExists = await getFileStat("yarn.lock");
  if (yarnLockExists) {
    return "yarn";
  }

  return "npm";
};


// Windows fsPath uses backslashes, which break in shells like Git Bash;
// forward slashes work in every shell the command may run in.
const toPosixPath = (p: string): string => p.replace(/\\/g, "/");

// WSL cannot resolve Windows drive paths; it mounts them under /mnt/<drive>.
const isWslDefaultTerminal = (): boolean => {
  if (process.platform !== "win32") { return false; }

  const config = vscode.workspace.getConfiguration("terminal.integrated");
  const profileName = config.get<string>("defaultProfile.windows") ?? "";

  if (/wsl/i.test(profileName)) { return true; }

  const profiles =
    config.get<Record<string, { source?: string; path?: string | string[] }>>(
      "profiles.windows"
    ) ?? {};
  const profile = profiles[profileName];

  if (!profile) { return false; }
  if (profile.source === "WSL") { return true; }

  const paths = Array.isArray(profile.path) ? profile.path : [profile.path];
  return paths.some((p) => /wsl(\.exe)?$/i.test(p ?? ""));
};

const toWslPath = (p: string): string =>
  p.replace(/^([a-z]):\//i, (_, drive: string) => `/mnt/${drive.toLowerCase()}/`);

const toShellPath = (p: string): string => {
  const posixPath = toPosixPath(p);
  return isWslDefaultTerminal() ? toWslPath(posixPath) : posixPath;
};

export const getOrChooseCwd = async (): Promise<string> => {
  let cwd = "";
  const prefix = "${workspaceFolder}/";

  const workspaceFolders = (vscode.workspace.workspaceFolders ?? []).filter(
    (f) => f.uri.scheme === "file"
  );

  if (!workspaceFolders.length) { return "./"; }

  const workspacePath = toPosixPath(workspaceFolders[0]?.uri.fsPath ?? "");
  const cwdFromConfig = toPosixPath(
    vscode.workspace
      .getConfiguration()
      .get<string>("terminal.integrated.cwd")
      ?.trim() ?? ""
  );

  if (cwdFromConfig) {
    if (cwdFromConfig.startsWith(prefix)) {
      cwd = cwdFromConfig.slice(prefix.length);
    }
    else if (cwdFromConfig.startsWith(workspacePath)) {
      cwd = cwdFromConfig.replace(new RegExp(`^${workspacePath}/?`), "");
    } else {
      cwd = cwdFromConfig;
    }

    const isAbsoluteCwd =
      cwd.startsWith("/") || /^[a-z]:\//i.test(cwd) || cwd.startsWith("//");
    return toShellPath(isAbsoluteCwd ? cwd : `${workspacePath}/${cwd}`);
  }

  const choice = await vscode.window.showQuickPick(
    workspaceFolders.map((f) => f.name)
  );

  if (!choice) { return "./"; }

  return toShellPath(
    workspaceFolders.find((f) => f.name === choice)?.uri.fsPath ?? "./"
  );
};
