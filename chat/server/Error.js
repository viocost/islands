module.exports = {
    AttemptToInstatiateBaseClass: class AttemptToInstatiateBaseClass extends Error { constructor(data) { super(data); this.name = "AttemptToInstatiateBaseClass" } },
    NotImplemented: class NotImplemented extends Error { constructor(data) { super(data); this.name = "NotImplemented" } },
    AccessDenied: class AttemptToAccessValueOutsideOfParentDirectory extends Error{ constructor(data){ super(data); this.name = "AttemptToAccessValueOutsideOfParentDirectory" } }
}
