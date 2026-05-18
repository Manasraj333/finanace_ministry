export function mapMongoDoc<T>(doc: any): T | null {
    if (!doc) return null
    const { _id, ...rest } = doc
    return {
        ...rest,
        id: _id?.toString?.() ?? String(_id),
    } as unknown as T
}

export function mapMongoDocs<T>(docs: any[]): T[] {
    return docs.map((doc) => mapMongoDoc<T>(doc)!).filter(Boolean)
}
