# Generate tokens for a simple DSL given a set of *.def files.

# Def file format Notes:

# No tabs allowed (throw exception if tabs present)

# Lines are processed in LINE order

# !include <filename> recurses so the provenance is consistent
# !inculde MUST be only thing on the line (leading/trailing spaces/comments irrelevant)

# EOL and any sequence of one or more spaces are equivalent to a space

# Syntax is case-sensitive

# filenames are not read more than once (cached) so it's safe to include
# freely

# Comments are ;.*$ and are treated as a single white-space
# There are no block comments

comment_start_char = ';'
tab_char = '\t'
whitespace = ' '
include_command = '!include'

class Token:
    def __init__(self, filename, line_number, column_number, text):
        self.filename = filename
        self.line_number = line_number
        self.column_number = column_number
        self.text = text

    def is_freeform(self):
        return ' ' in self.text

    def __repr__(self):
        return ('Token(' + self.filename +
                ' ' +
                str(self.line_number) +
                ':' +
                str(self.column_number) +
                ' "' +
                self.text +
                '")')

    def __str__(self):
        return self.__repr__()

# This processes each file, ensuring it never reads the same file more than once.
def generate_tokens_for_file(files_encountered, tokens,filename, depth = "  "):

    # don't re-read a file
    if filename in files_encountered:
        return

    # ensure we don't re-read it later
    files_encountered.append(filename)

    if depth:
        print( depth + "Reading file " + filename)

    line_counter = 0
    with open(filename) as fin:
        for line in fin:
            line_counter += 1

            # reject any line that has a tab character
            if tab_char in line:
                raise ValueError("Tab encountered in file " + filename + " on line " + str(line_counter))

            # chop off any comment
            line = line.split(comment_start_char)[0]                   

            # process !include, if any
            if include_command in line:
                if not line.strip().startswith(include_command):
                    raise ValueError( include_command + " encountered in file " + filename +
                                      " on line " + str(line_counter) +
                                      " but not starting line")

                include_parts = line.strip().split(include_command)
                if len(include_parts) != 2:
                    raise ValueError( include_command + " encountered in file " + filename +
                                      " on line " + str(line_counter) +
                                      " is malformed")
                generate_tokens_for_file(files_encountered, tokens, include_parts[1].strip(), depth + "  " if depth else None)
                if depth:
                    print( depth + "Continuing with file " + filename)
            else:
                # This is not an include
                generate_tokens_for_line(tokens, filename, line_counter, line)

    if depth:
        print( depth + "Done with file " + filename + " processed " + str(line_counter) + " lines")

# tokens are the parts NOT whitespace
def generate_tokens_for_line(tokens, filename, line_counter, line):
    """
    This pushes space-delimited tokens to the tokens array.
    Should it encounter <<eol then what follows to end of line (trimmed on both sides of whitespace) is the token.
    """
    
    position = 0
    started_at = 0

    here_token = None

    # if there's a <<eol then we handle that FIRST and return it LAST
    here_marker = '<<eol'
    if here_marker in line:
        here_start = line.find(' '+here_marker) # the actual << with one-offset is +2 higher than this
        here_part = line[here_start+1 + len(here_marker):].strip() # the +1 skips the space, then skip the marker, then no spaces
        if not here_part:
            # it's possible to have a here_part that's empty...stupid but possible. Die
            raise ValueError(f"Here part started on line {line_counter} position {here_start+2} has nothing following it")
        
        line = line[:here_start+1] # to include the space at the end of line
        here_token = Token(filename, line_counter, here_start+2, here_part)
    

    # force a whitespace at the end to avoid special-case of word ending a line
    for c in line.rstrip()+" ":
        position += 1
        if c in whitespace:
            if started_at > 0:
                # To be here, we've hit a whitespace AFTER having hit a non-whitespace, so this
                # the words in the line are zero-based, and the started_at and position is 1 based.
                tokens.append(Token(filename, line_counter, started_at, line[started_at-1:position-1]))
                started_at = 0
        else:
            if started_at == 0:
                started_at = position

    # if we have a here token, push it too
    if here_token:
        tokens.append(here_token)
        
# This walks tokens, gathering them into their commands.
# When this is done, commands[] holds a list of lists, each starting with a command.
# It is an error if the first token is NOT a command ...
def gather_commands(tokens, command_starting_words, commands):

    # add a list of tokens to the list of token lists per command
    def add_command_list(tokens):
        command = tokens[0].text
        if not command in commands:
            commands[command] = []
        commands[command].append(tokens)
        
    so_far = []
    for token in tokens:
        if not token.text in command_starting_words:
            # This is NOT a command starting word
            if len(so_far) == 0:
                raise ValueError("Encountered non-command token when needing command on token " +
                                 str(token))
        else:
            # this IS a new command (or the first command)
            # Save the set of tokens from the last command if any
            if len(so_far) > 0:
                add_command_list(so_far)
                so_far = []
        # Save the token, regardless of it being a command or not, as it's "part" of what
        # we've now found so_far
        so_far.append(token)

    # It's VERY possible that we've got entries in so_far and ran out of tokens ... it's the normal
    # end case, in fact
    if len(so_far) > 0:
        add_command_list(so_far)
            
#
# Entry
#

def fetch_command_token_lists(command_starting_words, input_filename, indent = None):
    """
    This returns all the lists of tokens, indexed by their command_starting_word, where each command
    in each file is grouped into a list by command name.
    In effect: commands{ '!name1':[ [Token('!name1'),...], [ Token('!name1'), ...] ... ], ...}
    """
    
    tokens = []
    files_encountered = []
    generate_tokens_for_file(files_encountered, tokens, input_filename, indent)
    commands = dict()
    gather_commands(tokens, command_starting_words, commands)
    return commands
