/**
 * the store of npm scripts
 * @author: Ruan Jiazhen
 * @date: 2024-09-01 12:26:31
 **/

import {
    getNpmScriptFromPackageJson,
    getPackageJsonPathList,
    workspaceRootUri,
} from '../read-npm-scripts';
import * as vscode from 'vscode';

/**
 * promise that indicates whether init package.json scripts list is done
 */
let allNpmScriptPromise: Promise<void> | null = null;

/**
 * all package.json scripts list
 */
let packageJsonScriptsList: PackageJsonScriptsList = [];

/**
 * init package.json scripts list
 */
export async function initPackageJsonScriptsList() {
    let resolveAllNpmScriptPromise = () => {};
    allNpmScriptPromise = new Promise((resolve) => {
        resolveAllNpmScriptPromise = resolve;
    });

    const packageJsonPathList = await getPackageJsonPathList();

    packageJsonScriptsList = await Promise.all(
        packageJsonPathList.map(async (packageJsonPath) => {
            const scriptList = await getNpmScriptFromPackageJson(packageJsonPath);
            return {
                packageJsonPath,
                scriptList,
            };
        })
    );

    resolveAllNpmScriptPromise();
    allNpmScriptPromise = null;
}

// TODO cache quick pick item list

/**
 * the function to get quick pick item list based on packageJsonScriptsList
 */
export async function getQuickPickItemList(): Promise<NpmScriptQuickPickItem[]> {
    if (allNpmScriptPromise) {
        await allNpmScriptPromise;
    }

    const flattenedScriptList = packageJsonScriptsList.flatMap((packageJson) =>
        packageJson.scriptList.map((script) => ({
            ...script,
            packageJsonPath: packageJson.packageJsonPath,
        }))
    );

    const quickPickItemList = flattenedScriptList.map((item) => {
        const relativeRunPath = item.packageJsonPath
            .replace(workspaceRootUri?.fsPath + '\\', '')
            .replace(/package\.json$/, '')
            .replace(/\\$/, '')
            .replace(/\\/g, '/');

        const label = `${item.name}${relativeRunPath ? ` - ${relativeRunPath}` : ''}`;

        return {
            label,
            detail: item.command,
            ...item,
        };
    });

    return quickPickItemList;
}

// TODO watch package.json file changes and update packageJsonScriptsList
