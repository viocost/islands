# A simplistic parser for an array of tokens.

class TokenCursor:
    def __init__(self, tokens, init=None):

        if not tokens:
            raise ValueError("Empty Tokens Provided -- Internal Error")
        
        self.last_token_seen = None
        self.tokens = tokens;
        if init:
            self.current = init
        else:
            self.current = 0 if len(tokens) > 0 else None

    def _check_underflow(self):
        if self.is_empty():
            if self.last_token_seen:
                raise ValueError("Underflow after token:", self.last_token_seen)
            raise ValueError("Underflow with no tokens seen")

    def peek(self):
        self._check_underflow()

        self.last_token_seen = self.tokens[self.current]
        return self.last_token_seen

    def advance(self):
        self._check_underflow()
            
        self.current += 1
        if not self.current < len(self.tokens):
            self.current = None
        
    def next(self):
        result = self.peek()
        if result:
            self.advance()
        return result

    def is_empty(self):
        return self.current is None

    def copy(self):
        return TokenCursor(self.tokens, self.current)

class ParserException(Exception):
    def __init__(self, token, message):
        self.token = token
        self.message = message

# Returns and consumes the token ONLY if it matches the const_string given
def extract_constant(tc, const_string, throw_if_not = None):
    token = tc.peek()
    if token.text == const_string:
        tc.advance()
        return token
    if throw_if_not:
        raise ParserException(token, throw_if_not)
    return None

def extract_passes_guard(tc, guard_function, throw_if_not = None):
    token = tc.peek()
    if guard_function(token):
        tc.advance()
        return token
    if throw_if_not:
        raise ParserException(token, throw_if_not)
    return None

def extract_one_of_set(tc, choices, throw_if_not = None):
    token = tc.peek()
    if token.text in choices:
        tc.advance()
        return token
    if throw_if_not:
        raise ParserException(token, throw_if_not)
    return None

def as_valid_number(x):
    """returns an int, a float, or None"""
    if x.isnumeric():
        return int(x)
    try:
        return float(x)
    except ValueError as ignored:
        return None

def extract_valid_number(tc, throw_if_not = None):
    token = tc.peek()
    result = as_valid_number(token.text)
    if result:
        tc.advance()
        return token
    if throw_if_not:
        raise ParserException(token, throw_if_not)
    return None
    
