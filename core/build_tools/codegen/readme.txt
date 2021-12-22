A simple (hand-coded) generator with a manual tokenizer and recursive-descent
parsing to demonstrate the concepts behind building a DSL and the visitors
useful to code-generation.

The initial language is as follows:

# Def file format Notes:

# No tabs allowed (throw exception if tabs present)

# Lines are processed in LINE order

# !include <filename> recurses so the provenance is consistent
# !inculde MUST be only thing on the line (leading/trailing spaces/comments irrelevant)

# EOL and any sequence of one or more spaces are equivalent to a space

# Syntax is case-sensitive

# filenames are not read more than once (cached) so it's safe to include
# freely

# Comments are ;.*$ and are treated as a single white-space
# There are no block comments

# Package (directory) syntax:
# !package <name> <rest ... the directory relative to git root>

# Message Definition Syntax
# !message <name>
#   start-optional ; sticky and at most once
#   <fieldname> [null-ok] ; null-ok is optional 
#        <non-dashed-word> ; will be passed to builtinValidationType(non-dashed-word,value)
#        unchecked-value ; no validation at all
#        instance-of <package-name>/package-filename>/<classname>
#        nested-message <message-name> ; recursion forbidden
#        known-message ; any validly defined message will work
#        validated-by <package-name>/package-filename>/<function-name>
#        default-from  <package-name>/package-filename>/<function-name>; only allowed in optional block and must be function call to give default
# EOF or next type

# SAMPLE:
# !message RawChat sender string content string
#    null-ok sentTime validated-by timeIsValid
#    optional privateRecipient string

# !machine <derived-class-name>
# begin-region <identifier, number, or nothing>
#     ONE OF--
#       entry-state <immediate-child-state-identity>
#       use-history <immediate-child-state-identity> ; if this is set, the entry-state is used only on the initial entry until history is set
#     state-definition ; as many as needed
#  end-region
# STATE DETAIL WITHIN SUBSTATES
# define-state <name or number required unique within region>
#    has-tag <unique-tag-name-or-number> ; NOTE: as many as desired of tag-id name pairs
#    on-entry
#    on-exit
#    <message-name>
#   OPTIONAL
#      passes-guards <name> ... end-guards
#      runs-actions <name> ...  end-actions
#      transitions-to <new-state-name-or-number>
#    begin-region ... end-region ; nested 


To invoke: lka/generate_js.py <input-file-name> <output-file-name>

The test_data/sample.def file draws in s1.def to show nesting.

NOTE: the sample_def refers to test_data/s1.def because the current
      directory is the invocation direction. That's perhaps not a
      good model going forward.


1. enable region to be anonymous, give it state-name + offset in state (such as powered_on_4)
2. enable a new parser to accept identifier or number
3. enable a transition with no message, to be checked AFTER the machine has completed each message transitions (guards may be used to restrict firing)
4. enable a way to represent "state is active" in guard condition clause that does NOT have to be user-implemented
5. enable message pre-filter so we can avoid having to "guard" messages for the sole purpose of filtering to the proper machine instance (for instance, a chat channel bot would receive ChatMessage for ALL channels and pre-filter to its own channels, but NOT prefilter ShutdownRequested)
5.a guard conditions to pass message
5.b guard conditions to reject message
5.c USER IMPLEMENTED function that can reject, accept, and optionally inject messages
6. a pre-process action(s) can be called BEFORE the machine accepts the message for dispatching but AFTER the pre-filter and can reject the message or alter it or inject more messages etc. USER IMPLEMENTED
6.a This CHAINS in the order called, and if a message is altered it passes, if injected it QUEUES internally
7. a post-process action(s) can be called AFTER the machine and all anonymous transitions are done. It can't change state but it can inject message (which would start the machine again). USER IMPLEMENTED

Sample code that works with message arrangements

class MessageTypeRefers {
  constructor(size) { this.ar = new Array(size); for(let i in ar) { ar[i]=[];} }
  get(m) { let idx = m.msg_offset_index; if(idx) return this.ar[idx]; throw exception not valid message given }
  }

class MessageBus {
  deliver(s, m) {
    verifySenderIsSubscriber(s) // check if sender has .update
    if( this._in_process) { this.enqueue([s,m]); return; }
    subscriptions = this.subscriptions.get(m)
    this.in_proces = true
    for(let i in subscriptions){
       let subscriber = subscriptions[i];
       if(subscriber === s) continue;
       subscriber.update(m)
    }
    this._in_process = false;
    if(this.queue.not_empty()) .,...
    
