#!/bin/env python
import argparse
import sys
from os import path, mkdir
import lka.tokenizer as tokenizer
import lka.domain_package as DP
import lka.domain_message as DM
import lka.domain_state as DA
from js.message_assembler import MessageInstanceVisitor
from js.message_factory_assembler import MessageFactoryVisitor
from js.require_assembler import RequireAssemblyVisitor
from js.codegen_warning_comment import comment

PROJECT_ROOT_DEFAULT = path.abspath("../../../")
OUTPUT_DEFAULT = "./GENERATED"

def emit_class(message, dest=sys.stdout):
    visitor = MessageInstanceVisitor(dest)
    message.accept(visitor)


MESSAGE_BASE = """%s
class MessageBase{
    constructor(name){
        //name maybe used later
    }

    serialize(){
        return JSON.stringify(this)
    }

    enclose(){
        return {
            messageName: this.getName(),
            body: this.serialize()
        }
    }

    getName(){
        return this.constructor.name;
    }
}

""" % comment

def emit_factory_method(message):
    print("module.exports")

def main():
    args = parse_args()
    
    infile = args.origin[0]
    out_dir = args.dest[0] if args.dest else OUTPUT_DEFAULT
    outfile = path.join(out_dir, "Messages.js")
    project_root = args.root[0] if args.root  else PROJECT_ROOT_DEFAULT

    if not path.exists(out_dir):
        mkdir(out_dir)


    #out_file = "./test_data/sample.def"
    command_starting_words = [ DM.Messages.marker_name(), DP.Packages.marker_name(), DA.Agents.marker_name() ]
    commands = tokenizer.fetch_command_token_lists(command_starting_words, infile, "  ")

    # it's possible that we don't have some of the candidates, so we need to avoid blowing up
    # when we pass them through.
    for word in command_starting_words:
        if word not in commands:
            commands[word] = None

    # process our tokens into their respective composites
    packages = DP.Packages(commands[DP.Packages.marker_name()])
    messages = DM.Messages(commands[DM.Messages.marker_name()], packages)
    agents   = DA.Agents(commands[DA.Agents.marker_name()], messages)

    # Generating message classes


    with open(outfile, "w") as fp:

        # Generating support functions
        require_visitor = RequireAssemblyVisitor(fp, packages.packages, project_root)
        for m in messages.messages:
            message = messages.messages[m]
            message.accept(require_visitor)

        message_instance_visitor = MessageInstanceVisitor(fp)
        message_instance_visitor.emit_header(messages.messages)
        factory_visitor = MessageFactoryVisitor(fp)
        factory_visitor.emit_header(messages.messages)
        fp.write(MESSAGE_BASE)

        for m in messages.messages:
            message = messages.messages[m]
            message.accept(message_instance_visitor)
            message.accept(factory_visitor)





def parse_args():
    parser = argparse.ArgumentParser(description="Generating javascript from def files")
    parser.add_argument('origin', type=str, nargs=1, metavar='origin', help="Origin def file to use for code generation")
    parser.add_argument('--destination-dir', '-d', nargs=1, help="Destination directory to spit out files", dest='dest')
    parser.add_argument('--project-root', '-r',  nargs=1, help="Path to project root. This argument is needed to build packages correctly", dest='root')
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    main()
