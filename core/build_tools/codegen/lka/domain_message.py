import sys
import lka.domain as Domain
import lka.parser as Parser
import lka.code_emitter_stream as CS

class FailedMessage:
    def __init__(self, message, reason):
        self.failed = message
        self.reason = reason
        
    def __repr__(self):
        return "FailedMessage(" + self.reason + " on message " + str(self.failed)

    def __str__(self):
        return self.__repr__()

class Messages:
    """All known messages"""
    def __init__(self, tokens_for_messages, packages):
        # TODO add custom defined type validaters

        self.messages = dict()        # name -> msg
        self.failed_messages = dict() # name -> [FailedMessage,...]
        self.raw_messages = dict()    # name -> [msg,...]

        if tokens_for_messages:
            # load in the message instances from the tokens
            for message_tokens in tokens_for_messages:
                message = Message.build(message_tokens, packages)
                print("Processing message...")
                message.accept(MessagePrettyPrintingVisitor())#CS.CodeStream(sys.stdout)))
                self._add(message)

            # now validate everything
            self._validate()



    @staticmethod
    def marker_name():
        return "!message"

    def _add(self, message):
        if self.messages or self.failed_messages:
            raise ValueError("Attempted to add message after calling validate")
        
        if message.name in self.raw_messages:
            self.raw_messages[message.name].append(message)
        else:
            self.raw_messages[message.name] = [message]

    def _validate(self):
        """This populates failed_messages and messages, emptying/consuming raw_messages"""

        # remove any duplicates to failed_messages and non-duplicats to messages
        for name in self.raw_messages.keys():
            messages = self.raw_messages[name]
            if len(messages) > 1:
                # duplicates
                self.failed_messages[name] = []
                
                for message in self.raw_messages[name]:
                    self.failed_messages[name].append(FailedMessage(message, "Duplicate"))

            else:
                # non-duplicate, so it's a potential valid message
                self.messages[name] = messages[0]

        # iterate this until there are no failures
        valid_pass = False
        while not valid_pass:
            valid_pass = True # assume this works
            # check that any refrence to NestedMessage refers to a valid message
            for name in list(self.messages.keys()):
                message = self.messages[name]
                failures = message.validate_against_all_messages(self)
                if failures:
                    self.failed_messages[name] = failures
                    del(self.messages[name])
                    valid_pass = False

        # if there are failed_messages then we couldn't validate and this run is blown
        if self.failed_messages:
            raise Domain.DomainValidationException("Messages failed to validate", self)

    def __repr__(self):
        if self.failed_messages:
            issues = []
            for name in self.failed_messages.keys():
                for entry in self.failed_messages[name]:
                    issues.append(str(entry))
            return "Messages(failed_because=" + " ".join(issues) + ")"
        else:
            return "Messages(" + " ".join(self.messages.keys()) + ")"

    def __str__(self):
        return self.__repr__()



class DefaultTo(Domain.DomainFoundation):
    def __init__(self, tokens, package, package_file, generator_function_name):
        super().__init__(tokens)
        self.package = package
        self.package_file = package_file
        self.generator_function_name = generator_function_name

class TypeValidation(Domain.DomainFoundation):
    def __init__(self, token):
        super().__init__(token)

    def validate_against_all_messages(self, messages):
        # by default, it's valid
        return None

class KnownMessage(TypeValidation):
    def __init__(self, token):
        super().__init__(token)

class UncheckedValue(TypeValidation):
    def __init__(self, token):
        super().__init__(token)
        
class TypeValidationWithArg(TypeValidation):
    def __init__(self, token):
        super().__init__(token)

class BuiltinType(TypeValidationWithArg):
    def __init__(self, token):
        super().__init__(token)
        self.type_name = token.text



class ValidatedBy(TypeValidationWithArg):
    def __init__(self, tokens, package, package_file, function_name):
        super().__init__(tokens)
        self.package = package
        self.package_file = package_file
        self.validation_function_name = function_name

class InstanceOf(TypeValidationWithArg):
    def __init__(self, tokens, package, package_file, class_name):
        super().__init__(tokens)
        self.package = package
        self.class_name = class_name
        self.package_file = package_file

class NestedMessage(TypeValidationWithArg):
    def __init__(self, tokens):
        super().__init__(tokens)
        self.nested_message_name = tokens[1].text

    def validate_against_all_messages(self, messages):
        # Only true if the nested message this refers to is defined in the messages collection
        if not self.nested_message_name in messages.messages:
            return "Dependent message " + self.nested_message_name + " not defined"
        else:
            return None
        
class Field(Domain.DomainFoundation):
    def __init__(self, name, null_ok,
                 optional_flag, default_to, type_validation):
        super().__init__([name, null_ok ])
        self.name = name.text
        self.null_ok = True if null_ok else False
        self.optional_flag = optional_flag
        self.default_to = default_to

        # type_validation is actually a ValidatedBy token
        # It can be not just type validation
        self.type_validation = type_validation

    def accept(self, visitor):
        visitor.enter_Field(self)
        self.type_validation.accept(visitor)
        if self.default_to: self.default_to.accept(visitor)
        visitor.exit_Field(self)
        

