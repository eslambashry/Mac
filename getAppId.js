
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_ONLINE);
        console.log("DB connected");
    } catch (err) {
        console.error("DB Connection Failed", err);
        process.exit(1);
    }
}

const getApp = async () => {
    await connectDB();
    try {
        const collection = mongoose.connection.collection('applications');
        const app = await collection.findOne({});
        if (app) {
            console.log("APP_ID:" + app._id);
        } else {
            console.log("NO_APPS");
        }
    } catch (err) {
        console.error("Query Failed", err);
    } finally {
        await mongoose.disconnect();
    }
}
getApp();
