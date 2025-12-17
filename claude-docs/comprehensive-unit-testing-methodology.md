# Comprehensive Unit Testing Methodology

## Overview

This methodology combines the foundational principles from our engineering methodology with advanced unit testing strategies that create tests serving as **verification**, **documentation**, **refactoring safety**, and **design feedback**. The approach emphasizes thorough analysis before implementation and treats tests as the definitive source of truth for component behavior.

## Core Philosophy

### Tests as Multi-Purpose Assets

Unit tests should serve four critical purposes:

1. **Verification**: Ensure code behaves correctly under all conditions
2. **Documentation**: Serve as executable examples for developers  
3. **Refactoring Safety**: Provide immediate feedback when changes break contracts
4. **Design Feedback**: Reveal API usability issues and design problems

### The Golden Rule

**Tests are the source of truth for expected behavior. Never change tests to make code pass unless you can prove the original analysis was mathematically/logically incorrect.**

## Pre-Implementation Analysis Phase

### Step 1: Deep Component Analysis

Before writing any test code, perform comprehensive analysis:

#### **Purpose and Responsibility Analysis**
```
Component: [ClassName]
Primary Purpose: [Single responsibility description]
Key Responsibilities:
- [Responsibility 1]
- [Responsibility 2] 
- [etc.]

Anti-patterns to avoid:
- [What this component should NOT do]
```

#### **State Components Analysis**
```
Immutable State:
- [final fields that never change]

Mutable State:  
- [fields that change during lifecycle]
- [lifecycle rules for each field]

Expected State Transitions:
- [How state should change over time]
- [Invalid transitions that should be prevented]
```

#### **API Surface Analysis**
```
Construction Patterns:
- [All constructor variants and their contracts]

Core Methods:
- [Method name]: [Purpose] -> [Expected behavior]
- [Critical behavioral differences between similar methods]

Error Conditions:
- [Method] throws [Exception] when [specific condition]
- [Edge cases that should be handled gracefully]

Fluent API Patterns:
- [Method chaining expectations]
- [Return value contracts]
```

#### **Behavioral Contract Analysis**
```
CRITICAL BEHAVIORS:
1. [Specific behavior]: [Detailed explanation]
2. [Edge case]: [How it should be handled]
3. [Error condition]: [Expected response]

BEHAVIORAL DIFFERENCES:
- [Method A] vs [Method B]: [Key differences]
- [Why the difference matters]

EXPECTED EDGE CASES:
- [Empty input scenarios]
- [Boundary conditions] 
- [Invalid state scenarios]
- [Resource exhaustion scenarios]
```

### Step 2: Coverage Gap Analysis

Identify what needs testing by examining:

1. **Jacoco Reports**: Find uncovered lines/branches
2. **Constructor Variants**: All construction patterns
3. **Method Signatures**: Every public method
4. **Error Paths**: All exception scenarios
5. **Edge Cases**: Boundary conditions
6. **State Transitions**: All valid/invalid transitions

### Step 3: Test Strategy Design

#### **Test Organization Strategy**
```groovy
// =================================================================
// [CATEGORY] TESTING
// [Description of what this section tests]
// =================================================================

def "should [behavior description]: #scenario"() {
    given: "[test setup description]"
    // Setup code with clear variable names
    
    when: "[action being tested]"
    // The specific operation being verified
    
    then: "[expected outcome]"
    /*
     * ANALYSIS:
     * [Detailed explanation of WHY this is the expected behavior]
     * [Step-by-step reasoning]
     * [Edge cases this covers]
     * [Business rules this enforces]
     */
    // Assertions with meaningful descriptions
    
    where:
    scenario | input | expected | description
    // Data-driven test cases with clear descriptions
}
```

#### **Required Test Categories**

1. **Constructor Testing**: All construction patterns and initial state
2. **State Access Testing**: Getters, state inspection methods
3. **Core Behavior Testing**: Primary functionality
4. **Edge Case Testing**: Boundary conditions, empty inputs
5. **Error Condition Testing**: All exception scenarios
6. **Integration Point Testing**: How component interacts with dependencies
7. **Debugging Support Testing**: toString(), logging, diagnostic methods

## Test Implementation Standards

### Analysis-First Test Writing

#### **For Each Test Method:**

1. **Manual Analysis**: Work through expected behavior by hand
2. **Document Reasoning**: Include detailed analysis comments
3. **Write Assertions**: Based on manual analysis, not code output
4. **Verify Logic**: Ensure test logic matches analysis

