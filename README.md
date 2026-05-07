# playwright-cli

CLI Tutorial for Playwright

## GOAL

Learn the basics of Playwright automation using CLI. The current problem is that MCP is token-inefficient.
For a given call, the MCP returns full accessibility tree, tool schemas, page metadata, and console logs. All of which adds to the token consumption.

The CLI returns compact references for each element on the page. The element gets a "deterministic" reference.

## ACTIONS

1. Install latest playwright globally - `npm init playwright@latest` (the language to select is either TS or JS).
2. Install CLI - `npm install -g @playwright/cli@latest`.
3. Install Skills - `playwright-cli install --skills`.
4. Work through the prompts below.

Reference material: `https://github.com/microsoft/playwright-cli`

## PROMPTS

1. Start with a simple prompt, like: `Navigate to <url> using playwright-cli`.
2. Test Plan: `Generate a test plan for the following <url> and store it in the ./test_deliverables directory`.
3. Test Strategy: `Generate a comprehensive test strategy with critical user journeys and store it in the ./test_deliverables directory`.
4. Test generation for a critical path: `Explore the website, identify the most critical user workflow, .then generate tests`
5. Run the tests: `playwright-cli run_tests <folder_name> or <test_name>`
6. Test results for the given work: `Generate a report for the test results and provide actionable next-steps`

## USING THE AGENT

The `/create-agent` command in Playwright is utilized to generate a new Playwright Test Agent. This command is essential for automating various aspects of test management and execution.

Install the agent: `npx playwright init-agents --loop=vscode`

### Types of Agents

The command can create one of the following types of agents:

* Planner: Generates structured test plans based on feature descriptions.
* Generator: Converts the generated test plans into runnable Playwright test files.
* Healer: Analyzes and fixes failing tests automatically.

### Functionality

* Automation: The agents streamline the process of creating, managing, and debugging test plans and test files.
* Integration: They can be used independently or in sequence to enhance test coverage and efficiency.
* Ease of Use: By using natural language commands, users can quickly generate test plans and corresponding tests without extensive manual coding.
* The `/create-agent` command is a powerful tool for improving the workflow of QA engineers and developers by making test automation more efficient and less manual.

## USING THE SKILL

Create the skill to use, then have the agent summon it with a prompt: `use <skill name>`

## DEMO URL

Product Store: `https://www.demoblaze.com/`

## SCOPE

Build out a comprehensive suite of tests using PW-CLI for Demo Product Store. It should cover the full spectrum of tests typical of an e-commerce web application. Follow POM best practices.

Time started: 16:00 EST
TIme finished:
