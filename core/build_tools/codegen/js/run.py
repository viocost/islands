#!/bin/env python


import lka.tokenizer as tokenizer
import lka.domain_message as DM
import sys


def main():

    # list of commands that 'reset' the lexer/parser

    command_starting_words = [DM.Messages.marker_name(), DA.Agents.marker_name()]

    #
    # Entry
    #

    if len(sys.argv) > 3:
        print("Too many arguments. Should be", sys.argv[0], '<infile-name> <outfile-name>')
        exit(1)

    outfile_name = sys.argv[2] if len(sys.argv) > 2 else 'generated.js'
    infile_name  = sys.argv[1] if len(sys.argv) > 1 else 'source.def'

    print('Run starts, reading',infile_name,'generating',outfile_name)
    commands = tokenizer.fetch_command_token_lists(command_starting_words, infile_name, "  ")

    messages = dict() # no messages by default

    if DM.Messages.marker_name() in commands:

        # if not marker_type_names in commands then empty list

        messages = DM.Messages(commands[DM.Messages.marker_type_name()], commands[DM.Messages.marker_name()])
    if DA.Agents.marker_name() in commands:
        agents = DA.Agents(commands[DA.Agents.marker_name()], messages)





if __name__ == "__main__":
    main()