#### **Required Analysis Documentation**
```groovy
then: "should [expected behavior description]"
/*
 * ANALYSIS:
 * [Business rule or API contract being tested]
 * 
 * Step-by-step reasoning:
 * 1. [Initial state description]
 * 2. [Operation performed] 
 * 3. [Expected state change]
 * 4. [Why this is correct behavior]
 * 
 * Edge cases covered:
 * - [Edge case 1]: [how handled]
 * - [Edge case 2]: [how handled]
 * 
 * Critical behaviors verified:
 * - [Behavior 1]: [verification approach]
 * - [Behavior 2]: [verification approach]
 */
// Assertions that prove the analysis
result.someProperty() == expectedValue
result.otherProperty() == derivedValue
```

### Test Documentation Standards

#### **Self-Documenting Test Names**
```groovy
// ✅ GOOD: Describes behavior and scenario
def "should mark open tokens when consuming but not when advancing"()
def "should drop tokens when no content is consumed"()
def "should throw IllegalStateException when ending non-existent token"()

// ❌ BAD: Generic or implementation-focused
def "should test consume method"()
def "should test error handling"()
def "should verify token creation"()
```

#### **Parameterised Tests for Readability**

**The Golden Rule of Parameterised Testing: Use where clauses whenever they make tests more readable and reduce verbosity without sacrificing clarity.**

Use parameterised tests with where clauses when:
- Testing the same behavior with multiple input/output combinations
- Multiple test cases follow identical logical patterns
- The analysis can be documented once and applied to all data sets
- It dramatically reduces code duplication and improves maintainability
- The tabular format makes test data relationships immediately clear

**Prioritise readability above all else** - parameterised tests should make it easier, not harder, to understand what's being tested.

```groovy
// ✅ EXCELLENT: Clear data relationships, single analysis covers all cases
@Unroll
def "should validate JavaScript variable names: #description"() {
    given: "variable name input"
    def node = createVariableNameNode(variableName)
    
    when: "validator processes the input"
    validator.visit(node, context)
    
    then: "should accept valid names and reject invalid ones"
    /*
     * ANALYSIS:
     * JavaScript identifier rules (applies to all test cases):
     * - Must start with letter, underscore, or dollar sign
     * - Can contain letters, digits, underscores, dollar signs
     * - Cannot be reserved words
     * - Case sensitive
     */
    if (shouldBeValid) {
        ParseNodeAssertions.assertThat(node).hasNoDiagnostics()
    } else {
        ParseNodeAssertions.assertThat(node).hasDiagnosticCount(1)
    }
    
    where:
    description              | variableName | shouldBeValid
    "simple identifier"      | "myVar"      | true
    "camelCase"              | "camelCase"  | true
    "starts with underscore" | "_private"   | true
    "starts with dollar"     | "\$global"   | true
    "starts with digit"      | "1variable"  | false
    "contains space"         | "my var"     | false
    "reserved word"          | "class"      | false
}

// ❌ AVOID: When scenarios need different analysis or setup
def "should handle different variable types with registry"() {
    // Don't parameterise when each case needs unique analysis
    // Better to have separate focused tests
}
```

**When NOT to use parameterised tests:**
- Different test cases require different setup or analysis
- The where clause becomes so complex it hurts readability
- Error scenarios need different assertion patterns
- You find yourself adding conditional logic within the test method

**Table Formatting Best Practices:**
```groovy
where:
scenario                    | input           | expected        | errorType
"simple success case"       | "validInput"    | "expectedOut"   | null
"boundary condition"        | "edgeCase"      | "edgeResult"    | null
"validation failure"        | "invalidInput"  | null            | VALIDATION_ERROR
"missing required field"    | ""              | null            | REQUIRED_FIELD_MISSING
```

Use alignment and clear column headers to make the data relationships immediately obvious. The test data should read like a specification table.

#### **Comprehensive Test Class Documentation**
```groovy
/**
 * Comprehensive unit tests for [ClassName].
 * 
 * This test suite serves as:
 * - Documentation of the [ClassName] API and contracts
 * - Safety net for refactoring [component functionality]
 * - Reference for developers understanding [domain] behavior
 * - Verification of edge cases and error conditions
 */
class ComponentNameSpec extends Specification {
```

