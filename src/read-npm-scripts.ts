import * as vscode from 'vscode';

//const fs = require('fs');
//const packageJsonUri = vscode.Uri.parse('./package.json');

interface IPackageFileWithScripts {
    scripts: Record<string, string>;
}

async function readPackageJson(): Promise<IPackageFileWithScripts> {
    const rootFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (!rootFolderUri) {
        throw new Error('folder needed!');
    }
    //const relativeFileUri = vscode.Uri.file('package.json');
    const fullFileUri = vscode.Uri.joinPath(rootFolderUri, './package.json');

    //const packageJsonUri = vscode.workspace.asRelativePath('/package.json');
    const textDoc = await vscode.workspace.openTextDocument(fullFileUri);
    const fileContents = textDoc.getText();

    return JSON.parse(fileContents);
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
