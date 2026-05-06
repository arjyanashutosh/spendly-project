const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Hash password before saving 
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", UserSchema);

async function run() {
    try {
        await mongoose.connect("mongodb+srv://adityakumarb946_db_user:c8XFJDmMmcFK1jgV@expensetracker.4ylnm22.mongodb.net/?appName=expenseTracker");
        console.log("connected");
        const user = new User({ fullName: "Test", email: "test" + Date.now() + "@test.com", password: "password" });
        await user.save();
        console.log("saved");
    } catch (e) {
        console.error("ERROR", e);
    } finally {
        mongoose.disconnect();
    }
}
run();
