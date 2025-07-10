import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "Webview" is up and running now'
  );

  let webview = vscode.commands.registerCommand("helloworld.webview", () => {
    let panel = vscode.window.createWebviewPanel("webview", "Web View", {
      viewColumn: vscode.ViewColumn.One,
    });

    // will set the html here
    panel.webview.html = `<h1>Classes:</h1>`;
  });

  context.subscriptions.push(webview);
}

export function deactivate() {}
