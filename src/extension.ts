import * as vscode from "vscode";

import {
  getInitCmd,
  getInstallCmd,
  getInstallMultipleComponents,
  getComponentDocLink,
  getRegistry,
  shadCnDocUrl,
} from "./utils/registry";
import { executeCommand } from "./utils/vscode";
import { logCmd } from "./utils/logs";
import type { Components } from "./utils/registry";

const commands = {
  initCli: "shadcn-vue.initCli",
  addNewComponent: "shadcn-vue.addNewComponent",
  addMultipleComponents: "shadcn-vue.addMultipleComponents",
  gotoComponentDoc: "shadcn-vue.gotoComponentDoc",
  reloadComponentList: "shadcn-vue.reloadComponentList",
  gotoDoc: "shadcn-vue.gotoDoc",
} as const;

export function activate(context: vscode.ExtensionContext) {
  let registryData: Components;

  const disposables: vscode.Disposable[] = [
    vscode.commands.registerCommand(commands.initCli, async () => {
      const intCmd = await getInitCmd();
      executeCommand(intCmd);

      await logCmd(intCmd);
    }),
    vscode.commands.registerCommand(commands.addNewComponent, async () => {
      if (!registryData) {
        const newRegistryData = await getRegistry();

        if (!newRegistryData) {
          vscode.window.showErrorMessage("Can not get the component list");
          return;
        }

        registryData = newRegistryData;
      }

      const selectedComponent = await vscode.window.showQuickPick(registryData, {
        matchOnDescription: true,
      });

      if (!selectedComponent) {
        return;
      }

      const installCmd = await getInstallCmd([selectedComponent.label]);
      executeCommand(installCmd);

      await logCmd(installCmd);
    }),

    vscode.commands.registerCommand(commands.addMultipleComponents, async () => {
      if (!registryData) {
        const newRegistryData = await getRegistry();

        if (!newRegistryData) {
          vscode.window.showErrorMessage("Can not get the component list");
          return;
        }

        registryData = newRegistryData;
      }

      const selectedComponents = await vscode.window.showQuickPick(registryData, {
        matchOnDescription: true,
        canPickMany: true
      });

      if (!selectedComponents) {
        return;
      }

      const selectedComponent = selectedComponents.map((component) => component.label);

      const installCmd = await getInstallMultipleComponents(selectedComponent.join(' '));
      executeCommand(installCmd);

      await logCmd(installCmd);
    }),
    vscode.commands.registerCommand(commands.gotoComponentDoc, async () => {
      if (!registryData) {
        const newRegistryData = await getRegistry();

        if (!newRegistryData) {
          vscode.window.showErrorMessage("Can not get the component list");
          return;
        }

        registryData = newRegistryData;
      }

      const selectedComponent = await vscode.window.showQuickPick(registryData, {
        matchOnDescription: true,
      });

      if (!selectedComponent) {
        return;
      }

      const componentDocLink = getComponentDocLink(selectedComponent.label);
      vscode.env.openExternal(vscode.Uri.parse(componentDocLink));

      await logCmd(componentDocLink);
    }),
    vscode.commands.registerCommand(commands.reloadComponentList, async () => {
      const newRegistryData = await getRegistry();

      if (!newRegistryData) {
        vscode.window.showErrorMessage("Can not get the component list");
        return;
      }

      registryData = newRegistryData;
      vscode.window.showInformationMessage("shadcn/vue: Reloaded components");

      await logCmd("reload registry data");
    }),
    vscode.commands.registerCommand(commands.gotoDoc, async () => {
      vscode.env.openExternal(vscode.Uri.parse(shadCnDocUrl));

      await logCmd(shadCnDocUrl);
    }),
  ];

  context.subscriptions.push(...disposables);
}

// This method is called when your extension is deactivated
export function deactivate() {}
