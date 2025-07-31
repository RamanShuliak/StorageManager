namespace StorageManagerServer.Services.Exceptions;

public class EntityHasIncludesException : Exception
{
    public EntityHasIncludesException(string message)
    : base(message)
    {
    }
}
