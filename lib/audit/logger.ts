export type AuditAction =
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'export'
    | 'config_change'
    | 'ai_analysis_triggered'
    | 'ai_insight_approved'
    | 'ai_insight_rejected'

interface LogEntry {
    action: AuditAction
    resource_type: string
    resource_id?: string
    details?: Record<string, unknown>
}

export const logger = {
    async log(entry: LogEntry) {
        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entry)
            })

            if (!response.ok) {
                console.error("Failed to write audit log to MongoDB:", await response.text())
            }
        } catch (e) {
            console.error("Audit logging exception (MongoDB):", e)
        }
    }
}
