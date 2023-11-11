<p align="center">
 <img align="center" src="https://raw.githubusercontent.com/selemondev/vscode-shadcn-vue/master/src/images/icon.png" height="96" />
 <h1 align="center">
  shadcn-vue
 </h1>
</p>

This VSCode extension will help you install [shadcn/vue](https://shadcn-vue.com) components directly from VS Code.

## Initialize the Shadcn/Vue CLI

![to initialize CLI open the command palette and search for shadcn/vue: install cli command](https://raw.githubusercontent.com/selemondev/vscode-shadcn-vue/master/src/assets/images/init-cli.png)

## Install components

![to initialize CLI open the command palette and search for shadcn/vue: add new component](https://raw.githubusercontent.com/selemondev/vscode-shadcn-vue/master/src/assets/images/add-new-component.png)


## Choose a component to install from the list

![choose a component to install from the list](https://raw.githubusercontent.com/selemondev/vscode-shadcn-vue/master/src/assets/images/add-new-components.png)


## Open the Shadcn-Vue documentation

![open the shadcn-vue documentation](https://raw.githubusercontent.com/selemondev/vscode-shadcn-vue/master/src/assets/images/shadcn-vue-docs.png)


## Navigate to a particular component's documentation page

![navigate to a particular component's documentation page](https://raw.githubusercontent.com/selemondev/vscode-shadcn-vue/master/src/assets/images/shadcn-vue-component-docs.png)



## Shadcn/Vue Snippets

Easily import and use shadcn-vue components with ease using snippets within VSCode. Just type `cn` or `shadcn` in your vue file and choose from an array of components to use.

![shadcn-vue-snippets-example](https://raw.githubusercontent.com/selemondev/vscode-shadcn-vue/master/src/assets/images/shadcn-vue-import.png)


### How it works

| Snippet           | Description                            |
| ----------------- | -------------------------------------- |
| `cn-help`         | How to use shadcn/vue snippets         |
| `cni-[component]` | Adds imports for the component         |
| `cnx-[component]` | Adds the template for the vue component|

### How to use?

1. Components

For `Alert` component, type `cni-alert` to add imports in your vue file, and to use the component, use `cnx-alert`.

> Similarly, for any other component, use `cni-[component]` to add imports and `cnx-[component]` to use.

```tsx
// cni-alert
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// cnx-alert
<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components using the Shadcn/Vue VSCode extension.
  </AlertDescription>
</Alert>;
```

### How to contribute?

Use this link - [Snippet Generation](https://snippet-generator.app/?description=https://shadcn-vue.com/docs/components&tabtrigger=shadcn-&snippet=%22https://shadcn-vue.com/docs/components%22:+%7B%0A++%22prefix%22:+%22shadcn-%22,%0A++%22body%22:+%5B%0A++%5D,%0A++%22description%22:+%22https://shadcn-vue.com/docs/components%22%0A%7D&mode=vscode) to generate snippets and add/update them to the `snippets` folder that is located in the `src` accordingly.


### Credits 

All credits go to these amazing developers

- [Shadcn UI](https://ui.shadcn.com) for creating this beautiful project.
- [Shadcn Vue](https://shadcn-vue.com) for creating the Vue port of Shadcn UI.
- [Radix Vue](https://radix-vue.com) for doing all the hard work to make sure components are accessible.
- [VueUse](https://vueuse.org) for providing many useful utilities.
- [Suhel Makkad](https://github.com/SuhelMakkad/vscode-shadcn-ui) for creating the Shadcn UI VSCode extension.
- [Neeraj Dalal](https://github.com/nrjdalal/shadcn-ui-snippets) for creating the Shadcn UI Snippets VSCode extension.
