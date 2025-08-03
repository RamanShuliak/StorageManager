namespace StorageManagerServer.Domain.Models.RqModels;

public class UpdateShipmentDocumentRqModel
{
    public Guid Id { get; set; }
    public required string Number { get; set; }
    public DateTime ShipmentDate { get; set; }
    public bool IsSigned { get; set; }
    public Guid ClientId { get; set; }

    public List<CreateShipmentResourceRqModel> CreateResources { get; set; } = new List<CreateShipmentResourceRqModel>();
    public List<UpdateShipmentResourceRqModel> UpdateResources { get; set; } = new List<UpdateShipmentResourceRqModel>();
    public List<Guid> DeleteResourceIds { get; set; } = new List<Guid>();
}
