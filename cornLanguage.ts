const grammarLink = 'https://raw.githubusercontent.com/JakeStanger/corn-vscode/master/syntaxes/corn.tmLanguage.json';
const grammar = await fetch(grammarLink).then(r => r.json());

export default {
    id: 'corn',
    scopeName: 'source.corn',
    grammar,
    displayName: 'Corn',
    path: ''
};