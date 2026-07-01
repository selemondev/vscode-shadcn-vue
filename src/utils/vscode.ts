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

export const detectPackageManager = async (): Promise<PackageManager> => {
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

    return toShellPath(`${workspacePath}/${cwd}`);
  }

  const choice = await vscode.window.showQuickPick(
    workspaceFolders.map((f) => f.name)
  );

  if (!choice) { return "./"; }

  return toShellPath(
    workspaceFolders.find((f) => f.name === choice)?.uri.fsPath ?? "./"
  );
};
