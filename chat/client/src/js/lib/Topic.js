export class Topic{
    constructor(pkfp, name, key, comment){
        this.pkfp = pkfp;
        this.name = name;
        this.key = key;
        this.comment = comment;
    }

    setName(name){
        this.name = name;
    }
}