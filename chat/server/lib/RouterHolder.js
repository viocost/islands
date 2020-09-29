class RouterHolder{
    constructor(base, router){
        this._router = router;
        this._base = base;
    }

    getRouter(){
        return this._router;
    }

    getBase(){
        return this._base
    }
}

module.exports = {
    RouterHolder: RouterHolder
}
