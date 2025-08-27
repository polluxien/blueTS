import {
  Disposable,
  Uri,
  WebviewPanel,
  Webview,
  window,
  ViewColumn,
} from "vscode";

import {
  getAlltsClasses,
  getAlltsFunctions,
} from "./services/tsCompilerApi/analyzerManager";
import {
  addInstanceToInstanceMap,
  compileMethodInClassObject,
  deleteInstanceInInstanceMap,
} from "./services/nodeVM/instanceManager";
import {
  addAllFilesToTestedFilesMap,
  addFilesToTestedFilesMap,
} from "./services/nodeVM/checkTsCodeManager";
import {
  getWorkspaceRessourceForMessage,
  setWorkspace,
} from "./services/workspaceService";
import { compileFunction } from "./services/nodeVM/nodeVMService";

/**
 * Baut auf folgender Beispiel-Klasse von Microsoft auf:
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
          localResourceRoots: [Uri.joinPath(extensionUri, "web-view", "dist")],
        }
      );

      Panel.currentPanel = new Panel(panel, extensionUri);
      return Panel.currentPanel;
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
      "web-view/dist/assets/index.css"
    );
    const scriptUri = this.getUri(
      webview,
      extensionUri,
      "web-view/dist/assets/index.js"
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

  /**
   * https://code.visualstudio.com/api/extension-guides/webview -> Passing messages from an extension to a webview
   *
   * @param message
   */
  public postMessage(message: any) {
    this._panel.webview.postMessage(message);
  }

  // ! Under Construction
  /**
   * https://medium.com/@ashleyluu87/data-flow-from-vs-code-extension-webview-panel-react-components-2f94b881467e
   *0
   * @param webview
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      async (messages: any[]) => {
        //iterier durch alle messages und handel und warte auf ergebnis
        for (let curMessage of messages) {
          switch (curMessage.command) {
            // ? ts Compiler Messages
            case "getAllTsClasses": {
              const messageData = await getAlltsClasses();
              console.log(
                "Sending postAllClasses message with",
                messageData.length,
                "classes"
              );
              console.log(
                "Sending postAllClasses message with",
                JSON.stringify(messageData, null, 2),
                "classes"
              );
              this.postMessage({
                command: "postAllClasses",
                data: messageData,
              });
              break;
            }
            case "getAllTsFunctions": {
              const messageData = await getAlltsFunctions();
              console.log(
                "Sending postAllFunctions message with",
                messageData.length,
                "functions"
              );
              this.postMessage({
                command: "postAllFunctions",
                data: messageData,
              });
              break;
            }
            // ? Instance Messages
            case "createInstance": {
              const messageData = await addInstanceToInstanceMap(
                curMessage.data
              );
              this.postMessage({
                command: "postInstanceCheck",
                data: messageData,
              });
              break;
            }
            case "deleteInstance": {
              await deleteInstanceInInstanceMap(curMessage.data);
              break;
            }
            case "runMethodInInstance": {
              const messageData = await compileMethodInClassObject(
                curMessage.data
              );
              this.postMessage({
                command: "postMethodCheck",
                data: messageData,
              });
              break;
            }
            // ? Function
            case "runFunction": {
              const messageData = await compileFunction(curMessage.data);
              console.log("Sende FunctionCheckRes zurück: ", messageData);
              this.postMessage({
                command: "postFunctionCheck",
                data: messageData,
              });
              break;
            }
            // ? File Messages
            case "testTsFile": {
              const messageData = await addFilesToTestedFilesMap(
                curMessage.data
              );
              this.postMessage({
                command: "postTsCodeCheckMap",
                data: messageData,
              });
              break;
            }
            case "getAllTsFileChecks": {
              const messageData = await addAllFilesToTestedFilesMap();
              this.postMessage({
                command: "postTsCodeCheckMap",
                data: messageData,
              });
              break;
            }
            // ? File Messages
            case "getCurrentDirectory": {
              const messageData = await getWorkspaceRessourceForMessage();
              this.postMessage({
                command: "postCurrentDirectoryRes",
                data: messageData,
              });
              //console.log("getCurrentDirectory: ", JSON.stringify(messageData));
              break;
            }
            case "setCurrentDirectory": {
              const messageData = setWorkspace(curMessage.data);
              this.postMessage({
                command: "postCurrentDirectory",
                data: messageData,
              });

              break;
            }
          }
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
