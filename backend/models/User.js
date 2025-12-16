import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'please provide a username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },

    email: {
        type: String,
        required: [true, 'please provide a email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },

    password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },

    profileImage: {
        type: String,
        default: null
    }
}, {
    timestamps:true
});

// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')){
//         next();
//     }
//     //await removed at salt and this.password
//     const salt = await bcrypt.getSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (typeof this.password !== "string") {
    this.password = this.password.toString();
  }

  this.password = await bcrypt.hash(this.password, 10);
//   next();
});


//Compare password methods

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;