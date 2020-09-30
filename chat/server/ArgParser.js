const { ArgumentParser } = require('argparse')


function parseArguments(args){

    const parser = new ArgumentParser({
        version: global.VERSION,
        addHelp: true,
        description: "Islands"
    })

    parser.addArgument(
        ["-p", "--port"],
        {
            help: "Admin's webservice port",
            type: 'int',
        }
    )


    parser.addArgument(
        ["-otp", "--one-time-password"],

        {
            help: "One-time password for admin vault registration. Required, if admin vault not registered",
            dest: 'otp'
        }
    )

    parser.addArgument(
        ["-d", "--debug"],
        {
            action: 'storeConst',
            dest: 'debug',
            help: "Enable debug mode",
            constant: true
        }
    )

    return parser.parseArgs(args)
}


module.exports = {
    parseArguments: parseArguments
}