#### **Test Section Organization**
```groovy
// =================================================================
// CONSTRUCTOR TESTING
// Tests all construction patterns and initial state
// =================================================================

// =================================================================  
// STATE ACCESS TESTING
// Tests getters and state inspection methods
// =================================================================

// =================================================================
// CORE BEHAVIOR TESTING  
// Tests primary functionality and business logic
// =================================================================

// =================================================================
// ERROR CONDITION TESTING
// Tests exception scenarios and invalid inputs
// =================================================================

// =================================================================
// EDGE CASE TESTING
// Tests boundary conditions and special scenarios
// =================================================================
```

### Advanced Testing Patterns

#### **Behavioral Difference Testing**

When components have similar methods with subtle differences:

```groovy
def "should demonstrate critical behavioral differences between similar methods"() {
    given: "setup that highlights the difference"
    def context = new Component(testData)
    
    when: "using first method"
    context.methodA(input)
    def resultA = context.getState()
    
    and: "resetting and using second method"
    context.reset()
    context.methodB(input)  
    def resultB = context.getState()
    
    then: "results should show the critical difference"
    /*
     * ANALYSIS:
     * CRITICAL BEHAVIORAL DIFFERENCE:
     * - methodA(): [specific behavior]
     * - methodB(): [different specific behavior]
     * 
     * Why this matters:
     * [Business impact of the difference]
     * 
     * Common mistake:
     * [How developers might confuse these methods]
     */
    resultA.property != resultB.property
    // Specific assertions proving the difference
}
```

#### **State Transition Testing**

For stateful components:

```groovy
def "should handle complex state transitions correctly"() {
    given: "component in initial state"
    def component = new StatefulComponent()
    
    when: "performing sequence of state changes"
    component.startProcess()        // State: STARTED
    component.addData(testData)     // State: PROCESSING  
    component.finalize()            // State: COMPLETED
    
    then: "state transitions should be valid and complete"
    /*
     * ANALYSIS:
     * State Transition Sequence:
     * 1. INITIAL -> STARTED: [rules for this transition]
     * 2. STARTED -> PROCESSING: [rules for this transition]
     * 3. PROCESSING -> COMPLETED: [rules for this transition]
     * 
     * Invariants maintained:
     * - [Invariant 1]: [how verified]
     * - [Invariant 2]: [how verified]
     * 
     * Invalid transitions prevented:
     * - [Invalid transition]: [how prevented]
     */
    component.getState() == COMPLETED
    component.getData() == expectedProcessedData
    component.isValid()
}
```

#### **Error Condition Documentation**

```groovy
def "should throw IllegalStateException when violating component contract"() {
    given: "component in invalid state for operation"
    def component = new Component()
    // Setup that creates the invalid condition
    
    when: "attempting invalid operation"
    component.invalidOperation()
    
    then: "should fail fast with clear error"
    /*
     * ANALYSIS:
     * Error Condition: [Specific contract violation]
     * 
     * Why this is invalid:
     * [Business rule being violated]
     * 
     * Error handling strategy:
     * - Fail fast to prevent corruption
     * - Clear error message for debugging
     * - No side effects on component state
     * 
     * Alternative handling considered:
     * [Why other approaches were rejected]
     */
    def ex = thrown(IllegalStateException)
    ex.message.contains("specific error description")
    // Verify no side effects occurred
}
```

#### **Mock Integration Testing**

When testing component interactions:

```groovy
def "should interact correctly with dependencies"() {
    given: "component with mocked dependencies"
    def mockDependency = Mock(DependencyInterface) {
        expectedMethod(expectedInput) >> expectedOutput
        // Setup all expected interactions
    }
    def component = new Component(mockDependency)
    
    when: "performing operation that uses dependency"
    def result = component.performOperation(input)
    
    then: "should use dependency correctly"
    /*
     * ANALYSIS:
     * Dependency Contract:
     * - [Component] expects [dependency] to [behavior]
     * - Input transformation: [how input is prepared]
     * - Output handling: [how output is processed]
     * 
     * Interaction Pattern:
     * 1. [Component] calls [dependency.method] with [parameters]
     * 2. [Dependency] returns [expected format]
     * 3. [Component] processes result as [transformation]
     * 
     * Error handling:
     * - If [dependency] fails: [component behavior]
     * - If [dependency] returns invalid data: [component behavior]
     */
    1 * mockDependency.expectedMethod(expectedInput) >> expectedOutput
    0 * mockDependency.unexpectedMethod(_)
    result == expectedTransformedOutput
}
```

