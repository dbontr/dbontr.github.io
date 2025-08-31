# Privacy Policy

Last updated: 8/31/25

## Introduction
This Privacy Policy explains how Codebuilder (“we,” “our,” or “us”) handles information when you use our tools, repository, and related services. Our goal is to be transparent and ensure your trust by keeping your data safe, private, and under your control.

## What Information We Collect
We do not collect personal information directly through the Codebuilder system. However, when you use Codebuilder in combination with GitHub, GitHub’s services may provide:
- Repository data (code, configuration files, issues, pull requests).
- User metadata (your GitHub username, commits, issue comments).
- Run results (lint/type/test results, coverage reports, logs).

We do not store or share this data outside your GitHub repository and your local runner environment.

## How Information Is Used
- To apply patches, run tests, and improve your code in iterative loops.
- To create and update GitHub Issues, Pull Requests, and labels as part of the development workflow.
- To provide runresult JSON feedback and backtracking decisions.

All processing is performed locally on your machine or within GitHub’s platform. No third-party servers receive your code or repository content through Codebuilder.

## Data Sharing
We do not sell, rent, or share your data with third parties.
Your code and metadata remain within:
- Your GitHub account (private or public repositories).
- Your local machine where the runner is installed.

The only external service used is GitHub’s API, which you already authorize via a Personal Access Token (PAT). Access is limited to the repository where Codebuilder is active.

## Security
- All communication with GitHub is done over HTTPS.
- Personal Access Tokens are stored locally in environment variables or configuration files you control.
- Sandboxes and test environments are created on your own machine and are not shared externally.

You are responsible for maintaining the security of your GitHub account and local machine.

## Your Control
- You may revoke access by deleting your GitHub PAT or restricting its scopes.
- You can remove Codebuilder-related Issues, Pull Requests, branches, and comments at any time.
- You may delete the runner and related configuration files locally.

## Changes to This Policy
We may update this Privacy Policy periodically. Updates will be committed to the repository with version control so you can always track changes.

## Contact
For questions about this policy, please open an Issue in the repository or contact the maintainer at:
dbontr
