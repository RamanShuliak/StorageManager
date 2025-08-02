namespace StorageManagerServer.Domain.Entities;

public class Balance : BaseEntity
{
    public int Amount { get; set; }

    public Guid ResourceId { get; set; }
    public Resource? Resource { get; set; }

    public Guid MeasureId { get; set; }
    public Measure? Measure { get; set; }
}