## Quality Assurance Checklist

### Before Submitting Tests

**Analysis Verification:**
- [ ] Manual analysis performed for each test
- [ ] Expected behavior documented with reasoning
- [ ] Edge cases identified and covered
- [ ] Error conditions documented

**Test Quality:**
- [ ] Test names describe behavior, not implementation
- [ ] Analysis comments explain WHY, not just WHAT
- [ ] Assertions based on analysis, not code output
- [ ] Mock interactions verify contracts, not implementation

**Coverage Verification:**
- [ ] All public methods tested
- [ ] All constructor variants tested  
- [ ] All error conditions tested
- [ ] All edge cases tested
- [ ] 100% line and branch coverage achieved

**Documentation Value:**
- [ ] New developers can understand API from tests
- [ ] Test failures clearly indicate what's broken
- [ ] Tests serve as executable examples
- [ ] Complex behaviors are thoroughly explained

## 🚨 CRITICAL POST-TEST QUALITY VALIDATION 🚨

**MANDATORY: After completing any test implementation ***AND ensuring all tests pass***, the implementer MUST produce a comprehensive quality audit against this checklist. This audit must be performed explicitly and documented out into the chat (md file not needed).**

### Critical Quality Defects to Identify

**❌ LYING TESTS (Most Serious)**
- [ ] **Do any tests claim to test behavior X but actually test behavior Y?**
- [ ] **Are there tests with misleading names that don't match what they actually verify?**
- [ ] **Do test descriptions/analysis comments contradict the actual assertions?**

**❌ DATA MANIPULATION TO PASS TESTS**
- [ ] **Are there tests that remove or modify test data when tests fail instead of fixing test logic?**
- [ ] **Did any tests remove whitespace, null values, or edge conditions to make tests pass?**
- [ ] **Are there tests that claim to test trimming but don't have whitespace to trim?**
- [ ] **Are there tests that claim to test error handling but don't actually trigger errors?**

**❌ WEAK OR MEANINGLESS ASSERTIONS**
- [ ] **Do all assertions actually verify the specific behaviors described in analysis comments?**
- [ ] **Are there generic assertions (like `result == null`) without meaningful context verification?**
- [ ] **Are there assertions that just check if something exists without verifying it works correctly?**

**❌ REDUNDANT OR DUPLICATE TESTS**
- [ ] **Are there redundant tests that essentially verify the same behavior without added value?**
- [ ] **Do multiple tests cover identical code paths without testing different scenarios?**

**❌ EDGE CASE MISREPRESENTATION**
- [ ] **Are there tests that claim to test edge cases but use normal/happy path data?**
- [ ] **Do tests claim comprehensive coverage but miss obvious boundary conditions?**

**❌ TECHNICAL IMPLEMENTATION ERRORS**
- [ ] **Are the correct test data construction patterns used (RangeFinders, mocking patterns)?**
- [ ] **Do mock setups actually reflect real usage patterns?**
- [ ] **Are test helper methods implemented correctly?**

### Mandatory Quality Validation Questions

**The implementer must explicitly answer these questions:**

1. **"Did I write any tests that claim to test [specific behavior] but don't have the test data necessary to actually test that behavior?"**

2. **"When any test failed during development, did I modify the test data or remove edge conditions instead of fixing the test logic?"**

3. **"Are there any tests where the assertion doesn't match what the test name says it's testing?"**

4. **"Do all my analysis comments accurately describe what the assertions actually verify?"**

5. **"Are there any tests that are essentially duplicates without providing additional value?"**

6. **"Did I use proper test data construction and avoid shortcuts that compromise test validity?"**

7. **"Was there any implementation errors/bug/logic problems that caused tests to fail that I didn't fix in the implementation code, but rather adjusted expectation to fit bad code?**

### Quality Audit Report Template

```
## Post-Test Quality Audit Report

### Tests Implemented
- Total test methods: [X]
- Test categories covered: [list]
- Coverage achieved: [X]% lines, [X]% branches

### Critical Quality Checks ✅/❌
- [ ] No lying tests (names match behavior)
- [ ] No data manipulation to pass tests  
- [ ] All assertions verify described behaviors
- [ ] No redundant tests without value
- [ ] Edge cases use appropriate test data
- [ ] Technical implementation patterns correct

### Issues Found and Corrected
1. [Issue description] -> [How fixed]
2. [Issue description] -> [How fixed]

### Verification Statement
I have explicitly checked each test against the critical quality defects list and confirm that:
- All test names accurately describe what is tested
- No test data was modified to make failing tests pass
- All assertions verify the behaviors described in analysis comments
- All edge case tests use appropriate edge case data
- No misleading or redundant tests remain

Completed by: [Name]
Date: [Date]
```

