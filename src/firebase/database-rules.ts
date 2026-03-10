import * as fs from 'fs';
import * as path from 'path';

/**
 * Strongly typed Firebase Realtime Database Rules Builder.
 * Ensures the rules object is correctly formed before outputting to JSON.
 */
export interface DatabaseRuleNode {
    ".read"?: string | boolean;
    ".write"?: string | boolean;
    ".validate"?: string;
    ".indexOn"?: string | string[];
    [key: string]: DatabaseRuleNode | string | boolean | string[] | undefined;
}

export interface DatabaseRulesConfig {
    rules: DatabaseRuleNode;
}

const config: DatabaseRulesConfig = {
    rules: {
        // Allow public read/write to leaderboards for all games
        "leaderboards": {
            ".read": true,
            ".write": true
        },
        // Deny all other access by default
        ".read": false,
        ".write": false
    }
};

export const generatedDatabaseRules = JSON.stringify(config, null, 2);

// Only write to file if run directly
if (require.main === module) {
    const outputPath = path.resolve(process.cwd(), 'database.rules.json');
    fs.writeFileSync(outputPath, generatedDatabaseRules);
    console.log(`Successfully generated database.rules.json at ${outputPath}`);
}

export default generatedDatabaseRules;
