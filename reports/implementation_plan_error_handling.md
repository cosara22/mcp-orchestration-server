# Implementation Plan - Error Handling & Resilience

## Goal Description
Enhance the MCP Orchestration Server's resilience by implementing robust error handling mechanisms. This includes automatic retries for failed tasks, a Dead Letter Queue (DLQ) for unrecoverable errors, and timeout monitoring for tasks that hang or where agents crash.

## User Review Required
> [!IMPORTANT]
> **Breaking Change**: The `Task` interface will be updated. Existing tasks in Redis (if any) might lack the new fields (`retry_count`, `max_retries`). A Redis flush might be required or we handle backward compatibility gracefully.

## Proposed Changes

### mcp-server

#### [MODIFY] [src/index.ts](file:///c:/Users/zeroz/Orchestrations/mcp-server/src/index.ts)

1.  **Update `Task` Interface**:
    *   Add `retry_count: number` (default 0)
    *   Add `max_retries: number` (default 3)
    *   Add `started_at: string | null` (to track timeout)
    *   Add `timeout_seconds: number` (default 300 aka 5 mins)

2.  **Update `create_task`**:
    *   Initialize new fields.
    *   Allow overriding `max_retries` and `timeout_seconds` via input.

3.  **Update `submit_result`**:
    *   If `status` is `failed`:
        *   Check if `retry_count < max_retries`.
        *   If yes: Increment `retry_count`, reset status to `pending`, and re-push to the agent's queue (Head of queue for immediate retry, or Tail).
        *   If no: Mark status as `failed` (or `dead_letter`), and push to `queue:dead-letter`.

4.  **Implement `monitorTaskTimeouts`**:
    *   A background function running every X seconds (e.g., 60s).
    *   Scan active tasks (or keep a separate set of active task IDs).
    *   If `now - started_at > timeout_seconds`:
        *   Treat as failure (timeout).
        *   Apply retry logic (same as `submit_result` failure).

5.  **Add `get_dead_letter_tasks` Tool**:
    *   Allow Orchestrator to view failed tasks in DLQ.

## Verification Plan

### Automated Tests
Since there are no existing unit tests setup in the file list, we will verify by running the server and simulating agent behaviors.

### Manual Verification
1.  **Retry Test**:
    *   Create a task.
    *   Have an agent pick it up and call `submit_result` with `failed`.
    *   Verify task goes back to `pending` and `retry_count` increases.
    *   Repeat until `max_retries`.
    *   Verify task goes to DLQ.

2.  **Timeout Test**:
    *   Create a task with short timeout (e.g., 10s).
    *   Have agent pick it up but do nothing.
    *   Wait > 10s.
    *   Verify task is re-queued or moved to DLQ.
