namespace StorageManagerServer.Domain.Models.RqModels;

public class CreateShipmentDocumentRqModel
{
    public required string Number { get; set; }
    public DateTime ShipmentDate { get; set; }
    public Guid ClientId { get; set; }
    public List<CreateShipmentResourceRqModel> Resources { get; set; } = new List<CreateShipmentResourceRqModel>();
}
