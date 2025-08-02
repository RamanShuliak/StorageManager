namespace StorageManagerServer.Services.Exceptions;

public class BalanceNotFoundException : Exception
{
    public Guid ResourceId { get; set; }
    public Guid MeasureId { get; set; }

    public BalanceNotFoundException(
        Guid resourceId,
        Guid measureId,
        string? message = null)
    : base(message ?? $"Balance with ResourceId = '{resourceId}' and MeasureId = '{measureId}' not found in database.")
    {
        ResourceId = resourceId;
        MeasureId = measureId;
    }
}
