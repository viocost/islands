import sys
from lka.domain_message import MessageVisitor


class MessageJSEmittingVisitor(MessageVisitor):
    def __init__(self, dest = sys.stdout):
        self.dest = dest
        self.prefix = "LKA_Message_"
        print("\n\n", file=self.dest)

    def enter_Message(self, msg):
        print("class %s%s {\n" % (self.prefix, msg.name))

    def exit_Message(self, msg):
        print ("\n}\n")

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
