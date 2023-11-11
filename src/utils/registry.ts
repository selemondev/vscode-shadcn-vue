import { ofetch } from "ofetch";
import { to } from "./index";
import { detectPackageManager } from "./vscode";

type OgComponent = {
  type: "components:ui";
  name: string;
  files: string[];
  dependencies?: string[];
  registryDependencies?: string[];
};

type Component = {
  label: string;
  detail?: string;
};

export const shadCnDocUrl = "https://shadcn-vue.com/docs";

export type Components = Component[];

export const getRegistry = async (): Promise<Components | null> => {
  const reqUrl = "https://shadcn-vue.com/registry/index.json";
  const [res, err] = await to(ofetch(reqUrl));

  if (err || !res) {
    return null;
  }

  const [data] = await to(res);

  if (!data) {
    return null;
  }

  const components: Components = (data as OgComponent[]).map((c) => {
    const component: Component = {
      label: c.name,
      detail: `dependencies: ${c.dependencies && c.dependencies.length > 0 ? c.dependencies.join(" ") : "no dependency"}`,
    };

    console.log(`Dependencies: ${c.dependencies}`);

    return component;
  });

  return components;
};

export const getInstallCmd = async (components: string[]) => {
  const packageManager = await detectPackageManager();
  const componentStr = components.join(" ");

  if (packageManager === "bun") {
    return `bunx shadcn-vue add ${componentStr}`;
  }

  if (packageManager === "pnpm") {
    return `pnpm dlx shadcn-vue@latest add ${componentStr}`;
  }

  return `npx shadcn-vue@latest add ${componentStr}`;
};

export const getInitCmd = async () => {
  const packageManager = await detectPackageManager();

  if (packageManager === "bun") {
    return "bunx shadcn-vue init";
  }

  if (packageManager === "pnpm") {
    return "pnpm dlx shadcn-vue@latest init";
  }

  return "npx shadcn-vue@latest init";
};

export const getComponentDocLink = (component: string) => {
  return `${shadCnDocUrl}/components/${component}`;
};
