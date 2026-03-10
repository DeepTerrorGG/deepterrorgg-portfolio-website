/**
 * Strongly typed Firebase Rules Builder.
 * This ensures that rules are syntactically correct and type-safe.
 */

export type RuleCondition = string;

export interface RuleMethods {
    read?: RuleCondition;
    write?: RuleCondition;
    get?: RuleCondition;
    list?: RuleCondition;
    create?: RuleCondition;
    update?: RuleCondition;
    delete?: RuleCondition;
}

export interface FirestoreMatch {
    path: string;
    rules?: RuleMethods;
    functions?: string[];
    matches?: FirestoreMatch[];
}

export interface FirestoreRulesConfig {
    version?: '1' | '2';
    service?: 'cloud.firestore';
    databases?: {
        [databaseName: string]: FirestoreMatch[];
    };
}

function compileMethods(rules: RuleMethods, indent: string): string {
    const parts: string[] = [];
    for (const [method, condition] of Object.entries(rules)) {
        if (condition) {
            parts.push(`${indent}  allow ${method}: if ${condition};`);
        }
    }
    return parts.join('\n');
}

function compileFunctions(functions: string[], indent: string): string {
    return functions.map(fn => `${indent}  ${fn.replace(/\n/g, `\n${indent}  `)}`).join('\n\n');
}

function compileMatch(match: FirestoreMatch, indent: string): string {
    let output = `${indent}match ${match.path} {\n`;

    if (match.functions && match.functions.length > 0) {
        output += `${compileFunctions(match.functions, indent)}\n`;
    }

    if (match.rules) {
        output += `${compileMethods(match.rules, indent)}\n`;
    }

    if (match.matches && match.matches.length > 0) {
        for (const nestedMatch of match.matches) {
            output += `\n${compileMatch(nestedMatch, indent + '  ')}`;
        }
    }

    output += `${indent}}\n`;
    return output;
}

export function buildFirestoreRules(config: FirestoreRulesConfig): string {
    const version = config.version || '2';
    const service = config.service || 'cloud.firestore';

    let output = `rules_version = '${version}';\n`;
    output += `service ${service} {\n`;

    if (config.databases) {
        for (const [dbName, matches] of Object.entries(config.databases)) {
            output += `  match /databases/{${dbName}}/documents {\n`;
            for (const match of matches) {
                output += `\n${compileMatch(match, '    ')}`;
            }
            output += `  }\n`;
        }
    }

    output += `}\n`;
    return output;
}
