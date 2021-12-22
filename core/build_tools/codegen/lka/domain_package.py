import lka.domain as Domain
import lka.parser as Parser
import sys

# Package defines a distinct subdirectory within a project
# and assignes it a name, which can be referred to in
# domain objects definitions, in functions such as instance-of or validated-by
# Example:
#
#
# !package clientJS chat/client/src/js
#
# !message Test
#   thing instance-of clientJS/abc/ClientSettings
#   thing2 validated-by clientJS/bvbc/ValidatorThing2
#
# Such definition will allow codegen to find dependencies and properly
# require them.
#
# Codegen will look inside chat/client/src/js/abc/ClientSettings and
# chat/client/src/js/bvbc/ValidatorThing2
#
#
#
class Packages:

    @staticmethod
    def marker_name():
        return "!package"

    def __init__(self, tokens_for_packages):
        self.packages = dict() # {}

        print("Processing packages...")
        if tokens_for_packages:
            for package_tokens in tokens_for_packages:

                packages_built = Package.build(package_tokens)

                for package in packages_built:
                    package.accept(PackagePrettyPrintingVisitor())
                    if package.name in self.packages:
                        conflict_package = self.packages[package.name]
                        raise ValueError("Package %s duplicates package defined in  %s" % (package.name, conflict_package.provenance[0]))
                    else:
                        self.packages[package.name] = package

class Package(Domain.DomainFoundation):
    def __init__(self, provenance, name, path):
        super().__init__(provenance)
        self.name = name
        self.path = path


    @staticmethod
    def build(tokens):

        packages = []
        
        tc = Parser.TokenCursor(tokens)

        # Get the message and its name

        package_start = Parser.extract_constant(tc, Packages.marker_name(),  Packages.marker_name() + " expected and not given")

        while not tc.is_empty():
            package_name = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Valid identifier for package name not provided")
            package_path = tc.next()
            packages.append(Package([package_start, package_name, package_path], package_name.text, package_path.text))

        return packages

class PackageVisitor(Domain.VisitorBase):
    def Package(self, package):
        pass

class PackagePrettyPrintingVisitor(PackageVisitor):
    def __init__(self, dest=sys.stdout):
        self.dest = dest

    def Package(self, package):
        print("%s %s %s" % (package.provenance[0].text, package.name, package.path), file=self.dest)
