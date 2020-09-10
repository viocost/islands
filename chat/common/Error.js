module.exports = {
    AttemptToInstatiateBaseClass: class AttemptToInstatiateBaseClass extends Error { constructor(data) { super(data); this.name = "AttemptToInstatiateBaseClass" } },
    NotImplemented: class NotImplemented extends Error { constructor(data) { super(data); this.name = "NotImplemented" } },
    NotSupported: class NotSupported extends Error{ constructor(data){ super(data); this.name = "NotSupported" } },
    AccessDenied: class AttemptToAccessValueOutsideOfParentDirectory extends Error{ constructor(data){ super(data); this.name = "AttemptToAccessValueOutsideOfParentDirectory" } }
}
