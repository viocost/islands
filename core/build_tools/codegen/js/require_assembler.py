from lka.domain_message import MessageVisitor
from js.code_emitting_mixin import CodeEmittingMixin
from js.codegen_warning_comment import comment
from lka.code_emitter_stream import CodeStream
from os import path



ROOT_DIR = path.join("..", "..", "..")

# Given messages and packages assemble and emit all require statements
# and also generates checker functions in case some of support functions
# are not implemented
class RequireAssemblyVisitor(CodeEmittingMixin, MessageVisitor):
    def __init__(self, dest, packages=[], root_dir=None):
        super().__init__(dest)
        self.cs = CodeStream(dest, "    ")
        self.require_count = 1
        self.seen_dependencies = {}
        for package_name in packages:
            package = packages[package_name]

            candidate_path = path.join(root_dir or ROOT_DIR, package.path)
            if not path.exists(candidate_path):
                raise ValueError("Package path is not found: %s" % package.path)

            package.extra['abspath'] = path.abspath(candidate_path)

    # Given an argument that has defined package/file/entity triple
    # Processes it, resolves paths and emits appropriate require statement
    # Entity is something that file exports e.g. class, or function or object
    def process_triple(self, arg):
        package = arg.package
        package_name = package.name
        package_file = arg.package_file

        full_path = path.join(package.extra['abspath'], package_file + ".js")

        if not path.isfile(full_path):
            raise ValueError("File %s not found in package %s" % (full_path, package_name))

        path_to_dest_file = path.abspath(path.relpath(self.dest.name))

        path_to_dependency = path.relpath(full_path, path.dirname(path_to_dest_file))
        if path_to_dependency not in self.seen_dependencies:
            require_name = "_require_%d" % self.require_count
            self.require_count += 1
            self.seen_dependencies[path_to_dependency] = require_name
            self.cs.line('const  %s  = require("%s")' % (require_name, path_to_dependency))
        else:
            require_name = self.seen_dependencies[path_to_dependency]
        arg.extra['require_reference'] = require_name

    def ValidatedBy(self, arg):
        self.process_triple(arg)

    def DefaultTo(self, arg):
        self.process_triple(arg)


    def InstanceOf(self, arg):
        self.process_triple(arg)
