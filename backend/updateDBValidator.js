import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected!');

        const db = client.db('emrdb');

        // 1. Fetch current validator
        const collections = await db.listCollections({ name: 'patients' }).toArray();
        if (!collections[0] || !collections[0].options || !collections[0].options.validator) {
            console.log('No native validator found to update.');
            return;
        }

        let validator = collections[0].options.validator;

        // 2. Add empty string "" to the problematic enums
        try {
            const alcoholProps = validator.$jsonSchema.properties.social_history.properties.alcohol_use.properties;

            // Update Status
            if (alcoholProps.current_status.enum && !alcoholProps.current_status.enum.includes("")) {
                alcoholProps.current_status.enum.push("");
            }

            // Update Type of Alcohol
            if (alcoholProps.type_of_alcohol.enum && !alcoholProps.type_of_alcohol.enum.includes("")) {
                alcoholProps.type_of_alcohol.enum.push("");
            }

            console.log('Local validator updated for Alcohol Use.');
        } catch (e) {
            console.warn('Could not find alcohol_use paths in validator. Skipping.');
        }

        try {
            const violenceProps = validator.$jsonSchema.properties.social_history.properties.exposure_to_violence.properties;

            // Update Type of Violence (None and "")
            if (violenceProps.type_of_violence.enum) {
                if (!violenceProps.type_of_violence.enum.includes("")) violenceProps.type_of_violence.enum.push("");
                if (!violenceProps.type_of_violence.enum.includes("None")) violenceProps.type_of_violence.enum.push("None");
            }
            console.log('Local validator updated for Violence Exposure.');
        } catch (e) {
            console.warn('Could not find exposure_to_violence paths in validator. Skipping.');
        }

        // 3. Push update to MongoDB
        console.log('Pushing updated rules to MongoDB server...');
        await db.command({
            collMod: 'patients',
            validator: validator
        });

        console.log('✅ SUCCESS: Database internally updated to allow empty/none values.');

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.close();
        process.exit(0);
    }
};

run();
