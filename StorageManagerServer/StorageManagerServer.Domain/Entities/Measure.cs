namespace StorageManagerServer.Domain.Entities;

public class Measure : BaseEntity
{
    public required string Name { get; set; }
    public bool IsArchived { get; set; }

    public List<Balance> Balances { get; set; } = new List<Balance>();
    public List<ReceiptResource> ReceiptResources { get; set; } = new List<ReceiptResource>();
    public List<ShipmentResource> ShipmentResources { get; set; } = new List<ShipmentResource>();
}
