"""Sample development of a robust contextual code emitter
"""

import sys

class CodeStream:
    def __init__(self, real, indent_spaces="  ", indent_level=0):
        self.real = real
        self.indent_spaces = indent_spaces
        self.indent_level = indent_level
        self.parts_in_use = False

    def flush(self):
        if self.parts_in_use:
            self.parts_in_use = False
            self.line()
        return self

    def part(self, part):
        """This adds precisely part (no leading or trailing spaces) and does NOT close the line"""
        if not self.parts_in_use:
            print(self.__indentation(), file=self.real, end='')
            self.parts_in_use = True
        if part:
            print(part, file=self.real, end='')
        return self

    def layer(self):
        """A layer provdides the consumer with a modifiable version that on return won't have altered the indention details."""
        self.flush()
        return CodeStream(self.real, self.indent_spaces, self.indent_level)

    def indent(self):
        self.indent_level += 1
        self.flush()
        return self

    def outdent(self):
        self.indent_level = self.indent_level - 1 if self.indent_level > 0 else 0
        self.flush()
        return self

    def __indentation(self):
        return self.indent_spaces * self.indent_level

    def line(self, *lines):
        self.flush()
        if len(lines) > 1:
            for entry in lines:
                self.line(entry)
        else:
            if len(lines) == 0:
                print(file=self.real)
            else:
                line = lines[0]
                    
                if not isinstance(line, str):
                    raise ValueError(f"Line {line} not string value")
                if '\n' in line:
                    lines_inner = line.split('\n')
                    def first_non_blank_line_outdent():
                        for inner in lines_inner:
                            if inner.strip() == "":
                                continue
                            return len(inner) - len(inner.lstrip())
                    outdent_needed = first_non_blank_line_outdent()
                    for inner in line.split('\n'):
                        self.line(inner[outdent_needed:])
                else:
                    indentation = self.__indentation()
                    print(f"{indentation}{line}", file=self.real)

        return self


if __name__ == "__main__":
    
    def first():
        print("first")
        cs = CodeStream(sys.stdout)
        cs.line('1')
        cs.indent()
        cs.line('2')
        cs.indent()
        cs.line('3')
        cs.outdent()
        cs.line('4')
        cs.outdent()
        cs.line('5')

    def second():
        print("second")
        cs = CodeStream(sys.stdout)
        cs.line('1').indent().line('2').indent().line('3').outdent().line('4').outdent().line('5')

    def third():
        print("third")

        def a_block(stream, *lines):
            stream.line("starting block")
            bl = stream.layer()
            bl.indent().line(*lines)
            stream.line("ending block")
        
        cs = CodeStream(sys.stdout)
        a_block(cs, '1', '2', '3')
        cs.line()
        a_block(cs, '2', '3', '4')

    def fourth():
        print("fourth")

        cs = CodeStream(sys.stdout)
        cs.layer().indent().part('a').part('b').line('c').indent().line('n1').line('n2')
        cs.line('y')

    def fifth():
        print("fifth ... mult-line line")
        cs = CodeStream(sys.stdout, "    ")
        cs.indent().line("abc\ndef\nghi")
        cs.line("""
        a
          b
          c
        d
        e""")
        

    first()
    second()
    third()
    fourth()
    fifth()
