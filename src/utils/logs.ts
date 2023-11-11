import * as vscode from "vscode";
import { ofetch } from "ofetch"
import { type } from "os";
import { detectPackageManager } from "./vscode";

const BASE_URL = "https://shadcn-ui-logs.vercel.app";

export const logCmd = async (cmd: string) => {
  const packageManager = await detectPackageManager();
  const log = {
    cmd,
    packageManager,
    os: type,
    vscodeVersion: vscode.version,
  };

  const reqUrl = `${BASE_URL}/api/log`;
  const res = await ofetch(reqUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authentication: `Bearer ${process.env.BEARER_TOKE}`,
    },
    body: JSON.stringify(log),
  });
};
