import * as vscode from 'vscode';

interface IPackageFileWithScripts {
    scripts: Record<string, string>;
}

async function readPackageJson(): Promise<IPackageFileWithScripts> {
    const workspaceRootUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (!workspaceRootUri) {
        throw new Error('folder needed!');
    }

    const workspacePackageJsonUri = vscode.Uri.joinPath(workspaceRootUri, './package.json');

    const packageJsonTextDocument = await vscode.workspace.openTextDocument(
        workspacePackageJsonUri
    );

    const packageJsonTextContents = packageJsonTextDocument.getText();

    return JSON.parse(packageJsonTextContents);
}

export async function readNpmScripts(): Promise<string[]> {
    try {
        const packageJson = await readPackageJson();

        const packageScripts = Object.keys(packageJson.scripts).sort();

        return packageScripts;
    } catch (err) {
        return [`No package.json file found! Error: ${err}`];
    }
}
