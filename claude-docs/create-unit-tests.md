Please implement unit tests against this file: $ARGUMENTS - The aim is to produce excellent tests and test coverage. There are no prizes here for speed of implementation. Thinking and careful analysis, planning and code writing will always be preferable in every sense. 

**Pre-test writing Process**:

1. If you don't have our full established unit testing methodology already in your context, read *and understand* this file: docs/instructions/comprehensive-unit-testing-methodology.md
2. Perform a very comprehensive analysis and plan of all the various code paths, what will be tested and how. Think hard about this 
3. Look to other tests in the same package with similar naming conventions as your primary reference on conventions, patterns and methodology, if available 
4. Analyse all potential code branches that would benefit from having tests coverage and work out a strategy to ensure they are in fact covered 
5. If, during your analysis of the implementation code to be tests, you see issues or bugs, stop and report back 
6. Pass your analysis and plan and bugs discovered along with all relevant files and other information to the spock-testing-expert agent for pre-testing advice and consultation
7. Fix bugs discovered that would affect your tests.
8. Show your analysis/plan and show all the advice that came back from the Spock-testing-expert agent 
9. If the spock-testing-expert recommends any action at this stage, before continuing to writing the tests, consider following his recommendation if reasonable and appropriate. If not, output an explanation why you are discounting their advice.

**Test Implementation Process**:

1. Closely follow all advice and recommendations from the spock-testing-expert agent. Be sure to follow any Spock or Groovy-specific technical advice or direction they give to you.
2. Closely follow the **Comprehensive Unit Testing Methodology**
3. Where clauses (data driven testing) is **STRONGLY** encouraged. Rather than writing multiple tests with the same setup/assertion patterns, you should condense them into a single test. See DDT Process below
4. Remember that readable and maintainable tests are a very important part of the overall methodology and goals of this project.
5. Consult the source code for all other classes you use in writing your tests. **You are NOT to guess methods, constructors, properties etc**. Consult the source code to confirm how to interact with other classes, Method names, properties, constructors etc. There should be **no excuse** for a test failing to compile because you used the wrong method name, arguments etc or because you guessed or implied something rather than explicitly checking the source code. If you are uncertain how to use a class, search the source code, both Java production code and test implementation for example usage.
6. **Use project assertion helpers** for readable tests. Utilise assertion helpers in `src/test/groovy/com/http/parser/assertions` and `src/test/groovy/com/http/context/assertions` for fluent, readable assertions (e.g., `result.toAssert().containsToken(TOKEN_TYPE, at(line: 1, column: 5))`)

**DDT Specific Methodology**

1. Closely follow the DDT process outlined in the comprehensive unit testing methodology and advice from the spock-testing-expert agent in regards to DDT opportunities.
2. Make sure that your use of DDT is reasonable and leads to more readable tests. Do not use DDT where it makes the tests less readable or more complex.
3. **Anti-patterns to avoid**:
   ```groovy
   // ❌ AVOID: Closures in where clauses
   where:
   scenario | mockSetup
   "case1"  | { Mock(Service) { method() >> "response" } }

   // ✅ PREFER: Split complex setup into separate tests
   def "should handle case1"() {
       given:
       def service = Mock(Service)
       service.method() >> "response"
   }
   ``` 

**Post Test Implementation Process**

1. Immediately after implementing tests, run them and fix any compilation problems. Continue this process iteratively fixing compilation errors/running until all tests compile.
2. After the test properly compile if there are **any** tests failures, you are to immediately consult the spock-testing-expert agent for help and carry out his instructions. You are to iteratively go back and forth with the spock-testing-expert agent until all tests pass. **Do not try to solo this**. The spock-testing-expert agent is a 20 years Spock/Groovy veteran, he eats, sleeps and breathes the stuff. You are to collaborate with him to fix any failing tests.
3. Refactoring the implementation under test should ALWAYS be an option. If you have an expectation that's not met, **BUT SHOULD BE MET**, you should fix the bug causing the failure. **Never change the tests to fit a faulty or buggy implementation** - Tests must always express the desired behavior
4. If you are collaborating with the spock-testing-expert agent and a test is still proving extremely challenging to get to pass, you are to stop and refer back to the user. It is **never acceptable** to delete or simplify a test just because, technically, you and the spock-testing-expert cannot get it to work. You **must report back to the user** and ask for help.
5. Remember that tests are sacred. They represent the analyzed truth of what should happen. Protect them from corruption by hasty changes or simplifications.
6. Remember that the post-test-process is one of complete collaboration with the spock-testing-expert agent. You are to work together to fix any failing tests. You are to consult the spock-testing-expert agent for help and guidance at any time. You are to follow his advice and direction. You are to collaborate with him to fix any failing tests.
7. Expressly, you are **not to grind** away trying this that or the other. You should always work to a process of Identified Problem -> High Confidence Solution -> Implementation. You are not to try random things and hope for the best. You are to work to a process of thinking/analysis, understanding, planning and then implementation.
8. When asking for help from the agent, pass on detailed information about what you are working on, what you are testing and the difficulties you are facing. 

