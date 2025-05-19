// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('notebook-generator.generate', async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor || !editor.document.fileName.endsWith('.ipynb')) {
			vscode.window.showErrorMessage(`Current file: ${editor?.document.fileName}`);
			// vscode.window.showErrorMessage('Please open a .ipynb file to generate notebooks.');
			return;
		}

		const inputPath = editor.document.uri.fsPath;
		const folder = path.dirname(inputPath);
		const solutionPath = path.join(folder, 'solution.ipynb');
		const studentPath = path.join(folder, 'student.ipynb');

		const pythonScript = path.join(context.extensionPath, 'scripts', 'generate_versions.py');

		const command = `python "${pythonScript}" "${inputPath}" --solution "${solutionPath}" --student "${studentPath}"`;

		cp.exec(command, (err, stdout, stderr) => {
			if (err) {
				vscode.window.showErrorMessage(`Error: ${stderr}`);
			} else {
				vscode.window.showInformationMessage('Student and Solution notebooks generated.');
			}
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
