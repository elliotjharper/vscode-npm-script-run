## Features

This extension lets you run NPM scripts from the command palette.

Run the extension from the command palette and it will list the scripts from package.json file at the root of the workspace.

Upon selecting an item, it will focus the last used terminal (or a new terminal) and send the text `npm run ${selected script name}` which will of course result in that script being run.

_Demo:_
<img src="https://raw.githubusercontent.com/elliotjharper/vscode-npm-script-run/main/images/demo.gif" alt="demo">

## Requirements

None

## Extension Settings

None

## Known Issues

None

## Release Notes

-   Feb 2024 - Version 2
    -   This extension now provides one more command for the command palette.
    -   The existing command works the same but is now named "Run NPM Script From /package.json (Last Used Terminal)"
    -   The new command works almost the same but as the name suggests "Run NPM Script From /package.json (New Terminal)". It will open your chosen npm script in a new terminal. This still has an advantage over the built-in runner as it will still be a terminal that you have control over and can terminate the command with Ctrl+C and then restart simply by using that shells' history with the up arrow.
