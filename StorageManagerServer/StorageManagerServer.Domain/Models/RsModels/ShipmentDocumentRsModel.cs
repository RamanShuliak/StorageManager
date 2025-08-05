namespace StorageManagerServer.Domain.Models.RsModels;

public class ShipmentDocumentRsModel
{
    public Guid Id { get; set; }
    public required string Number { get; set; }
    public DateTime ShipmentDate { get; set; }
    public bool IsSigned { get; set; }
    public Guid ClientId { get; set; }
    public required string ClientName { get; set; }

    public List<ShipmentResourceRsModel> Resources { get; set; } = new List<ShipmentResourceRsModel>();
}
