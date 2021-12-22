import sys
import lka.domain as Domain
import lka.parser as Parser
import lka.code_emitter_stream as CS

class FailedAgent:
    def __init__(self, agent, reason):
        self.failed = agent
        self.reason = reason
        
    def __repr__(self):
        return "FailedAgent(" + self.reason + " on agent " + str(self.failed)

    def __str__(self):
        return self.__repr__()
    
class Agents:
    """All Agents"""

    def __init__(self, tokens_for_agents, messages_known):

        self.messges = messages_known
        self.agents = dict()        # name -> agent
        self.failed_agents = dict() # name -> [FailedAgent,...]
        self.raw_agents = dict()    # name -> [agent, ...]

        if tokens_for_agents:
            self._load_agents_from_tokens(tokens_for_agents)
            self._validate()

    @staticmethod
    def marker_name():
        return "!agent"

    def _load_agents_from_tokens(self, tokens_for_agents):
        # load in the message instances from the tokens
        for agent_tokens in tokens_for_agents:
            agent = Agent.build(agent_tokens)
            print("Processing Agent...")
            agent.accept(AgentPrettyPrintingVisitor(CS.CodeStream(sys.stdout)))
            self._add(agent)

    def _add(self, agent):
        if self.agents or self.failed_agents:
            raise ValueError("Attempted to add agent after calling validate")
        
        if agent.name in self.raw_agents:
            self.raw_agents[agent.name].append(agent)
        else:
            self.raw_agents[agent.name] = [agent]

    def _validate(self):
        pass


    def __repr__(self):
        if self.failed_agents:
            issues = []
            for name in self.failed_agents.keys():
                for entry in self.failed_agents[name]:
                    issues.append(str(entry))
            return "Agents(failed_because=" + " ".join(issues) + ")"
        else:
            return "Agents(" + " ".join(self.agents.keys()) + ")"

    def __str__(self):
        return self.__repr__()
    

class Tag(Domain.DomainFoundation):
    def __init__(self, tokens, tag_identity):
        super().__init__(tokens)
        self.tag_identity = tag_identity

class Guard(Domain.DomainFoundation):
    def __init__(self, tokens, guard_name):
        super().__init__(tokens)
        self.guard_name = guard_name

class Action(Domain.DomainFoundation):
    def __init__(self, tokens, action_name):
        super().__init__(tokens)
        self.action_name = action_name

class State(Domain.DomainFoundation):
    def __init__(self, tokens, name, tags, entry_actions, exit_actions, transitions, regions):
        super().__init__(tokens)
        self.name = name
        self.tags = tags
        self.entry_actions = entry_actions
        self.exit_actions = exit_actions
        self.transitions = transitions
        self.regions = regions


    def accept(self, visitor):
        visitor.enter_State(self)

        if self.regions:
            visitor.enter_Regions(self)
            for region in self.regions:
                region.accept(visitor)
            visitor.exit_Regions(self)
            
        visitor.enter_Tags(self)
        for tag in self.tags:
            tag.accept(visitor)
        visitor.exit_Tags(self)

        if self.entry_actions:
            visitor.enter_EntryActions(self)
            for action in self.entry_actions:
                action.accept(visitor)
            visitor.exit_EntryActions(self)

        if self.exit_actions:
            visitor.enter_ExitActions(self)
            for action in self.exit_actions:
                action.accept(visitor)
            visitor.exit_ExitActions(self)

        if self.transitions:
            visitor.enter_Transitions(self)
            for transition in self.transitions:
                transition.accept(visitor)
            visitor.exit_Transitions(self)
    
        visitor.exit_State(self)

class Transition(Domain.DomainFoundation):
    def __init__(self, tokens, message_name, transition_to, actions, guards):
        super().__init__(tokens)
        self.message_name = message_name
        self.transition_to = transition_to
        self.actions = actions
        self.guards = guards

    def accept(self, visitor):
        visitor.enter_Transition(self)
        visitor.enter_TransitionGuards(self)
        for guard in self.guards:
            guard.accept(visitor)
        visitor.exit_TransitionGuards(self)
        visitor.enter_TransitionActions(self)
        for action in self.actions:
            action.accept(visitor)
        visitor.exit_TransitionActions(self)
        visitor.exit_Transition(self)

class Region(Domain.DomainFoundation):
    def __init__(self, tokens, name, use_history, entry_state_name, states):
        super().__init__(tokens)
        self.name = name
        self.use_history = use_history # BOOL
        self.entry_state_name = entry_state_name # string identifier
        self.states = states

    def accept(self, visitor):
        visitor.enter_Region(self)
        for state in self.states:
            state.accept(visitor)
        visitor.exit_Region(self)

