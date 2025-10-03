import * as vscode from 'vscode';
import { readNpmScripts } from './read-npm-scripts';

function openScriptInTerminal(
    terminal: vscode.Terminal | undefined,
    selectedNpmScript: string,
    packageJsonPath: string
): void {
    if (terminal) {
        terminal.show();
        terminal.sendText(`cd "${packageJsonPath}"`);
        terminal.sendText(`npm run ${selectedNpmScript}`);
    } else {
        vscode.window.showInformationMessage('No active terminal. Exiting...');
    }
}

async function readNpmScriptsMain(openNewTerminal: boolean): Promise<void> {
    const result = await readNpmScripts();

    if (!result) {
        vscode.window.showInformationMessage('No package.json selected or found. Exiting...');
        return;
    }

    const { scripts: namedNpmScripts, packageJsonPath } = result;

    if (namedNpmScripts.length === 0) {
        vscode.window.showInformationMessage('No npm scripts found in package.json. Exiting...');
        return;
    }

    const selectedNpmScript = await vscode.window.showQuickPick(namedNpmScripts);

    if (!selectedNpmScript) {
        vscode.window.showInformationMessage('You did not select an npm script. Exiting...');
        return;
    }

    let terminal: vscode.Terminal | undefined;
    if (openNewTerminal) {
        terminal = vscode.window.createTerminal();
    } else {
        terminal = vscode.window.activeTerminal;
    }

    openScriptInTerminal(terminal, selectedNpmScript, packageJsonPath);
}

export function activate(context: vscode.ExtensionContext) {
    let runNpmScriptCurrentTerminal = vscode.commands.registerCommand(
        'elltg-npm-script-run.runNpmScriptCurrentTerminal',
        async () => {
            await readNpmScriptsMain(false);
        }
    );
    context.subscriptions.push(runNpmScriptCurrentTerminal);

    let runNpmScriptNewTerminal = vscode.commands.registerCommand(
        'elltg-npm-script-run.runNpmScriptNewTerminal',
        async () => {
            await readNpmScriptsMain(true);
        }
    );
    context.subscriptions.push(runNpmScriptNewTerminal);
}

export function deactivate() {}
