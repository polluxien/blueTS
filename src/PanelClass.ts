import {
  Disposable,
  Uri,
  WebviewPanel,
  Webview,
  window,
  ViewColumn,
} from "vscode";

/**
 * Baut auf folgender Beispiel-Klasse auf:
 * https://github.com/microsoft/vscode-webview-ui-toolkit-samples/blob/main/frameworks/hello-world-react-vite/src/panels/HelloWorldPanel.ts
 *
 * Wurde auf eigene Bedürfnisse angepasst und erweitert
 */
export class Panel {
  //singelton pattern, nur eine Webview kann gleichzeitig exestieren
  public static currentPanel: Panel | undefined;
  private _panel: WebviewPanel;

  //EventListeners
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    /**
     * Custom Text Editor lifecycle -> https://code.visualstudio.com/api/extension-guides/custom-editors
     * Wenn User custom Texteditor schließt wird ein event abgefeuert | User beendet etc
     * An diesem Punkt sollte Extension hinter sich aufräumen
     */
    this._panel.onDidDispose(
      () => this.triggerDispose(),
      null,
      this._disposables
    );

    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    this._setWebviewMessageListener(this._panel.webview);
  }

  //erstelle und/oder zeige Webview
  public static render(extensionUri: Uri) {
    if (Panel.currentPanel) {
      // wenn exestiert schiebe nach oben
      Panel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // wenn nicht exestiert erstelle eins und schiebe nach oben
      const panel = window.createWebviewPanel(
        "reactView", // Identefies Type of Webview
        "redJ View", // Display Titel
        ViewColumn.One,
        //Webview Options
        {
          enableScripts: true,
          localResourceRoots: [Uri.joinPath(extensionUri, "web", "dist")],
        }
      );

      Panel.currentPanel = new Panel(panel, extensionUri);
    }
  }

  triggerDispose() {
    if (!Panel.currentPanel) {
      return;
    }
    Panel.currentPanel = undefined;

    try {
      // entsorge aktuelles web-panel
      this._panel.dispose();

      this._disposables.forEach((disposable) => {
        try {
          disposable?.dispose();
        } catch (err) {
          console.error("Error beim schließen von Eventhandlern der View", err);
        }
      });
    } finally {
      this._disposables = [];
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const stylesUri = this.getUri(
      webview,
      extensionUri,
      "web/dist/assets/index.css"
    );
    const scriptUri = this.getUri(
      webview,
      extensionUri,
      "web/dist/assets/index.js"
    );

    // Debug-Ausgabe
    console.log("Styles URI:", stylesUri.toString());
    console.log("Script URI:", scriptUri.toString());

    //generiere eine zufällige Buchstaben/Zahlenreihenfolge über uuid
    const nonce = crypto.randomUUID();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  // ! Under Construction
  /**
   * https://medium.com/@ashleyluu87/data-flow-from-vs-code-extension-webview-panel-react-components-2f94b881467e
   * 
   * @param webview 
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "hello":
            // Code that should run in response to the hello message command
            window.showInformationMessage(text);
            return;
          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)
        }
      },
      undefined,
      this._disposables
    );
  }

  getUri(webview: Webview, extensionUri: Uri, path: string) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, path));
  }
}
