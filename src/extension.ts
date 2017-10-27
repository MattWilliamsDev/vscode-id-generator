'use strict';

import * as vscode from 'vscode';

import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
import InputBoxOptions = vscode.InputBoxOptions;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate ( context: vscode.ExtensionContext ) {
    console.log( 'Congratulations, your extension "id-generator" is now active!' );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand( 'extension.generateIDs', () => {
        let e = Window.activeTextEditor;
        let d = e.document;
        let { selections } = e;
        
        let options: InputBoxOptions = {
            prompt: 'Enter starting index'
            , value: '0'
        };

        // Display a message box to the user
        vscode.window.showInputBox( options )
            .then( num => {
                if ( selections.length > 0 ) {
                    processSelection( e, d, selections, +num, generateID );
                } else {
                    vscode.window.showInformationMessage( 'You must enter a starting index!' );
                }
            });
    });

    context.subscriptions.push( disposable );
}

function generateID ( start, index ) : string {
    console.log( 'generating id', start, index, start + index );
    return `${ start + index }`;
}

function processSelection ( e: TextEditor, d: TextDocument, sel: Selection[], start = 0, formatCb ) {
    var replaceRanges: Selection[] = [];

    console.log( 'start', start );
    
    if ( !Number.isNaN( start ) ) {
        e.edit( edit => {
            // itterate through the selections
            sel.forEach( ( item, i ) => {
                let txt: string = d.getText( new Range( item.start, item.end ) );
                
                console.log( 'start', start );
                txt = formatCb.apply( this, [ start, i ] );
                edit.replace( sel[ i ], txt );

                let startPos: Position = new Position( item.start.line, item.start.character );
                let endPos: Position = new Position( item.start.line + txt.split( /\r\n|\r|\n/ ).length - 1, item.start.character + ( txt.length || 1 ) );
                
                replaceRanges.push( new Selection( startPos, endPos ) );

                // console.log( 'startPos, endPos', startPos, endPos, txt );
                
            });
        });

        e.selections = replaceRanges;
    } else {
        console.error( 'Starting index is NaN!', start );
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}