class Agent(Domain.DomainFoundation):
    def __init__(self, tokens, name, regions):
        super().__init__(tokens)
        self.name = name
        self.regions = regions

    def accept(self, visitor):
        visitor.enter_Agent(self)
        visitor.enter_Regions(self)
        for region in self.regions:
            region.accept(visitor)
        visitor.exit_Regions(self)
        visitor.exit_Agent(self)

    @staticmethod
    def build(tokens):

        tc = Parser.TokenCursor(tokens)

        agent_start = Parser.extract_constant(tc, "!agent", "!agent expected and not given")
        agent_name = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Valid identifier for agent name not provided")

        regions = Agent.parse_regions(tc)

        # Agents require at least one region
        if not regions:
            raise Parser.ParserException(agent_start, "Expected at least one region in agent and found none")

        return Agent([agent_start, agent_name], agent_name.text, regions)

    @staticmethod
    def parse_regions(tc):
        """This expects begin-region and region stuff until end-region and CAN LOOP over many regions"""
        regions = []
        while True:
            
            # it's possible that we've read the END of the agent, in which case we're legitimately out of
            # tokens at this point
            if tc.is_empty():
                # Input is consumed, which is normal, since regions are the 'external most' container
                break

            # Nope, more tokens, so process them.
            
            region_start = Parser.extract_constant(tc, "begin-region")
            if not region_start:
                # Whatever it is, it's not a new region, so we're done building regions
                break
            region = Agent.parse_region(tc, region_start)
            regions.append(region)
        return regions

    @staticmethod
    def parse_region(tc, region_start):
        entry_state = None
        history = False

        region_identifier = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Expected identifier for region")

        # Fetch the entry-state or entry-then-history command
        entry_way = Parser.extract_one_of_set(tc, ["entry-state", "entry-then-history"], "Expected entry-state or entry-then-history")
        entry_state = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Expected entry state name")
        if entry_way.text == "entry-then-history":
            history = True

        # And now, we have one or more states or death
        states = Agent.parse_states(tc)
        if not states:
            raise Parser.ParserException(region_start, "Expected at least one state with define-state and found none")

        # The end marker ... 
        end_region = Parser.extract_constant(tc, "end-region", "end-region must be present and was not found")
        
        return Region([region_start, region_identifier, entry_way, end_region], region_identifier.text, history, entry_state.text, states)

    @staticmethod
    def parse_states(tc):
        """This gathers define-state entries until a non-nested end-region is hit"""

        states = []
        while True:
            define_state = Parser.extract_constant(tc, "define-state")
            if not define_state:
                break
            state = Agent.parse_state(tc, define_state)
            states.append(state)
        return states

    @staticmethod
    def append_identifier_or_list(tc, header, destination, is_list, what):
        read_one = False
        while is_list or not read_one:
            if is_list:
                # read identifiers until '*end'
                token = tc.peek()
                if token.text == '*end':
                    tc.advance()
                    break
            # read identifier and die if not one
            token = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "identifier for name of " + what)
            read_one = True
            if what == 'tag':
                destination.append(Tag([header, token], token.text))
            elif what == 'action':
                destination.append(Action([header, token], token.text))
            elif what == 'guard':
                destination.append(Guard([header, token], token.text))
            else:
                raise Parser.ParserException(peek_ahead, "INTERNAL ERROR: what given not recognized:" + str(what))
    
    @staticmethod
    def parse_state(tc, define_state):

        tags = []
        entry_actions = []
        exit_actions = []
        transitions = []
        regions = []

        state_identifier = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Expected identifier for state")

        while True:

            # we are building a state until we hit end-region or define-state, NEITHER of which we consume
            peek_ahead = tc.peek()
            if peek_ahead.text in ['end-region', 'define-state']:
                break

            #we can process: has-tag/has-tag*, on-entry/on-entry*, on-exit/on-exit*, begin-region, or identifier
            if peek_ahead.text in ['has-tag', 'has-tag*',
                              'on-entry', 'on-entry*',
                              'on-exit', 'on-exit*',
                              'begin-region']:

                # consume it, we're going to use it
                tc.advance()
                
                clause_name = peek_ahead.text.split("*")[0]
                is_list = peek_ahead.text.endswith("*")

                if clause_name == "has-tag":
                    Agent.append_identifier_or_list(tc, peek_ahead, tags, is_list, 'tag')
                elif clause_name == 'on-entry':
                    tc.advance() # consome the on-entry, leaving us with the action or action list
                    Agent.append_identifier_or_list(tc, peek_ahead, entry_actions, is_list, 'action')
                elif clause_name == 'on-exit':
                    tc.advance() # consume the on-exit leaving us the exit action or action list
                    Agent.append_identifier_or_list(tc, peek_ahead, exit_actions, is_list, 'action')
                elif clause_name == 'begin-region':
                    region = Agent.parse_region(tc, peek_ahead)
                    regions.append(region)
                else:
                    raise Parser.ParserException(peek_ahead, "INTERNAL ERROR: value expected to be handled but has no clause")
                    
            else:
                transition_name = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Expected transition identifier name or one of fixed state settings")
                transition = Agent.parse_transition(tc, transition_name)
                transitions.append(transition)

        return State([define_state, state_identifier], state_identifier.text, tags, entry_actions, exit_actions, transitions, regions)

    @staticmethod
    def parse_transition(tc, transition_name_token):
        
        transitions_to = None
        transitions_to_name = None
        actions = []
        guards = []

        while True:

            # We can have any number of guards or actions, and one transitions-to

            peek_ahead = tc.peek()
            if peek_ahead.text in ['transitions-to', 'has-action', 'has-action*', 'has-guard', 'has-guard*']:

                # we have an element
                tc.advance() # be sure to consume it

                clause_name = peek_ahead.text.split("*")[0]
                is_list = peek_ahead.text.endswith("*")

                if clause_name == 'transitions-to':
                    if transitions_to:
                        raise Parser.ParserException(peek_ahead, "Second transitions_to encountered")
                    transitions_to = peek_ahead
                    transitions_to_name = Parser.extract_passes_guard(tc, Domain.is_valid_identity_name, "Expected identifier for state to transition to")
                elif clause_name == 'has-action':
                    Agent.append_identifier_or_list(tc, peek_ahead, actions, is_list, 'action')
                elif clause_name == 'has-guard':
                    Agent.append_identifier_or_list(tc, peek_ahead, guards, is_list, 'guard')
                else:
                    raise Parser.ParserException(peek_ahead, "INTERNAL ERROR: value expected to be handled but has no clause")

            else:
                break

        # whatever was in peek was not consumed, so build a transition from what we have
        return Transition([transition_name_token, transitions_to, transitions_to_name],
                          transition_name_token.text,
                          transitions_to_name.text if transitions_to_name else None,
                          actions,
                          guards)
            
    
