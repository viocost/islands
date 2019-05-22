export function verifyPassword(password, confirm){
    if (!password || !password.trim() || password.length < 9){
        return "Password or passphrase must be at least 9 characters long"
    }

    if(password !== confirm){
        return "Password and confirmation do not match."
    }

}