# Use Message.build(tokens) to create and return an instance of this class.
# The first token must be !message as a sanity check at this time.
class Message(Domain.DomainFoundation):

    @staticmethod
    def build(tokens, packages):

        def add_package_triple(tc, error_desc):

            arg_token = Parser.extract_passes_guard(tc,
                                                    Domain.is_package_qualified_name,
                                                    error_desc)
            if arg_token:
                package_name, package_file, package_id = arg_token.text.split("/")
                if package_name not in packages.packages:
                    raise ValueError("Package required not found", arg_token)
                package = packages.packages[package_name]
                return arg_token, package, package_file, package_id



        tc = Parser.TokenCursor(tokens)

        # Get the message and its name
        message_start = Parser.extract_constant(tc, Messages.marker_name(),  Messages.marker_name() + " expected and not given")
        message_name = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Valid identifier for message name not provided")

        # Now visiting fields or optional
        reached_optional = False
        fields = []

        while not tc.is_empty():
            
            # process optional marker
            optional_marker = Parser.extract_constant(tc, "start-optional")
            if optional_marker:
                if not reached_optional:
                    reached_optional = optional_marker
                continue

            # process a field
            field_name = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Valid identifier for field name not provided")

            # it may be null-ok
            allow_null = Parser.extract_constant(tc, "null-ok")

            # Get the precisely one mandatory type validator
            validator = None
            
            if not validator:
                token = Parser.extract_one_of_set(tc,[
                    'string', 'integer', 'boolean', 'number'])
                if token:
                    validator = BuiltinType(token)
            if not validator:
                token = Parser.extract_constant(tc, "unchecked-value")
                if token:
                    validator = UncheckedValue(token)
            if not validator:
                token = Parser.extract_constant(tc, "known-message")
                if token:
                    validator = KnownMessage(token)
            if not validator:
                validator_token = Parser.extract_constant(tc, "instance-of")
                if validator_token:
                    arg_token,  package, package_file, package_id = add_package_triple(tc, "Must be the name of a package qualified class identifier")
                    validator = InstanceOf([validator_token, arg_token], package, package_file, package_id)

            if not validator:
                validator_token = Parser.extract_constant(tc, "nested-message")
                if validator_token:
                    arg_token = Parser.extract_passes_guard(tc,
                                                            Domain.is_valid_identity_name,
                                                            "Must be the name of a defined message identifier")
                    if arg_token:
                        validator = NestedMessage([validator_token, arg_token])
            if not validator:
                validator_token = Parser.extract_constant(tc, "validated-by")
                if validator_token:
                    arg_token,  package, package_file, package_id = add_package_triple(tc, "Must be the name of a validation function identifier")
                    validator = ValidatedBy([validator_token, arg_token], package, package_file, package_id)

            if not validator:
                raise Parser.ParserException(tc.next(), "Expected type definition/validation clause and got this")

            # now, optional default, only allowed when in an optional field
            default_to = None
            if not tc.is_empty():
                default_to_token = Parser.extract_constant(tc, "default-to")
                if default_to_token:
                    if not reached_optional:
                        raise Parser.ParserException(default_to_token, "Not allowed to have default_to when not in optoinal field")

                    arg_token,  package, package_file, package_id = add_package_triple(tc, "Must be default value generation function identifier")
                    default_to = DefaultTo([default_to_token, arg_token], package, package_file, arg_token.text)
                                                 
            # and now everything needed for a field is here
            fields.append(Field(field_name, allow_null, reached_optional, default_to, validator))
                
        # all fields processed
        return Message([message_start, message_name], fields)

        

    @staticmethod
    def filter_invalid_references(messages):
        return messages
    
    def __init__(self, provenance, fields):
        super().__init__(provenance)
        self.name = provenance[1].text
        self.fields = fields

    def accept(self, visitor):
        visitor.enter_Message(self)
        for field in self.fields:
            field.accept(visitor)
        visitor.exit_Message(self)

    def validate_against_all_messages(self, messages):
        # Only true if any nested messages this refers to is defined in the messages collection
        failed = []
        for field in self.fields:
            error_from = field.type_validation.validate_against_all_messages(messages)
            if error_from:
                failed.append(FailedMessage(self, error_from))
        return failed

class MessageVisitor(Domain.VisitorBase):


    def enter_Message(self, msg):
        pass

    def exit_Message(self, msg):
        pass

    def enter_Field(self, msg):
        pass

    def exit_Field(self, msg):
        pass

    def DefaultTo(self, msg):
        pass

    def KnownMessage(self, msg):
        pass

    def UncheckedValue(self, msg):
        pass

    def TypeValidationWithArg(self, arg):
        pass

    def BuiltinType(self, arg):
        pass

    def ValidatedBy(self, arg):
        pass

    def InstanceOf(self, arg):
        pass

    def NestedMessage(self, arg):
        pass
        

class MessagePrettyPrintingVisitor(MessageVisitor):
    def __init__(self, dest = sys.stdout):
        self.in_optional = False
        self.dest = dest
        
    def enter_Message(self, arg):
        print(arg.provenance[0].text, arg.name, file=self.dest)

    def DefaultTo(self, arg):
        print("default-to ", arg.package.name, "/",
              arg.package_file, "/", arg.generator_function_name, " ", end='', file=self.dest, sep='')

    def KnownMessage(self, arg):
        print("known-message", end='', file=self.dest)

    def UncheckedValue(self, arg):
        print("unchecked-value", end='', file=self.dest)

    def BuiltinType(self, arg):
        print(arg.type_name, end='', file=self.dest)

    def ValidatedBy(self, arg):

        print("validated-by ", arg.package.name, "/",
              arg.package_file, "/", arg.validation_function_name, " ", end='', file=self.dest, sep='')

    def InstanceOf(self, arg):
        print("instance-of ", arg.package.name, "/",
              arg.package_file, "/", arg.class_name, " ", end='', file=self.dest, sep='')

    def NestedMessage(self, arg):
        print("nested-message", arg.nested_message_name, end='', file=self.dest)

    def enter_Field(self, arg):
        if not self.in_optional and arg.optional_flag:
            self.in_optional = True
            print("  start-optional", file=self.dest)

        null_display = "null-ok " if arg.null_ok else ""
        print("   ", arg.name, null_display, end='', file=self.dest)

    def exit_Field(self, arg):
        print(file=self.dest) # to get the new line
