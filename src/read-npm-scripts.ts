import * as path from 'path';
import * as vscode from 'vscode';

interface IPackageFileWithScripts {
    scripts: Record<string, string>;
}

interface IPackageJsonInfo {
    uri: vscode.Uri;
    dirPath: string;
    content: IPackageFileWithScripts;
}

async function findPackageJsonFiles(): Promise<vscode.Uri[]> {
    // Search for package.json files but exclude common dependency/build directories
    const packageJsonFiles = await vscode.workspace.findFiles(
        '**/package.json',
        '{**/node_modules/**,**/dist/**,**/build/**,**/out/**,**/.git/**}'
    );
    return packageJsonFiles;
}

async function readPackageJson(packageJsonUri: vscode.Uri): Promise<IPackageFileWithScripts> {
    const packageJsonTextDocument = await vscode.workspace.openTextDocument(packageJsonUri);
    const packageJsonTextContents = packageJsonTextDocument.getText();
    return JSON.parse(packageJsonTextContents);
}

async function selectPackageJson(): Promise<IPackageJsonInfo | null> {
    const packageJsonFiles = await findPackageJsonFiles();

    if (packageJsonFiles.length === 0) {
        throw new Error('No package.json files found in workspace');
    }
    if (packageJsonFiles.length === 1) {
        const uri = packageJsonFiles[0];
        const content = await readPackageJson(uri);
        const dirPath = path.dirname(uri.fsPath);
        return { uri, dirPath, content };
    } // Multiple package.json files found, let user choose
    // Sort so root package.json appears first
    const sortedPackageJsonFiles = packageJsonFiles.sort((a, b) => {
        const aRelativePath = vscode.workspace.asRelativePath(a);
        const bRelativePath = vscode.workspace.asRelativePath(b);

        // Root package.json should come first
        if (aRelativePath === 'package.json') {
            return -1;
        }
        if (bRelativePath === 'package.json') {
            return 1;
        }

        // Sort others alphabetically
        return aRelativePath.localeCompare(bRelativePath);
    });

    const items = sortedPackageJsonFiles.map((uri) => {
        const relativePath = vscode.workspace.asRelativePath(uri);
        const dirPath = path.dirname(relativePath);

        // Display root as "Root (/)" instead of "."
        const displayLabel = dirPath === '.' ? 'Workspace Root' : dirPath;

        return {
            label: displayLabel,
            description: relativePath,
            uri: uri,
        };
    });

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Multiple package.json files found. Select one:',
    });

    if (!selected) {
        return null;
    }

    const content = await readPackageJson(selected.uri);
    const dirPath = path.dirname(selected.uri.fsPath);
    return { uri: selected.uri, dirPath, content };
}

export async function readNpmScripts(): Promise<{
    scripts: string[];
    packageJsonPath: string;
} | null> {
    try {
        const packageJsonInfo = await selectPackageJson();

        if (!packageJsonInfo) {
            return null; // User cancelled selection
        }

        const packageScripts = Object.keys(packageJsonInfo.content.scripts || {}).sort();

        return {
            scripts: packageScripts,
            packageJsonPath: packageJsonInfo.dirPath,
        };
    } catch (err) {
        vscode.window.showErrorMessage(`Error reading package.json: ${err}`);
        return null;
    }
}
