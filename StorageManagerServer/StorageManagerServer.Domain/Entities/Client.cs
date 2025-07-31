namespace StorageManagerServer.Domain.Entities;

public class Client : BaseEntity
{
    public required string Name { get; set; }
    public required string Address { get; set; }
    public bool IsArchived { get; set; }

    public List<ShipmentDocument> ShipmentDocuments { get; set; } = new List<ShipmentDocument>();
}
