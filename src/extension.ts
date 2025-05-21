// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface EduPairConfig {
	studentPath?: string;
	solutionPath?: string;
}

const DEFAULT_CONFIG: Required<EduPairConfig> = {
	"studentPath": "./submissions/student.ipynb",
	"solutionPath": "./solutions/solution.ipynb",
  };

function loadEduPairConfig(configPath: string): Required<EduPairConfig> {
	try {
	  const raw = fs.readFileSync(configPath, 'utf-8');
	  const userConfig: EduPairConfig = JSON.parse(raw);
	  return {
		...DEFAULT_CONFIG,
		...userConfig
	  };
	} catch (err) {
	  vscode.window.showWarningMessage(`EduPair: No valid config found at ${configPath}, using defaults.`);
	  return DEFAULT_CONFIG;
	}
  }

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('notebook-generator.generate', async () => {
		const notebookEditor = vscode.window.activeNotebookEditor;

		if (!notebookEditor) {
			vscode.window.showErrorMessage('Please open a .ipynb file to generate notebooks.');
			return;
		}

		const notebookUri = notebookEditor.notebook.uri;
		const inputPath = notebookUri.fsPath;
		const folder = path.dirname(inputPath);
		const baseName = path.basename(inputPath, '.ipynb');

		// Load .edupair.json if it exists
		const configPath = path.join(folder, `${baseName}.edupair.json`);
		const config = loadEduPairConfig(configPath);

		const studentPath = path.resolve(folder, config.studentPath);
		const solutionPath = path.resolve(folder, config.solutionPath);

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
