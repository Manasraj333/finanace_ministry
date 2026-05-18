import { getDb } from '@/lib/db/client'
import type { AuditAction } from '@/lib/audit/logger'

export interface AuditLogEntry {
    action: AuditAction
    resource_type: string
    resource_id?: string
    details?: Record<string, unknown>
    user_id: string
    user_email: string
    user_role?: string
    ip_address?: string | null
    user_agent?: string | null
}

export async function writeAuditLog(entry: AuditLogEntry): Promise<{ success: boolean; id?: string }> {
    try {
        const db = await getDb()
        const result = await db.collection('audit_logs').insertOne({
            ...entry,
            created_at: new Date(),
        })
        return { success: true, id: result.insertedId.toString() }
    } catch (error) {
        console.error('Error writing audit log:', error)
        return { success: false }
    }
}