**⚠️ IMPORTANT: This quality audit is mandatory and must be completed before considering any test implementation finished. The audit report must be produced and reviewed.**

### Test Maintenance Standards

**When Tests Fail:**
1. **Assume the code is wrong** (95% of cases)
2. Re-examine the analysis that led to test expectations
3. Only change tests if analysis was mathematically incorrect
4. Document any analysis corrections

**When Refactoring:**
1. Tests should continue passing if behavior is preserved
2. Test failures indicate contract violations
3. Update tests only when contracts intentionally change
4. Maintain same level of analysis documentation

**When Adding Features:**
1. Analyze new behavior thoroughly before implementation
2. Add tests following the same documentation standards
3. Update existing tests only if contracts change
4. Ensure new tests integrate well with existing suite

## Benefits of This Methodology

### For Individual Developers
- **Confidence**: Know exactly what code should do
- **Speed**: Fast feedback when changes break contracts
- **Understanding**: Tests serve as executable documentation
- **Quality**: Comprehensive coverage prevents regressions

### For Teams
- **Onboarding**: New developers learn from tests
- **Collaboration**: Shared understanding of component contracts
- **Maintenance**: Safe refactoring with test safety net
- **Design**: Tests reveal API usability issues early

### For Long-term Maintenance
- **Evolution**: Tests document intent for future changes
- **Debugging**: Test failures pinpoint exact problems
- **Refactoring**: Major changes can be made confidently
- **Knowledge Preservation**: Tests capture domain knowledge

## Examples of Excellent Test Documentation

### Analysis-First Example
```groovy
def "should calculate token span correctly when content is consumed"() {
    given: "context with specific content"
    def context = new DefaultLexingContext("hello world")

    when: "creating token with consumed content"
    context.beginToken(REQUEST)
    context.consume()  // Consume 'h'
    context.consume()  // Consume 'e'  
    context.consume()  // Consume 'l'
    context.endToken()

    then: "token should have correct span and content"
    /*
     * ANALYSIS:
     * Token creation sequence:
     * 1. beginToken() -> creates TokenTracker with no start position
     * 2. First consume() -> marks TokenTracker start position = 0
     * 3. Subsequent consume() calls -> advance position to 3
     * 4. endToken() -> creates Token from start=0 to current=3
     * Token.getValue() extracts document.substring(start.offset, end.offset)
     */
    def result = context.getLexResult()
    result.tokens.size() == 1
    
    def token = result.tokens[0]
    token.getTokenType() == REQUEST
    token.getValue() == "hel"
    token.from.offset == 0
    token.to.offset == 3
}
```

### Behavioral Difference Example
```groovy
def "should handle consume() vs advance() behavioral differences"() {
    given: "context at start of document"
    def context = new DefaultLexingContext("hello")

    and: "open token to track the difference"
    context.beginToken(REQUEST)

    when: "using advance() - does not mark tokens"
    context.advance()

    and: "then using consume() - marks open tokens"  
    context.consume()

    and: "ending the token"
    context.endToken()

    then: "token span reflects only consumed content"
    /*
     * ANALYSIS:
     * CRITICAL BEHAVIORAL DIFFERENCE:
     * - advance(): moves position but doesn't mark open tokens with start position
     * - consume(): moves position AND marks open tokens with current position BEFORE advancing
     * 
     * Sequence analysis:
     * 1. Start at offset 0, beginToken() -> TokenTracker with no start position
     * 2. advance() -> position = 1, TokenTracker still has no start position  
     * 3. consume() -> TokenTracker start position = 1 (current pos), then advance to 2
     * 4. endToken() -> Token spans from position 1 to 2, value = "e"
     */
    def result = context.getLexResult()
    result.tokens.size() == 1
    result.tokens[0].getTokenType() == REQUEST
    result.tokens[0].getValue() == "e"  // Only consumed character at position 1
    result.tokens[0].from.offset == 1   // Start where consume() was called
    result.tokens[0].to.offset == 2     // End at final position
}
```

This methodology produces tests that are not just verification tools, but comprehensive documentation and safety nets that make codebases more maintainable, understandable, and reliable.
