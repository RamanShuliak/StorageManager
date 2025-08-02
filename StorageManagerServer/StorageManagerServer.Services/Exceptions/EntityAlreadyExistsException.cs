namespace StorageManagerServer.Services.Exceptions;

public class EntityAlreadyExistsException : Exception
{
    public string EntityType { get; set; }
    public string ParamName { get; set; }
    public string ParamValue { get; set; }

    public EntityAlreadyExistsException(
        string entityType,
        string paramName,
        string paramValue,
        string? message = null)
    : base(message ?? $"{entityType} with {paramName} = '{paramValue}' already exists.")
    {
        EntityType = entityType;
        ParamName = paramName;
        ParamValue = paramValue;
    }
}
