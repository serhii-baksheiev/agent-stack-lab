## Purpose

Provide duplicate-safe local subscription records for a synthetic form using explicit, portable caller-owned state.

## ADDED Requirements

### Requirement: B-R1 Normalize and validate email
The transition MUST accept only string email, trim outer whitespace, lowercase, and enforce `^[^\s@]+@[^\s@]+\.[^\s@]+$` with at most 254 characters after normalization. Invalid input MUST throw TypeError without changing state.

#### Scenario: Invalid email
- **WHEN** input is non-string, malformed, or more than 254 normalized characters
- **THEN** TypeError is thrown and input state remains unchanged

#### Scenario: Normalized boundary input
- **WHEN** a valid email has outer whitespace or uppercase letters, including a normalized value of exactly 254 characters
- **THEN** it is accepted in trimmed lowercase form

### Requirement: B-R2 Duplicate identity
An existing normalized email MUST return its existing record and ID with `created:false` and no additional record.

#### Scenario: Repeated casing variant
- **WHEN** an existing email is submitted with different casing and outer whitespace
- **THEN** the existing record is returned with unchanged ID and count

### Requirement: B-R3 Immutable creation
A new email MUST return `created:true`, a record with ID `sub-N` where N equals prior state length plus one, and a new state array without mutating input records.

#### Scenario: First and second creation
- **WHEN** two distinct valid emails are submitted in sequence
- **THEN** their IDs are sub-1 and sub-2 and previous arrays and records remain unchanged

### Requirement: B-R4 Deterministic separation
Distinct normalized emails MUST stay separate. The transition MUST depend only on its arguments and use no time, randomness, filesystem, network, or hidden global state.

#### Scenario: Repeated transition from identical state
- **WHEN** identical valid inputs are evaluated independently
- **THEN** their outputs are deeply equal and different emails occupy distinct records

### Requirement: B-R5 Restart portability
Returned state MUST round-trip through JSON and support duplicate detection in a freshly imported module.

#### Scenario: Replay after restart
- **WHEN** the caller serializes and restores state then resubmits an existing email to a fresh import
- **THEN** the existing ID is returned and no record is added

### Requirement: B-R6 Reviewable delivery evidence
The change MUST retain proposal, architecture, specification, tasks, traceability, review and acceptance evidence with authorship stated.

#### Scenario: Independent review
- **WHEN** a reviewer inspects the fixture and recorded test outputs
- **THEN** each requirement maps to a task, implementation or artifact, and verification evidence
