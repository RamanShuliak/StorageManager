namespace StorageManagerServer.Domain.Entities;

public class ShipmentResource : BaseEntity
{
    public int Amount { get; set; }

    public Guid ResourceId { get; set; }
    public required Resource Resource { get; set; }

    public Guid MeasureId { get; set; }
    public required Measure Measure { get; set; }

    public Guid DocumentId { get; set; }
    public required ShipmentDocument Document { get; set; }
}
