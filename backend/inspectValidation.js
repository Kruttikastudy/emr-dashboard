import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const inspectValidation = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'emrdb'
        });
        console.log('Connected!');

        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'patients' }).toArray();

        if (collections.length > 0 && collections[0].options && collections[0].options.validator) {
            const validator = collections[0].options.validator;
            fs.writeFileSync('validation_rules.json', JSON.stringify(validator, null, 2));
            console.log('Validation rules saved to validation_rules.json');
        } else {
            console.log('No MongoDB-side validation rules found for "patients" collection.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error inspecting validation:', error);
        process.exit(1);
    }
};

inspectValidation();
