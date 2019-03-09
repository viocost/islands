export function verifyPassword(password, confirm){
    if (!password || !password.trim() || password.length < 8){
        return "Password is not long enough."
    }
    if(password !== confirm){
        return "Password and confirmation do not match."
    }

    if(!/^(?=.+[a-z])(?=.+[A-Z])(?=.+[0-9]).{8,}$/.test(password)){
        return "Password must be at least 8 characters long and " +
            "contain at least one lower case letter, " +
            "one upper case letter and one number digit"
    }
}
