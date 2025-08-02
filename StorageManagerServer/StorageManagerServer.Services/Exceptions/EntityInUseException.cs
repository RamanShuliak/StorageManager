namespace StorageManagerServer.Services.Exceptions;

public class EntityInUseException : Exception
{
    public string EntityType { get; set; }
    public Guid EntityId { get; set; }
    public EntityInUseException(
        string entityType,
        Guid entityId,
        string? message = null)
    : base(message ?? $"{entityType} with Id = '{entityId}' is used in the system.")
    {
        EntityType = entityType;
        EntityId = entityId;
    }
}
