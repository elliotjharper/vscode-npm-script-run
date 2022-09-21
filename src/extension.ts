import * as vscode from 'vscode';
import { readNpmScripts } from './read-npm-scripts';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'elltg-npm-script-run.runNpmScript',
        async () => {
            const namedNpmScripts = await readNpmScripts();

            const selectedNpmScript = await vscode.window.showQuickPick(namedNpmScripts);

            if (!selectedNpmScript) {
                vscode.window.showInformationMessage(
                    'You did not select an npm script. Exiting...'
                );
                return;
            }

            // vscode.window.showInformationMessage(
            //     `Running selected npm script: [${selectedNpmScript}]`
            // );

            const activeTerminal = vscode.window.activeTerminal;
            if (activeTerminal) {
                activeTerminal.show();
                activeTerminal.sendText(`npm run ${selectedNpmScript}`);
            } else {
                vscode.window.showInformationMessage('No active terminal. Exiting...');
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
