class CodeEmittingMixin:
    def __init__(self, dest):
        self.dest = dest
        self.indent = ""


    def add_indent(self):
        self.indent += "  "

    def unindent(self):
        self.indent = self.indent[0:-2]


    # Emits a single line to self.dest
    def emit_line(self, line=""):
        """
        line to append
        """
        if line == "":
            print(file=self.dest)
        else:
            print("%s%s" % (self.indent, line), file=self.dest)
