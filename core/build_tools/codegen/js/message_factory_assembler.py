from lka.domain_message import MessageVisitor
from js.code_emitting_mixin import CodeEmittingMixin
from js.codegen_warning_comment import comment
from lka.code_emitter_stream import CodeStream

# Manually written support.js must export all classes that are validated by instanceof as well
# as all validator functions.

JS_TYPES = {
    "number": "number",
    "string": "string",
    "boolean": "boolean",
    "integer": "number",
}

MESSAGES_IDX = "MESSAGES"

class MessageFactoryVisitor(CodeEmittingMixin, MessageVisitor):
    def __init__(self, dest):
        self.current_field = None
        super().__init__(dest)
        self.cs = CodeStream(dest, "    ")

    def emit_header(self, messages):
        self.cs.line(comment)

        self.cs.line("const MessagesBlobDecoder = {}")
        self.cs.line("module.exports.%s = [];" % MESSAGES_IDX)
        self.cs.line("""class DomainMessageError extends Error{ constructor(data){ super(data); this.name = "DomainMessageError" } }""")
        self.cs.line("""class FieldTypeError extends DomainMessageError{ constructor(data){ super(data); this.name = "FieldTypeError" } }""")
        self.cs.line("""class NullFieldError extends DomainMessageError{ constructor(data){ super(data); this.name = "NullFieldError" } }""")
        self.cs.line("""class FieldValidationError extends DomainMessageError{ constructor(data){ super(data); this.name = "FieldValidationError" } }""")
        self.cs.line("""class BlobDecodeError extends DomainMessageError{ constructor(data){ super(data); this.name = "BlobDecodeError" } }""")

        self.cs.line()
        self.cs.line()
        self.cs.layer() \
            .line("function decodeFromJSON(blob){") \
            .indent() \
            .line("""
            if(blob == null) throw new DomainMessageError("Blob is undefined")

            let name = blob.name

            let f = MessagesBlobDecoder[name]
            if(f == null) throw new Error(`Blob is unknown message: ${name}`)
            return f(blob)
            """) \
            .outdent() \
            .line("}") \
            .line()




        self.cs.line()
        self.cs.line("""module.exports.decodeFromJSON = decodeFromJSON""")


    def enter_Message(self, msg):
        self.emit_factory_function(msg)

    def exit_Message(self, msg):
        self.cs.line()
        self.cs.line("""return new %s(%s)""" % (msg.name, ", ".join([field.name for field in msg.fields])))
        self.cs.outdent()
        self.cs.line("}")
        self.cs.line()
        self.emit_blob_factory_function(msg)
        self.cs.line()
        self.cs.line("module.exports.%s.push(%s)" % (MESSAGES_IDX, msg.name))


    def emit_factory_function(self, msg):
        fields = ", ".join([ field.name if not field.default_to else "%s = %s()" % (field.name, field.default_to.generator_function_name) for field in msg.fields ])
        self.cs.line()
        # Emitting factory function
        self.cs.line("module.exports.%s = function(%s){" % (msg.name, fields))
        self.cs.indent()

    def emit_blob_factory_function(self, msg):
        fields = ", ".join(["blob.body.%s" % field.name for field in msg.fields])
        self.cs.layer().line('MessagesBlobDecoder["%s"] = function(blob){' % (msg.name)) \
            .indent().line("""
            if (blob == undefined) throw new BlobDecodeError("Blob is null")
            if (blob.name == undefined) throw new BlobDecodeError("Blob name is undefined")
            if (!(blob.name in MessagesBlobDecoder)) throw new BlobDecodeError("Message name is not recognized")
            """).line("return %s(%s)" % (msg.name, fields))
        self.cs.line("}")
        self.cs.line()

    def enter_Field(self, field):
        self.current_field = field.name
        if not field.null_ok:
            self.cs.line("""if (%s == undefined) throw new NullFieldError("%s")""" % (field.name, field.name))

    def exit_Field(self, field):
        pass

    def InstanceOf(self, arg):
        self.cs.line("""if (!(%s instanceof %s.%s)) throw new FieldTypeError("%s: type is invalid")""" %
                     (self.current_field,
                      arg.extra['require_reference'],
                      arg.class_name,
                      self.current_field))



    def DefaultTo(self, msg):
        pass

    def BuiltinType(self, arg):
        self.cs.line("""if (typeof %s !== "%s") throw new FieldTypeError("%s")""" % (self.current_field, JS_TYPES[arg.type_name],  self.current_field))
        if arg.type_name == "integer":
            self.cs.line("""if (!Number.isInteger(%s)) throw new FieldTypeError("%s")""" % (self.current_field, self.current_field))

    def ValidatedBy(self, arg):
        self.cs.line("""if(!%s.%s(%s)) throw new FieldValidationError("%s: validation failed")""" %
                     (arg.extra['require_reference'],
                      arg.validation_function_name,
                      self.current_field,
                      self.current_field))
