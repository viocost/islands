/**
 * Checks if all arguments are defined, otherwise throws error
 */
export  function(args){
    if (args === undefined){
        throw "Missing required arguments";
    }else if(args instanceof Array){
        args.forEach((arg)=>{
            if (arg === undefined){
                throw "Missing required arguments";
            }
        })
    }
}