**Post Passing Process**

1. After you create the tests and verify they are passing, you MUST do a post-test analysis of your work. Firstly, use MCP to lint the test file and fix any warnings. Then hand off to the spock-test-reviewer agent to review your work.
2. If the spock-test-reviewer has any concerns or recommendations, you **must** either implement them, or justify why you did not or can not implement them. The test reviewer will also check coverage and you must follow his recommendations to implement additional tests or modify existing tests to ensure critical and key areas of code are covered.
3. Follow advice from the reviewer including any additional tests that need to be written, documentation changes, redundant test deletion, opportunities for consolidation of tests using DDT. If you choose not to implement any recommendations, you must justify why you chose not to.
4. After the reviewer has given you his report, if you feel the need, you can ask the spock-testing-expert agent for a second opinion. You can also ask for help, advice and direction you may need to implement the reviewer's recommendations.
5. This process should be completely iterative across the agent team, calling in the experts as needed. The work should only be considered complete when all team members are satisfied with the work.

**Collaborating with the Reviewer**

To ensure efficient review process, follow these guidelines:

1. **What to Submit for Review**:
   ```markdown
   ## Test Submission Context
   - Test File(s): [Absolute paths to test files]
   - Implementation File(s): [What's being tested - absolute paths]
   - Test Execution Status: All tests passing ✓
   - Pre-review Checklist:
     - [ ] All tests compile and pass
     - [ ] Consulted with spock-testing-expert during development
     - [ ] Addressed any implementation bugs discovered
     - [ ] Self-reviewed against methodology
   ```

2. **Include Your Analysis**:
   - Your pre-test analysis showing component understanding
   - Summary of advice from spock-testing-expert and what was implemented
   - Decisions made and reasoning for any deviations from expert advice
   - Any areas you found challenging or couldn't fully test

3. **Pre-Review Self-Audit**: Not to be included in test file
   ```groovy
   /*
    * PRE-REVIEW AUDIT:
    * ✅ Naming: All tests describe behaviour, not implementation
    * ✅ Analysis: Every test has analysis comments
    * ✅ DDT: Used where it improves readability
    * ✅ Assertions: Using project helpers where available
    * ✅ British English: Verified throughout
    * ⚠️ Note: Complex mock setup in testXYZ - couldn't simplify further
    */
   ```

4. **Organise Tests Clearly**:
   ```groovy
   // =================================================================
   // CONSTRUCTOR TESTING
   // 3 tests, all passing
   // =================================================================

   // =================================================================
   // EDGE CASE TESTING
   // 5 tests, all passing, covers boundary conditions
   // Note: See line 275 for unusual null handling - deliberate design
   // =================================================================
   ```

5. **Responding to Feedback**:
   Structure your response as:
   ```markdown
   ## Review Feedback Response

   ### Critical Issues Addressed
   1. **Issue**: [Reviewer's feedback point]
      **Action**: [What you did]
      **Result**: [Outcome]

   ### Recommendations Considered
   1. **Suggestion**: [Reviewer's recommendation]
      **Decision**: [Implemented/Not implemented]
      **Reasoning**: [Why, especially if not implemented]
   ```

6. **When You Disagree**:
   It's acceptable to push back with evidence:
   ```markdown
   ## Disagreement: [Specific feedback point]
   **Your recommendation**: [What reviewer suggested]
   **My position**: [Your alternative]
   **Evidence**:
   - [Code example showing why your approach works]
   - [Methodology section supporting your decision]
   - [Expert consultation confirming approach]
   ```

Remember: The reviewer checks coverage metrics and will identify gaps. Be proactive in providing context about your testing decisions to make the review process efficient.

**Collaborating with the Spock Testing Expert**

The expert is involved throughout development, not just at submission. Effective collaboration requires different context at each stage:

1. **Pre-Test Consultation Format**:
   When requesting initial analysis advice:
   ```markdown
   ## Implementation Analysis Request
   - Implementation File: [Absolute path]
   - Component Summary: [Brief description of what it does]
   - Identified Complexity Areas: [Specific methods/behaviours you're concerned about]
   - Testing Challenges Anticipated: [What you think might be difficult]
   - Specific Questions: [Concrete things you need advice on]
   ```

2. **During Implementation - Troubleshooting Format**:
   When tests fail or you encounter issues:
   ```markdown
   ## Test Failure Consultation
   - Failing Test File: [Absolute path]
   - Implementation File: [Absolute path]
   - Specific Failure: [Exact error message/unexpected behaviour]
   - What You've Tried: [Specific attempts made]
   - Your Current Understanding: [What you think is happening]
   ```

3. **Common Mistakes to Avoid**:
   - **❌ Vague consultation**: "This test isn't working"
   - **✅ Specific consultation**: "Mock interaction verification fails with 'Too few invocations' at line 45"

   - **❌ Missing context**: Showing only test code without implementation
   - **✅ Full context**: Providing both test and implementation code

   - **❌ Multiple attempts before asking**: Trying 5 different approaches randomly
   - **✅ Early consultation**: Ask after first failed attempt with clear understanding

