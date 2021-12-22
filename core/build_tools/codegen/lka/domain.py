"""
Domain models for messages, machines, and any later domain entities.
"""

import re

# Support the composite/visitor facilities

def find_visitor_method_for_foundation(foundation, visitor):

    if not isinstance(foundation, DomainFoundation):
        raise ValueError("Passed foundation object that wasn't derived from DomainFoundation class",foundation)
    
    candidate = type(foundation)
    while True:
        derived_class_name = candidate.__name__
        if hasattr(visitor, derived_class_name):
            return getattr(visitor,derived_class_name)
        candidate = candidate.__bases__[0]

class DomainValidationException(Exception):
    """Raised when a validation attempt fails"""
    def __init__(self, failure, details):
        self.failure = failure
        self.details = details
        
class DomainFoundation:
    """Derive domain composites from this (directly or indirectly). The purpose of extra is to
    allow data added after creation (such as by visitors) to be accumulated.
    """
    
    def __init__(self, tokens):
        self.provenance = tokens if isinstance(tokens, list) else [tokens]
        self.extra = {}

    def accept(self, visitor):
        visitor_method = find_visitor_method_for_foundation(self, visitor)
        if visitor_method:
            visitor_method(self)
        else:
            print("WARNING: NO METHOD",type(self).__name__,"on visitor",visitor)

    def __repr__(self):
        return "(DomainFoundation, real_type=" + type(self).__name__ + ",provenance="+str(self.provenance) +")"
    def __str__(self):
        return self.__repr__()

class VisitorBase:
    def DomainFoundation(self, df):
        print("WARNING: VisitorBase visit_DomainFoundation called with object of type",
              type(df).__name__, "holding",str(df))

#### REGEX PATTERNS
re_valid_identity_message_name = re.compile('^[_a-zA-Z][_0-9a-zA-Z]*$')
re_valid_package_qualified_name = re.compile('^[_a-zA-Z][_0-9a-zA-Z]*/[_a-zA-Z][_0-9a-zA-Z]*/[_a-zA-Z][_0-9a-zA-Z]*$')

def _is_re_matched(rex, text):
    matched = rex.match(text)
    if matched:
        return True
    return False

def is_valid_identity_name(token):
    return _is_re_matched(re_valid_identity_message_name, token.text)

def is_package_qualified_name(token):
    return _is_re_matched(re_valid_package_qualified_name , token.text)

def as_valid_identity_name(token):
    if not is_valid_identity_name(token):
        raise ValueError("Invalid IDENTITY name in token", token)
    return token
