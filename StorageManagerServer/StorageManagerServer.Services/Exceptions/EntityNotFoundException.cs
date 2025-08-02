namespace StorageManagerServer.Services.Exceptions;

public class EntityNotFoundException : Exception
{
    public string EntityType { get; set; }
    public string ParamName { get; set; }
    public string ParamValue { get; set; }

    public EntityNotFoundException(
        string entityType,
        string paramName,
        string paramValue,
        string? message = null)
    : base(message ?? $"{entityType} with {paramName} = '{paramValue}' not found in database.")
    {
        EntityType = entityType;
        ParamName = paramName;
        ParamValue = paramValue;
    }
}