4. **What the Expert Needs**:
   - **Pre-test phase**: Implementation code, component responsibilities, edge cases
   - **During implementation**: Current test code, implementation code, specific errors
   - **Post-failure**: Test execution output, implementation behaviour analysis

5. **Effective Question Patterns**:
   ```groovy
   // ❌ POOR: "Why doesn't this work?"
   def "test something"() {
       // test code
   }

   // ✅ GOOD: Specific question with context
   def "should process valid input correctly"() {
       given: "valid input"
       // QUESTION: Getting "Too few invocations" on line 47
       // Expected: 1 call to repository.save()
       // Actual: 0 calls
       // Implementation calls save() inside try-catch at Implementation.java:25
       // Could exception handling be preventing the mock interaction?
   ```

6. **Follow-up Protocol**:
   - Implement the expert's advice completely
   - If unclear, ask for clarification before proceeding
   - Report back on outcome: "Your suggestion worked" or "Still seeing issue X"
   - Don't partially implement advice without confirming understanding

Remember: The expert provides iterative guidance during development. Unlike the reviewer who sees finished tests, the expert helps you build them correctly from the start.

**Follow the Spock/Groovy Specific Idioms:**

1. **Use idiomatic Groovy**:
   - Use Groovy truth: `if (result)` not `if (result == true)`
   - In then blocks: use `result` not `result == true`, use `!result` not `result == false`
   - For collections: use `!list.isEmpty()` or simply `list` to check non-empty

2. **Understand Spock's interaction model**:
   ```groovy
   // ❌ WRONG: Stubbing in given, then verifying in then
   given:
   mockService.method() >> returnValue

   then:
   1 * mockService.method() // FAILS - interaction already consumed

   // ✅ CORRECT: Combine stubbing and verification in then
   then:
   1 * mockService.method() >> returnValue
   ```
   - Stubbing defines behaviour; interaction verification counts method calls
   - These are separate concerns that must be handled correctly

3. **Type safety in interactions**:
   ```groovy
   // Type-safe argument constraints
   1 * service.process(_ as String, _ as List<Item>)

   // Closure parameter with type
   1 * service.process({ String param -> param.length() > 0 })

   // Avoid overly permissive wildcards
   1 * service.process(!null, { List list -> list.size() > 0 }) // ✅ Specific
   1 * service.process(_, _) // ❌ Too permissive
   ```

4. **Exception testing patterns**:
   ```groovy
   then:
   def ex = thrown(IllegalArgumentException)
   ex.message.contains("expected pattern")
   ex.cause instanceof SpecificCause
   ```

5. **Interaction ordering**:
   ```groovy
   when:
   service.processSteps()

   then: "first step completes"
   1 * dependency.stepOne()

   then: "second step follows"
   1 * dependency.stepTwo()
   ```

6. **Common Spock patterns**:
   - Use `thrown()` for exception testing
   - Use `0 * _` to verify no unexpected interactions
   - Use `@Unroll` with descriptive test names for where clauses (Spock 1.x, optional in 2.x)
   - Prefer `where:` blocks over multiple similar test methods

7. **Mock vs Stub vs Spy**:
   - **Mock**: When you need to verify interactions (`1 * service.method()`)
   - **Stub**: When you only need canned responses (`service.method() >> "response"`)
   - **Spy**: When testing partial mocks of real objects (use sparingly)

8. **Advanced features**:
   ```groovy
   @Shared // Expensive setup shared across all feature methods
   TestContainer container

   def setup() { // Per feature method - lightweight setup
       mockService = Mock(Service)
   }

   // Conditional test execution
   @Requires({ System.getProperty("integration.enabled") })
   @IgnoreIf({ os.windows })
   @PendingFeature(reason = "Waiting for API fix")
   ```

9. **Complex response generators**:
   ```groovy
   service.process(_) >> { args ->
       String input = args[0]
       return input.length() > 5 ? "long" : "short"
   }
   ```

**Test Completion Checklist:**

Before considering tests complete, verify:
□ All tests pass consistently
□ No compilation errors or warnings (checked via MCP lint)
□ Coverage includes all critical paths and edge cases
□ Tests follow DDT patterns where appropriate
□ Test names clearly describe what is being tested
□ No debug code or print statements remain
□ spock-test-reviewer has approved the tests
□ Any reviewer recommendations have been implemented or justified
□ Tests express desired behaviour, not current implementation bugs
□ All assertion helpers are used appropriately for readability

**Final Review Report**

After all iterations with the spock-test-reviewer, you MUST present the final review summary to the user including:

1. **Compliance Score**: The reviewer's final compliance score (e.g., "95/100 - Excellent compliance with methodology")
2. **Review Summary**: Brief summary of the reviewer's final assessment
3. **Key Strengths**: What the reviewer highlighted as particularly well done
4. **Implemented Recommendations**: List of reviewer suggestions that were implemented
5. **Justified Deviations**: Any recommendations not followed with justification
6. **Coverage Metrics**: Final test coverage achieved
7. **Final Approval Status**: Whether the reviewer has given full approval
