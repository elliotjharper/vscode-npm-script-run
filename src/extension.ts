// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readNpmScripts } from './read-npm-scripts';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "elltg-hello-world" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('elltg-hello-world.helloWorld', async () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        //vscode.window.showInformationMessage('Hello World from elltg-hello-world!');

        const namedNpmScripts = await readNpmScripts();

        const selectedNpmScript = await vscode.window.showQuickPick(namedNpmScripts);

        if (!selectedNpmScript) {
            vscode.window.showInformationMessage('You did not select an npm script. Exiting...');
            return;
        }

        vscode.window.showInformationMessage(`Running selected npm script: [${selectedNpmScript}]`);

        const activeTerminal = vscode.window.activeTerminal;
        if (activeTerminal) {
            activeTerminal.show();
            activeTerminal.sendText(`npm run ${selectedNpmScript}`);
        } else {
            vscode.window.showInformationMessage('No active terminal. Exiting...');
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
