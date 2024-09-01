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

/** the quick pick item list only sorted by package.json path */
let quickPickItemList: NpmScriptQuickPickItem[] | null = null;

/** the quick pick item list shown in quick pick */
let shownQuickPickItemList: NpmScriptQuickPickItem[] | null = null;

/**
 * the function to get quick pick item list based on packageJsonScriptsList
 */
export async function getQuickPickItemList(): Promise<NpmScriptQuickPickItem[]> {
    if (allNpmScriptPromise) {
        await allNpmScriptPromise;
    }

    if (shownQuickPickItemList) {
        return shownQuickPickItemList;
    }

    const flattenedScriptList = packageJsonScriptsList.flatMap((packageJson) =>
        packageJson.scriptList.map((script) => ({
            ...script,
            packageJsonPath: packageJson.packageJsonPath,
        }))
    );

    quickPickItemList = flattenedScriptList
        .map((item) => {
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
        })
        // sort by label
        .sort((a, b) => {
            const packageJsonPathCompare = a.packageJsonPath.localeCompare(b.packageJsonPath);

            return packageJsonPathCompare;
        });

    shownQuickPickItemList = quickPickItemList;

    return shownQuickPickItemList;
}

type SetQuickPickItemToFirstConfig = {
    /** description prefix of the item to set to first */
    descriptionPrefix: string;
};
/**
 * set one quick pick item to first
 * @param item the quick pick item to set to first
 * @param config the config to set
 */
export async function setQuickPickItemToFirst(
    item: NpmScriptQuickPickItem,
    config?: SetQuickPickItemToFirstConfig
) {
    if (!shownQuickPickItemList || !quickPickItemList) {
        throw new Error('quickPickItemList is not initialized');
    }

    const { descriptionPrefix }: SetQuickPickItemToFirstConfig = {
        descriptionPrefix: '(last used)',
        ...config,
    };

    // set the item to first and update the description
    shownQuickPickItemList = quickPickItemList
        .toSorted((a, _) => {
            const isMatch = a.packageJsonPath === item.packageJsonPath && a.name === item.name;

            return isMatch ? -1 : 0;
        })
        .map((quickPickItem, index) => {
            return {
                ...quickPickItem,
                description:
                    index === 0
                        ? `${descriptionPrefix} ${quickPickItem.description}`
                        : quickPickItem.description,
            };
        });
}

// TODO watch package.json file changes and update packageJsonScriptsList
