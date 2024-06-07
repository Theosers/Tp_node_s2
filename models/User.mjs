import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.methods.generateHash = function(password) {
    return crypto.createHmac('sha256', process.env.SECRET_KEY)
                 .update(password)
                 .digest('hex');
};

userSchema.methods.validPassword = function(password) {
    const hash = crypto.createHmac('sha256', process.env.SECRET_KEY)
                       .update(password)
                       .digest('hex');
    return this.password === hash;
};

const User = mongoose.model('User', userSchema);
export default User;