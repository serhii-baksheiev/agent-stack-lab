# Implementation Plan: Local subscriptions

**Branch**: `001-local-subscriptions` | **Date**: 2026-09-14 | **Spec**: [spec.md](spec.md)

## Summary

Implement one pure JavaScript function and keep all persistence with its caller.
Use a linear search for duplicate addresses; the fixed small fixture does not
justify a database, index, service, or schema language.

## Technical Context

Language: JavaScript ES modules, Node 24. Dependencies: none. Storage: caller's
array/JSON only. Testing: Node assertions and shared contract runner. Target:
local Linux/Windows Node runtime. Performance: one bounded linear scan, with
no production throughput target inferred. Scope: one domain operation.

## Constitution Check

Before design: fixed contract, no I/O or secrets, immutable input, explicit tests.
After design: all remain satisfied; no complexity exception required.

## Project Structure

`src/subscriptions.mjs`, `tests/subscriptions.test.mjs`, and this feature's
specification, research, data model, contract, quickstart and tasks documents.
The C design context supplies visual intent but is not copied implementation.

## Research and design

See [research.md](research.md), [data-model.md](data-model.md), and
[contract](contracts/subscribe.md). All unknown product choices were resolved
by the synthetic brief; no unsupported native service is assumed.
