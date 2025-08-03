namespace StorageManagerServer.Domain.Entities;

public class ShipmentDocument : BaseEntity
{
    public required string Number { get; set; }
    public DateTime ShipmentDate { get; set; }
    public bool IsSigned { get; set; }

    public Guid ClientId { get; set; }
    public Client? Client { get; set; }

    public List<ShipmentResource> ShipmentResources { get; set; } = new List<ShipmentResource>();
}