class AgentVisitor(Domain.VisitorBase):
    def enter_Agent(self, agent):
        pass
    def exit_Agent(self, agent):
        pass

    def enter_Regions(self, state):
        pass
    def exit_Regions(self, state):
        pass
    def enter_Region(self, region):
        pass
    def exit_Region(self, region):
        pass

    def enter_Transitions(self, state):
        pass
    def exit_Transitions(self, state):
        pass
    def enter_Transition(self, transition):
        pass
    def exit_Transition(self, transition):
        pass

    def enter_State(self, state):
        pass
    def exit_State(self, state):
        pass
    
    def enter_EntryActions(self, state):
        pass
    def exit_EntryActions(self, state):
        pass
    
    def enter_ExitActions(self, state):
        pass
    def exit_ExitActions(self, state):
        pass

    def enter_TransitionActions(self, state):
        pass
    def exit_TransitionActions(self, state):
        pass

    def Action(self, action):
        pass

    def enter_TransitionGuards(self, state):
        pass
    def exit_TransitionGuards(self, state):
        pass
    def Guard(self, guard):
        pass

    def enter_Tags(self, state):
        pass
    def exit_Tags(self, state):
        pass
    def Tag(self, tag):
        pass
    
class AgentPrettyPrintingVisitor(AgentVisitor):

    def __init__(self, cs):
        self.stack = [cs] # stack of CSs
    
    def add_layer(self):
        temp = self.stack[-1].layer().indent()
        self.stack.append(temp)
        return temp

    def cs(self):
        return self.stack[-1]
    
    def remove_layer(self):
        if len(self.stack) > 1:
            self.stack.pop().flush()
        return self.cs()

    def enter_Agent(self, agent):
        self.cs().line(f"{agent.provenance[0].text} {agent.name}")

    def enter_Region(self, region):
        self.cs().line(f"{region.provenance[0].text} {region.name}")

        tcs = self.add_layer()
        tcs.line().part("entry-then-history " if region.use_history else "entry-state ")
        tcs.part(region.entry_state_name)
        
    def exit_Region(self, region):
        self.remove_layer().line(region.provenance[3].text)
        
    def enter_Transition(self, transition):
        self.cs().line(transition.message_name)
        self.add_layer()

    def exit_Transition(self, transition):
        tcs = self.cs()
        if transition.transition_to:
            tcs.part('transitions-to ').part(transition.transition_to)
        self.remove_layer()

    def enter_State(self, state):
        tcs = self.cs()
        tcs.line().part(f"{state.provenance[0].text} {state.name}")
        self.add_layer()
        
    def exit_State(self, state):
        self.remove_layer()
    
    def enter_EntryActions(self, state):
        self.cs().line("on-entry")
        self.add_layer()
        
    def exit_EntryActions(self, state):
        self.remove_layer()
    
    def enter_ExitActions(self, state):
        self.cs().line("on-exit")
        self.add_layer()

    def exit_ExitActions(self, state):
        self.remove_layer()

    def Action(self, action):
        self.cs().line(f"has-action {action.action_name}")

    def Guard(self, guard):
        self.cs().line(f"has-guard {guard.guard_name}")
                           

    def Tag(self, tag):
        self.cs().line(f"has-tag {tag.tag_name}")
