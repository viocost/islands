from lka.domain_message import MessageVisitor
from js.code_emitting_mixin import CodeEmittingMixin
from js.codegen_warning_comment import comment
from lka.code_emitter_stream import CodeStream

MSG_INDEX = "msg_index"


class MessageInstanceVisitor(CodeEmittingMixin, MessageVisitor):

    def __init__(self, dest):
        super().__init__(dest)
        self.cs = CodeStream(dest, "    ")
        self.msg_index = 0


    def emit_header(self, messages):
        pass

    def enter_Message(self, msg):
        self.cs.line()
        self.cs.line("class %s extends MessageBase {" % msg.name)
        self.cs.indent()

        fields = ""
        for field in msg.fields:
            if fields:
                fields += ", "
            fields += field.name
        self.cs.line("constructor(%s){" % fields)
        self.cs.indent()
        self.cs.line('super("%s")' % msg.name)


    def exit_Message(self, msg):

        self.cs.outdent()
        self.cs.line("}")
        self.cs.line("""
        get %s(){
            return %s.%s
        }
        """ % (MSG_INDEX, msg.name, MSG_INDEX))
        self.cs.outdent()
        self.cs.line("}")


        print("Index before increment: %d" % self.msg_index)
        self.cs.line("""
        Object.defineProperty(%s, "%s", {
            value: %d,
            writable: false,
            configurable: false
        })
        """ % (msg.name, MSG_INDEX, self.msg_index ))

        self.msg_index = self.msg_index + 1
        print("Index after increment: %d" % self.msg_index)


    def enter_Field(self, field):
        self.cs.line("this.%s = %s" % (field.name, field.name))


class ConstructorFieldVisitor(MessageVisitor):
    def __init__(self):
        pass
