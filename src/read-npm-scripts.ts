/**
 * the util function about read package.json file and get npm scripts
 **/
import * as vscode from 'vscode';

interface IPackageFileWithScripts {
    scripts: Record<string, string>;
}

// XXX Add support for passing in uri parameters
/**
 * get all package.json file path in the workspace
 * @returns list of package.json file path
 */
export async function getPackageJsonPathList(): Promise<string[]> {
    const workspaceRootUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (!workspaceRootUri) {
        throw new Error('folder needed!');
    }

    const relativePattern = new vscode.RelativePattern(workspaceRootUri, '**/package.json');
    const packageJsonUriList = await vscode.workspace.findFiles(
        relativePattern,
        '**/node_modules/**'
    );

    const packageJsonPathList = packageJsonUriList.map((uri) => uri.fsPath);

    return packageJsonPathList;
}

/**
 * get all npm scripts from package.json file
 * @param packageJsonPath package.json file path
 * @returns list of npm scripts
 */
export async function getNpmScriptFromPackageJson(packageJsonPath: string) {
    if (!packageJsonPath) {
        return [];
    }

    const packageJsonTextDocument = await vscode.workspace.openTextDocument(packageJsonPath);
    const packageJsonTextContents = packageJsonTextDocument.getText();

    const packageJson = JSON.parse(packageJsonTextContents);

    const packageScripts = Object.entries(packageJson.scripts).map(([name, command]) => ({
        name,
        command,
    }));

    if (packageScripts.length === 0) {
        return [];
    }

    return packageScripts;
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
