import { buildFirestoreRules, FirestoreRulesConfig } from './rules-builder';
import * as fs from 'fs';
import * as path from 'path';

const config: FirestoreRulesConfig = {
    version: '2',
    service: 'cloud.firestore',
    databases: {
        'database': [
            {
                path: '/{document=**}',
                rules: {
                    read: 'false',
                    write: 'false',
                },
            },
            {
                path: '/whiteboard-objects/{objectId}',
                rules: {
                    read: 'request.auth != null',
                    write: 'request.auth != null',
                }
            },
            {
                path: '/system_logs/{logId}',
                rules: {
                    read: 'true',
                    write: 'true',
                }
            },
            {
                path: '/timeCapsules/{capsuleId}',
                rules: {
                    read: 'true',
                    write: 'true',
                }
            }
        ],
    },
};

const generatedRules = buildFirestoreRules(config);

// Only write to file if run directly
if (require.main === module) {
    const outputPath = path.resolve(process.cwd(), 'firestore.rules');
    fs.writeFileSync(outputPath, generatedRules);
    console.log(`Successfully generated firestore.rules at ${outputPath}`);
}

export default generatedRules;
